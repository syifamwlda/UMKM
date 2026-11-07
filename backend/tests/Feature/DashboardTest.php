<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class DashboardTest extends TestCase
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

    public function test_user_can_fetch_dashboard_stats_with_correct_today_aggregations(): void
    {
        $user = User::factory()->create();

        // Produk 1: Jual 20.000, Modal 10.000 (Untung 10.000, Sehat)
        $product1 = $this->createProductWithIngredients($user, 'Kopi Susu Mantap', 20000, 1, [
            ['name' => 'Biji Kopi', 'price' => 5000],
            ['name' => 'Susu', 'price' => 5000],
        ]);

        // Produk 2: Jual 10.000, Modal 12.000 (Rugi 2.000, Rugi)
        $product2 = $this->createProductWithIngredients($user, 'Croissant Rugi', 10000, 1, [
            ['name' => 'Mentega Impor', 'price' => 8000],
            ['name' => 'Tepung Khusus', 'price' => 4000],
        ]);

        // Catat transaksi hari ini:
        // 2x Produk 1 = 40.000 (modal 20.000)
        // 1x Produk 2 = 10.000 (modal 12.000)
        // Total Omzet = 50.000, Total Modal = 32.000, Laba = 18.000, Margin = (18.000 / 50.000) * 100 = 36%
        $this->actingAs($user, 'sanctum')->postJson('/api/transactions', [
            'paid_at' => now()->toDateTimeString(),
            'items' => [
                ['product_id' => $product1->id, 'qty' => 2],
                ['product_id' => $product2->id, 'qty' => 1],
            ],
        ])->assertStatus(201);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonPath('data.today.omzet', 50000)
            ->assertJsonPath('data.today.modal', 32000)
            ->assertJsonPath('data.today.laba', 18000)
            ->assertJsonPath('data.today.transaksi_count', 1)
            ->assertJsonPath('data.today.margin_rata_rata', 36);
    }

    public function test_dashboard_trend_returns_7_days_with_zeros_for_empty_days(): void
    {
        $user = User::factory()->create();

        $product = $this->createProductWithIngredients($user, 'Teh Tarik', 10000, 1, [
            ['name' => 'Teh Bubuk', 'price' => 2000],
            ['name' => 'Susu Kental Manis', 'price' => 2000],
        ]);

        // Transaksi hari ini
        $this->actingAs($user, 'sanctum')->postJson('/api/transactions', [
            'paid_at' => now()->toDateTimeString(),
            'items' => [['product_id' => $product->id, 'qty' => 1]],
        ])->assertStatus(201);

        // Transaksi 3 hari lalu
        $threeDaysAgo = now()->subDays(3)->format('Y-m-d');
        $this->actingAs($user, 'sanctum')->postJson('/api/transactions', [
            'paid_at' => "{$threeDaysAgo} 14:00:00",
            'items' => [['product_id' => $product->id, 'qty' => 3]], // Omzet 30.000, modal 12.000, laba 18.000
        ])->assertStatus(201);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonCount(7, 'data.trend');

        $trend = collect($response->json('data.trend'));

        $todayTrend = $trend->firstWhere('date', now()->format('Y-m-d'));
        $this->assertNotNull($todayTrend);
        $this->assertEquals(10000, $todayTrend['omzet']);
        $this->assertEquals(6000, $todayTrend['laba']);

        $pastTrend = $trend->firstWhere('date', $threeDaysAgo);
        $this->assertNotNull($pastTrend);
        $this->assertEquals(30000, $pastTrend['omzet']);
        $this->assertEquals(18000, $pastTrend['laba']);

        // Hari tanpa transaksi harus bernilai 0
        $twoDaysAgo = now()->subDays(2)->format('Y-m-d');
        $emptyDayTrend = $trend->firstWhere('date', $twoDaysAgo);
        $this->assertNotNull($emptyDayTrend);
        $this->assertEquals(0, $emptyDayTrend['omzet']);
        $this->assertEquals(0, $emptyDayTrend['laba']);
    }

    public function test_dashboard_products_lists_unprofitable_products_at_the_top(): void
    {
        $user = User::factory()->create();

        // 1. Sehat (Margin 50%)
        $this->createProductWithIngredients($user, 'Kopi Sehat', 20000, 1, [
            ['name' => 'Bahan', 'price' => 10000],
        ]);

        // 2. Tipis (Margin 10%)
        $this->createProductWithIngredients($user, 'Roti Tipis', 10000, 1, [
            ['name' => 'Bahan', 'price' => 9000],
        ]);

        // 3. Rugi (Margin -20%)
        $this->createProductWithIngredients($user, 'Pastry Rugi', 10000, 1, [
            ['name' => 'Bahan', 'price' => 12000],
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(200);

        $products = $response->json('data.products');
        $this->assertCount(3, $products);

        // Yang rugi harus di urutan pertama
        $this->assertEquals('rugi', $products[0]['status']);
        $this->assertEquals('Pastry Rugi', $products[0]['name']);

        // Yang tipis di urutan kedua
        $this->assertEquals('tipis', $products[1]['status']);
        $this->assertEquals('Roti Tipis', $products[1]['name']);

        // Yang sehat di urutan ketiga
        $this->assertEquals('sehat', $products[2]['status']);
        $this->assertEquals('Kopi Sehat', $products[2]['name']);
    }

    public function test_dashboard_insight_provides_rule_based_fallback_source(): void
    {
        $user = User::factory()->create();

        $this->createProductWithIngredients($user, 'Menu Boncos', 10000, 1, [
            ['name' => 'Bahan Mahal', 'price' => 15000],
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonPath('data.insight.source', 'fallback')
            ->assertJsonStructure(['data' => ['insight' => ['headline', 'text', 'source']]]);

        $text = $response->json('data.insight.text');
        $this->assertStringContainsString('Menu Boncos', $text);
        $this->assertStringContainsString('margin minus', $text);
    }

    public function test_dashboard_isolates_data_between_users(): void
    {
        $userA = User::factory()->create(['phone' => '081111111111']);
        $userB = User::factory()->create(['phone' => '082222222222']);

        $productB = $this->createProductWithIngredients($userB, 'Produk B', 50000, 1, [
            ['name' => 'Bahan B', 'price' => 20000],
        ]);

        // User B membuat transaksi 500.000 hari ini
        $this->actingAs($userB, 'sanctum')->postJson('/api/transactions', [
            'paid_at' => now()->toDateTimeString(),
            'items' => [['product_id' => $productB->id, 'qty' => 10]],
        ])->assertStatus(201);

        // User A memuat dashboard stats miliknya
        $responseA = $this->actingAs($userA, 'sanctum')
            ->getJson('/api/dashboard/stats');

        $responseA->assertStatus(200)
            ->assertJsonPath('data.today.omzet', 0)
            ->assertJsonPath('data.today.laba', 0)
            ->assertJsonPath('data.today.transaksi_count', 0)
            ->assertJsonCount(0, 'data.products');
    }
}

