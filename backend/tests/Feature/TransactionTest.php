<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private function createProductWithIngredients(User $user, string $name, float $sellingPrice, float $yieldQty, array $ingredients): Product
    {
        $product = $user->products()->create([
            'name' => $name,
            'selling_price' => $sellingPrice,
            'yield_qty' => $yieldQty,
        ]);

        foreach ($ingredients as $ing) {
            $product->ingredients()->create($ing);
        }

        return $product;
    }

    public function test_user_can_create_transaction_and_total_and_profit_are_calculated_correctly(): void
    {
        $user = User::factory()->create();

        // Produk 1: Jual 18.000, Modal 8.500
        $product1 = $this->createProductWithIngredients($user, 'Es Kopi Susu', 18000, 1, [
            ['name' => 'Kopi', 'price' => 3500],
            ['name' => 'Susu', 'price' => 3000],
            ['name' => 'Gula Aren', 'price' => 2000],
        ]);

        // Produk 2: Jual 5.000, Modal 3.000 (total bahan 6.000 / yield 2)
        $product2 = $this->createProductWithIngredients($user, 'Roti Panggang Mini', 5000, 2, [
            ['name' => 'Roti Tawar', 'price' => 4000],
            ['name' => 'Selai', 'price' => 2000],
        ]);

        $payload = [
            'payment_method' => 'QRIS',
            'items' => [
                ['product_id' => $product1->id, 'qty' => 2], // 2 x 18.000 = 36.000 (Modal 17.000 -> Untung 19.000)
                ['product_id' => $product2->id, 'qty' => 1], // 1 x 5.000 = 5.000 (Modal 3.000 -> Untung 2.000)
            ],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.total', 41000)
            ->assertJsonPath('data.total_cost', 20000)
            ->assertJsonPath('data.profit', 21000)
            ->assertJsonPath('data.payment_method', 'QRIS')
            ->assertJsonPath('data.items_count', 2)
            ->assertJsonPath('data.items.0.subtotal_price', 36000)
            ->assertJsonPath('data.items.0.subtotal_profit', 19000)
            ->assertJsonPath('data.items.1.subtotal_price', 5000)
            ->assertJsonPath('data.items.1.subtotal_profit', 2000);

        $this->assertNotEmpty($response->json('data.uuid'));
        $this->assertNotEmpty($response->json('data.paid_at'));

        $this->assertDatabaseHas('transactions', [
            'user_id' => $user->id,
            'total' => 41000,
            'payment_method' => 'QRIS',
        ]);

        $this->assertDatabaseCount('transaction_items', 2);
    }

    public function test_client_cannot_tamper_unit_price_or_cost(): void
    {
        $user = User::factory()->create();

        $product = $this->createProductWithIngredients($user, 'Kopi Hitam', 10000, 1, [
            ['name' => 'Kopi Bubuk', 'price' => 4000],
        ]);

        // Client mencoba mengirim unit_price Rp1 dan unit_cost Rp999.999
        $payload = [
            'items' => [
                [
                    'product_id' => $product->id,
                    'qty' => 1,
                    'unit_price' => 1,
                    'unit_cost' => 999999,
                ],
            ],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions', $payload);

        $response->assertStatus(201);
        // Server tetap menggunakan harga produk (10.000) dan modal HPP (4.000)
        $this->assertEquals(10000, (float) $response->json('data.items.0.unit_price'));
        $this->assertEquals(4000, (float) $response->json('data.items.0.unit_cost'));
        $this->assertEquals(6000, (float) $response->json('data.profit'));
    }

    public function test_snapshot_integrity_does_not_change_after_ingredient_or_product_price_update(): void
    {
        $user = User::factory()->create();

        $product = $this->createProductWithIngredients($user, 'Croissant', 15000, 1, [
            ['name' => 'Mentega', 'price' => 6000],
            ['name' => 'Tepung Terigu', 'price' => 3000],
        ]);

        // Buat transaksi awal
        $res = $this->actingAs($user, 'sanctum')->postJson('/api/transactions', [
            'items' => [
                ['product_id' => $product->id, 'qty' => 2], // Total 30.000, Modal 18.000, Untung 12.000
            ],
        ]);
        $res->assertStatus(201);
        $transactionId = $res->json('data.id');

        // Ubah harga jual produk dan harga bahan baku di masa depan
        $product->update(['selling_price' => 25000]);
        $product->ingredients()->delete();
        $product->ingredients()->create(['name' => 'Mentega Mahal', 'price' => 15000]);

        // Panggil endpoint GET detail transaksi
        $detailRes = $this->actingAs($user, 'sanctum')
            ->getJson("/api/transactions/{$transactionId}");

        $detailRes->assertStatus(200);
        // Nilai transaksi lama HARUS tetap konsisten (snapshot tidak berubah)
        $this->assertEquals(30000, (float) $detailRes->json('data.total'));
        $this->assertEquals(18000, (float) $detailRes->json('data.total_cost'));
        $this->assertEquals(12000, (float) $detailRes->json('data.profit'));
        $this->assertEquals(15000, (float) $detailRes->json('data.items.0.unit_price'));
        $this->assertEquals(9000, (float) $detailRes->json('data.items.0.unit_cost'));
    }

    public function test_user_a_cannot_create_transaction_with_product_belonging_to_user_b(): void
    {
        $userA = User::factory()->create(['phone' => '081234567890']);
        $userB = User::factory()->create(['phone' => '089876543210']);

        $productB = $this->createProductWithIngredients($userB, 'Produk Milik User B', 20000, 1, [
            ['name' => 'Bahan B', 'price' => 10000],
        ]);

        // User A mencoba checkout produk milik User B
        $response = $this->actingAs($userA, 'sanctum')
            ->postJson('/api/transactions', [
                'items' => [
                    ['product_id' => $productB->id, 'qty' => 1],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.product_id']);

        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_user_a_cannot_read_transaction_belonging_to_user_b(): void
    {
        $userA = User::factory()->create(['phone' => '081234567890']);
        $userB = User::factory()->create(['phone' => '089876543210']);

        $productB = $this->createProductWithIngredients($userB, 'Produk B', 20000, 1, [
            ['name' => 'Bahan B', 'price' => 10000],
        ]);

        $createRes = $this->actingAs($userB, 'sanctum')->postJson('/api/transactions', [
            'items' => [
                ['product_id' => $productB->id, 'qty' => 1],
            ],
        ]);
        $transactionId = $createRes->json('data.id');

        // User A mencoba melihat detail transaksi milik User B
        $response = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/transactions/{$transactionId}");

        $response->assertStatus(404);

        // User A memuat daftar transaksi, tidak boleh ada transaksi User B
        $listRes = $this->actingAs($userA, 'sanctum')
            ->getJson('/api/transactions?date=all');

        $listRes->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_validation_fails_when_items_is_empty(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions', [
                'items' => [],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items']);
    }

    public function test_validation_fails_when_qty_is_invalid(): void
    {
        $user = User::factory()->create();
        $product = $this->createProductWithIngredients($user, 'Produk Tes', 10000, 1, [
            ['name' => 'Bahan', 'price' => 5000],
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions', [
                'items' => [
                    ['product_id' => $product->id, 'qty' => 0],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.qty']);
    }

    public function test_product_without_modal_is_rejected_with_friendly_indonesian_message(): void
    {
        $user = User::factory()->create();

        // Produk tanpa bahan baku sama sekali (HPP = 0)
        $productTanpaModal = $user->products()->create([
            'name' => 'Kopi Misterius',
            'selling_price' => 15000,
            'yield_qty' => 1,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions', [
                'items' => [
                    ['product_id' => $productTanpaModal->id, 'qty' => 1],
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['items.0.product_id']);

        $errors = $response->json('errors');
        $errorMessage = $errors['items.0.product_id'][0] ?? '';
        $this->assertStringContainsString('Kopi Misterius', $errorMessage);
        $this->assertStringContainsString('belum memiliki modal HPP', $errorMessage);
        $this->assertStringContainsString('Katalog & HPP', $errorMessage);
    }

    public function test_user_can_filter_transactions_by_date(): void
    {
        $user = User::factory()->create();
        $product = $this->createProductWithIngredients($user, 'Kopi Susu', 15000, 1, [
            ['name' => 'Kopi', 'price' => 5000],
        ]);

        // Transaksi hari ini
        $this->actingAs($user, 'sanctum')->postJson('/api/transactions', [
            'paid_at' => now()->toDateTimeString(),
            'items' => [['product_id' => $product->id, 'qty' => 1]],
        ])->assertStatus(201);

        // Transaksi 3 hari lalu
        $pastDate = now()->subDays(3)->format('Y-m-d');
        $this->actingAs($user, 'sanctum')->postJson('/api/transactions', [
            'paid_at' => "{$pastDate} 10:00:00",
            'items' => [['product_id' => $product->id, 'qty' => 2]],
        ])->assertStatus(201);

        // Default query (hari ini) harus memuat 1 transaksi
        $resToday = $this->actingAs($user, 'sanctum')->getJson('/api/transactions');
        $resToday->assertStatus(200)->assertJsonCount(1, 'data');

        // Query tanggal 3 hari lalu harus memuat 1 transaksi
        $resPast = $this->actingAs($user, 'sanctum')->getJson("/api/transactions?date={$pastDate}");
        $resPast->assertStatus(200)->assertJsonCount(1, 'data');
    }
}
