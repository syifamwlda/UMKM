<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

class HealthScoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

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

    /**
     * 1. Rumus kalkulasi skor kesehatan usaha (40 margin + 30 konsistensi + 30 produk sehat).
     */
    public function test_health_score_calculation_formula_with_exact_weights(): void
    {
        $user = User::factory()->create();

        // 1) Produk: 2 produk, 1 sehat (50% margin) dan 1 tipis (10% margin)
        // Proporsi sehat = 1/2 = 50% => 50% * 30 poin = 15 poin
        $productSehat = $this->createProductWithIngredients($user, 'Kopi Gula Aren', 20000, 1, [
            ['name' => 'Biji Kopi & Susu', 'price' => 10000],
        ]); // Modal 10.000, Jual 20.000 => margin 50% (sehat)

        $productTipis = $this->createProductWithIngredients($user, 'Roti Bakar Tipis', 10000, 1, [
            ['name' => 'Roti & Mentega', 'price' => 9000],
        ]); // Modal 9.000, Jual 10.000 => margin 10% (tipis)

        // 2) Konsistensi 14 hari: Buat transaksi pada tepat 7 hari berbeda dalam 14 hari terakhir
        // Proporsi hari aktif = 7 / 14 = 50% => 50% * 30 poin = 15 poin
        // 3) Margin tertimbang: Setiap transaksi menjual 2x Kopi Gula Aren (Total Omzet 40.000, Modal 20.000, Margin 50%)
        // Margin 50% >= target 40% => 40 poin penuh
        for ($i = 0; $i < 7; $i++) {
            $trxDate = Carbon::today()->subDays($i)->setHour(12);

            $trx = $user->transactions()->create([
                'uuid' => (string) Str::uuid(),
                'total' => 40000,
                'paid_at' => $trxDate,
            ]);

            $trx->items()->create([
                'product_id' => $productSehat->id,
                'qty' => 2,
                'unit_price' => 20000,
                'unit_cost' => 10000,
            ]);
        }

        // Total skor teoritis: 40 (margin) + 15 (konsistensi) + 15 (produk sehat) = 70 poin (Label: Sehat)
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/health-score');

        $response->assertStatus(200)
            ->assertJsonPath('data.score', 70)
            ->assertJsonPath('data.label', 'Sehat')
            ->assertJsonPath('data.breakdown.margin_score', 40)
            ->assertJsonPath('data.breakdown.consistency_score', 15)
            ->assertJsonPath('data.breakdown.healthy_product_score', 15);

        // Pastikan menyertakan 2-3 alasan dan 2-3 saran
        $alasan = $response->json('data.alasan');
        $saran = $response->json('data.saran');
        $this->assertIsArray($alasan);
        $this->assertGreaterThanOrEqual(2, count($alasan));
        $this->assertLessThanOrEqual(3, count($alasan));

        $this->assertIsArray($saran);
        $this->assertGreaterThanOrEqual(2, count($saran));
        $this->assertLessThanOrEqual(3, count($saran));

        // Narasi tersedia dan memiliki field source
        $this->assertNotEmpty($response->json('data.narasi'));
        $this->assertContains($response->json('data.source'), ['ai', 'fallback']);
    }

    /**
     * 2. Integrasi narasi Gemini AI pada Health Score saat AI aktif.
     */
    public function test_health_score_with_gemini_ai_narrative(): void
    {
        $user = User::factory()->create();
        config([
            'services.gemini.key' => 'mock-gemini-key',
            'services.gemini.model' => 'gemini-1.5-flash',
        ]);

        $this->createProductWithIngredients($user, 'Kopi Tubruk', 15000, 1, [
            ['name' => 'Kopi', 'price' => 5000],
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Performa bisnis kedai Anda sangat prima dengan marjin yang kuat. Pertahankan pencatatan transaksi setiap hari agar pertumbuhan stabil.']
                            ]
                        ]
                    ]
                ]
            ], 200),
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/health-score');

        $response->assertStatus(200)
            ->assertJsonPath('data.source', 'ai')
            ->assertJsonPath('data.narasi', 'Performa bisnis kedai Anda sangat prima dengan marjin yang kuat. Pertahankan pencatatan transaksi setiap hari agar pertumbuhan stabil.');
    }

    /**
     * 3. Data kosong: Skor 0 dengan pesan ramah dan petunjuk memulai usaha.
     */
    public function test_health_score_empty_data_returns_zero_score_and_friendly_message(): void
    {
        $newUser = User::factory()->create();

        $response = $this->actingAs($newUser, 'sanctum')->getJson('/api/health-score');

        $response->assertStatus(200)
            ->assertJsonPath('data.score', 0)
            ->assertJsonPath('data.source', 'fallback');

        $alasan = $response->json('data.alasan');
        $saran = $response->json('data.saran');

        $this->assertIsArray($alasan);
        $this->assertGreaterThanOrEqual(2, count($alasan));
        $this->assertStringContainsString('Belum ada', $alasan[0]);

        $this->assertIsArray($saran);
        $this->assertGreaterThanOrEqual(2, count($saran));
        $this->assertStringContainsString('Katalog & HPP', $saran[0]);

        $this->assertStringContainsString('Belum ada aktivitas', $response->json('data.narasi'));
    }

    /**
     * 4. Isolasi user: Data transaksi dan produk User A tidak memengaruhi skor User B.
     */
    public function test_health_score_isolates_data_between_users(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // User A memiliki produk sehat dan 14 hari transaksi penuh
        $productA = $this->createProductWithIngredients($userA, 'Produk Andalan A', 30000, 1, [
            ['name' => 'Bahan A', 'price' => 15000],
        ]);

        for ($i = 0; $i < 14; $i++) {
            $trx = $userA->transactions()->create([
                'uuid' => (string) Str::uuid(),
                'total' => 30000,
                'paid_at' => Carbon::today()->subDays($i),
            ]);
            $trx->items()->create([
                'product_id' => $productA->id,
                'qty' => 1,
                'unit_price' => 30000,
                'unit_cost' => 15000,
            ]);
        }

        // Skor User A harus 100 (40 margin + 30 konsistensi 14 hari + 30 produk sehat)
        $resA = $this->actingAs($userA, 'sanctum')->getJson('/api/health-score');
        $resA->assertStatus(200)->assertJsonPath('data.score', 100);

        // Skor User B harus tetap 0 karena belum memiliki produk dan transaksi apapun
        $resB = $this->actingAs($userB, 'sanctum')->getJson('/api/health-score');
        $resB->assertStatus(200)->assertJsonPath('data.score', 0);
    }
}
