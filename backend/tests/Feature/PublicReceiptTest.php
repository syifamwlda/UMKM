<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicReceiptTest extends TestCase
{
    use RefreshDatabase;

    private function createTransactionWithProduct(): array
    {
        $user = User::factory()->create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'business_name' => 'Kedai Kopi Barokah',
            'business_type' => 'Kuliner & Minuman',
        ]);

        $product = $user->products()->create([
            'name' => 'Kopi Susu Gula Aren',
            'selling_price' => 18000,
            'yield_qty' => 1,
        ]);

        $product->ingredients()->createMany([
            ['name' => 'Biji Kopi Robusta', 'price' => 4000],
            ['name' => 'Susu Full Cream', 'price' => 3500],
            ['name' => 'Sirup Gula Aren', 'price' => 1500],
        ]); // Modal = 9.000, Jual = 18.000

        // Buat transaksi
        $uuid = (string) Str::uuid();
        $transaction = $user->transactions()->create([
            'uuid' => $uuid,
            'total' => 36000,
            'paid_at' => now(),
        ]);

        $transaction->items()->create([
            'product_id' => $product->id,
            'qty' => 2,
            'unit_price' => 18000,
            'unit_cost' => 9000,
        ]);

        return [$user, $transaction, $uuid];
    }

    /**
     * 1. Struk dapat diakses tanpa autentikasi dan TIDAK MEMBOCORKAN field sensitif.
     */
    public function test_public_receipt_can_be_viewed_without_auth_and_does_not_leak_sensitive_fields(): void
    {
        [$user, $transaction, $uuid] = $this->createTransactionWithProduct();

        // Akses tanpa token auth
        $response = $this->getJson("/api/public/receipts/{$uuid}");

        $response->assertStatus(200)
            ->assertJsonPath('data.business_name', 'Kedai Kopi Barokah')
            ->assertJsonPath('data.total', 36000)
            ->assertJsonPath('data.items.0.name', 'Kopi Susu Gula Aren')
            ->assertJsonPath('data.items.0.qty', 2)
            ->assertJsonPath('data.items.0.unit_price', 18000)
            ->assertJsonPath('data.items.0.subtotal', 36000);

        // Verifikasi ketat: field sensitif TIDAK PERNAH bocor
        $response->assertJsonMissingPath('data.phone')
            ->assertJsonMissingPath('data.profit')
            ->assertJsonMissingPath('data.total_profit')
            ->assertJsonMissingPath('data.total_cost')
            ->assertJsonMissingPath('data.cost')
            ->assertJsonMissingPath('data.user_id')
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.items.0.unit_cost')
            ->assertJsonMissingPath('data.items.0.cost')
            ->assertJsonMissingPath('data.items.0.profit')
            ->assertJsonMissingPath('data.items.0.id')
            ->assertJsonMissingPath('data.items.0.product_id')
            ->assertJsonMissingPath('data.items.0.transaction_id');

        // Pastikan nomor HP pemilik tidak ada dalam raw string response
        $this->assertStringNotContainsString('081234567890', $response->getContent());
        // Pastikan modal unit_cost (9000) tidak ada dalam response
        $this->assertStringNotContainsString('unit_cost', $response->getContent());
    }

    /**
     * 2. UUID tidak dikenal menghasilkan 404 dengan pesan ramah.
     */
    public function test_public_receipt_returns_404_with_friendly_message_for_unknown_uuid(): void
    {
        $response = $this->getJson('/api/public/receipts/00000000-0000-0000-0000-000000000000');

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Struk belanja tidak ditemukan atau tautan sudah tidak valid.',
            ]);
    }

    /**
     * 3. Endpoint struk publik menerapkan throttling 60 request per menit.
     */
    public function test_public_receipt_endpoint_is_throttled_at_60_requests_per_minute(): void
    {
        [$user, $transaction, $uuid] = $this->createTransactionWithProduct();

        // 60 request pertama diizinkan
        for ($i = 0; $i < 60; $i++) {
            $res = $this->getJson("/api/public/receipts/{$uuid}");
            $res->assertStatus(200);
        }

        // Request ke-61 harus terblokir dengan HTTP 429 Too Many Requests
        $res61 = $this->getJson("/api/public/receipts/{$uuid}");
        $res61->assertStatus(429);
    }
}

