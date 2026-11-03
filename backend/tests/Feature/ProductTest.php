<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_product_and_hpp_is_calculated_sehat(): void
    {
        $user = User::factory()->create();

        $payload = [
            'name' => 'Es Kopi Susu Aren',
            'selling_price' => 18000,
            'yield_qty' => 1,
            'ingredients' => [
                ['name' => 'Biji Kopi 18g', 'price' => 3500],
                ['name' => 'Susu UHT 120ml', 'price' => 3000],
                ['name' => 'Gula Aren 25ml', 'price' => 1000],
                ['name' => 'Cup & Tutup', 'price' => 1000],
            ],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Es Kopi Susu Aren')
            ->assertJsonPath('data.total_modal', 8500)
            ->assertJsonPath('data.modal_per_unit', 8500)
            ->assertJsonPath('data.margin_percent', 52.78)
            ->assertJsonPath('data.status', 'sehat');

        $this->assertDatabaseHas('products', [
            'user_id' => $user->id,
            'name' => 'Es Kopi Susu Aren',
        ]);

        $this->assertDatabaseCount('ingredients', 4);
    }

    public function test_product_with_yield_calculates_hpp_and_tipis_margin(): void
    {
        $user = User::factory()->create();

        // Total modal 45.000 / 10 porsi = modal per unit 4.500
        // Harga jual 5.000 -> untung 500 -> margin = (500 / 5000) * 100 = 10% (tipis)
        $payload = [
            'name' => 'Brownies Mini Loyang',
            'selling_price' => 5000,
            'yield_qty' => 10,
            'ingredients' => [
                ['name' => 'Cokelat Batang', 'price' => 20000],
                ['name' => 'Tepung & Telur', 'price' => 25000],
            ],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.total_modal', 45000)
            ->assertJsonPath('data.modal_per_unit', 4500)
            ->assertJsonPath('data.status', 'tipis');

        $margin = $response->json('data.margin_percent');
        $this->assertEquals(10.0, (float) $margin);
    }

    public function test_product_with_higher_modal_than_selling_price_has_rugi_status(): void
    {
        $user = User::factory()->create();

        // Modal 12.000, jual 10.000 -> margin negatif (rugi)
        $payload = [
            'name' => 'Paket Nasi Ayam Promo Rugi',
            'selling_price' => 10000,
            'yield_qty' => 1,
            'ingredients' => [
                ['name' => 'Ayam & Nasi', 'price' => 12000],
            ],
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'rugi');

        $margin = $response->json('data.margin_percent');
        $this->assertEquals(-20.0, (float) $margin);
    }

    public function test_user_can_only_list_their_own_products(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $productA = Product::create([
            'user_id' => $userA->id,
            'name' => 'Produk Milik User A',
            'selling_price' => 15000,
            'yield_qty' => 1,
        ]);
        $productA->ingredients()->create(['name' => 'Bahan A', 'price' => 5000]);

        $productB = Product::create([
            'user_id' => $userB->id,
            'name' => 'Produk Milik User B',
            'selling_price' => 25000,
            'yield_qty' => 1,
        ]);
        $productB->ingredients()->create(['name' => 'Bahan B', 'price' => 10000]);

        $response = $this->actingAs($userA, 'sanctum')
            ->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Produk Milik User A');
    }

    public function test_user_cannot_access_or_update_another_users_product(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $productB = Product::create([
            'user_id' => $userB->id,
            'name' => 'Produk Rahasia User B',
            'selling_price' => 50000,
            'yield_qty' => 1,
        ]);

        // User A mencoba melihat detail produk User B
        $response = $this->actingAs($userA, 'sanctum')
            ->getJson("/api/products/{$productB->id}");

        $response->assertStatus(404);

        // User A mencoba mengedit produk User B
        $updateResponse = $this->actingAs($userA, 'sanctum')
            ->putJson("/api/products/{$productB->id}", [
                'name' => 'Coba Retas Nama',
            ]);

        $updateResponse->assertStatus(404);
    }

    public function test_store_validation_errors_in_indonesian(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/products', [
                'name' => '',
                'selling_price' => -100,
                'yield_qty' => 0,
                'ingredients' => [],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'selling_price', 'yield_qty', 'ingredients'])
            ->assertJsonPath('errors.name.0', 'Nama produk wajib diisi.')
            ->assertJsonPath('errors.selling_price.0', 'Harga jual tidak boleh bernilai negatif.')
            ->assertJsonPath('errors.yield_qty.0', 'Jumlah porsi resep minimal 1.')
            ->assertJsonPath('errors.ingredients.0', 'Daftar bahan baku wajib disertakan.');
    }
}
