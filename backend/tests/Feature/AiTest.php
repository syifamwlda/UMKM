<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.gemini.key' => 'mock-gemini-key',
            'services.gemini.model' => 'gemini-1.5-flash',
            'services.gemini.url' => 'https://generativelanguage.googleapis.com/v1beta',
        ]);
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
     * 1. Sukses: GET /api/dashboard/stats menghasilkan insight dengan source "ai".
     */
    public function test_dashboard_stats_gemini_success(): void
    {
        $user = User::factory()->create();
        $this->createProductWithIngredients($user, 'Kopi Susu Mantap', 20000, 1, [
            ['name' => 'Biji Kopi', 'price' => 5000],
            ['name' => 'Susu Segar', 'price' => 5000],
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Hari ini omzet stabil dan menu kopi memiliki margin yang bagus. Pertahankan stok susu agar layanan kasir lancar.']
                            ]
                        ]
                    ]
                ]
            ], 200),
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonPath('data.insight.source', 'ai')
            ->assertJsonPath('data.insight.text', 'Hari ini omzet stabil dan menu kopi memiliki margin yang bagus. Pertahankan stok susu agar layanan kasir lancar.');
    }

    /**
     * 2. Sukses: GET /api/products/{id}/advice menghasilkan saran harga dengan source "ai".
     */
    public function test_product_price_advice_gemini_success(): void
    {
        $user = User::factory()->create();
        $product = $this->createProductWithIngredients($user, 'Croissant Coklat', 25000, 1, [
            ['name' => 'Tepung & Butter', 'price' => 12000],
            ['name' => 'Coklat Batang', 'price' => 6000],
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Harga jual Rp25.000 sudah menghasilkan margin 28% yang tergolong sehat. Anda bisa tetap mempertahankan harga ini untuk menjaga loyalitas pelanggan.']
                            ]
                        ]
                    ]
                ]
            ], 200),
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/products/{$product->id}/advice");

        $response->assertStatus(200)
            ->assertJsonPath('data.source', 'ai')
            ->assertJsonPath('data.product_id', $product->id)
            ->assertJsonPath('data.status', 'sehat')
            ->assertJsonPath('data.text', 'Harga jual Rp25.000 sudah menghasilkan margin 28% yang tergolong sehat. Anda bisa tetap mempertahankan harga ini untuk menjaga loyalitas pelanggan.');
    }

    /**
     * 3. Timeout: Panggilan API timeout menghasilkan fallback berbasis aturan.
     */
    public function test_ai_timeout_returns_heuristic_fallback(): void
    {
        $user = User::factory()->create();
        $product = $this->createProductWithIngredients($user, 'Nasi Goreng Rugi', 10000, 1, [
            ['name' => 'Beras & Bumbu', 'price' => 7000],
            ['name' => 'Daging Spesial', 'price' => 6000],
        ]); // Modal 13.000, Jual 10.000 -> Status rugi

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => fn () => throw new ConnectionException('Connection timed out after 8000ms'),
        ]);

        // Tes advice fallback saat timeout
        $adviceResponse = $this->actingAs($user, 'sanctum')->getJson("/api/products/{$product->id}/advice");
        $adviceResponse->assertStatus(200)
            ->assertJsonPath('data.source', 'fallback')
            ->assertJsonPath('data.status', 'rugi');

        // Tes dashboard stats fallback saat timeout
        $statsResponse = $this->actingAs($user, 'sanctum')->getJson('/api/dashboard/stats');
        $statsResponse->assertStatus(200)
            ->assertJsonPath('data.insight.source', 'fallback');
    }

    /**
     * 4. Respons kosong: Respons kandidat kosong dari Gemini menghasilkan fallback.
     */
    public function test_ai_empty_response_returns_fallback(): void
    {
        $user = User::factory()->create();
        $product = $this->createProductWithIngredients($user, 'Teh Manis', 5000, 1, [
            ['name' => 'Teh Celup & Gula', 'price' => 2000],
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => []
            ], 200),
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/products/{$product->id}/advice");

        $response->assertStatus(200)
            ->assertJsonPath('data.source', 'fallback')
            ->assertJsonPath('data.selling_price', 5000);
    }

    /**
     * 5. Cache hit: Panggilan kedua dengan data yang sama tidak memanggil HTTP lagi.
     */
    public function test_ai_caches_response_and_does_not_call_http_twice(): void
    {
        $user = User::factory()->create();
        $product = $this->createProductWithIngredients($user, 'Es Kopi Susu', 18000, 1, [
            ['name' => 'Espresso & Susu', 'price' => 9000],
        ]);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Margin 50% sangat ideal untuk produk minuman andalan ini.']
                            ]
                        ]
                    ]
                ]
            ], 200),
        ]);

        // Panggilan pertama -> trigger HTTP
        $res1 = $this->actingAs($user, 'sanctum')->getJson("/api/products/{$product->id}/advice");
        $res1->assertStatus(200)->assertJsonPath('data.source', 'ai');

        // Panggilan kedua -> cache hit, HTTP tidak dipanggil lagi
        $res2 = $this->actingAs($user, 'sanctum')->getJson("/api/products/{$product->id}/advice");
        $res2->assertStatus(200)->assertJsonPath('data.source', 'ai');

        Http::assertSentCount(1);
    }

    /**
     * 6. Isolasi antar user: User B tidak bisa mengakses advice produk milik User A.
     */
    public function test_user_cannot_access_advice_for_other_users_product(): void
    {
        $userA = User::factory()->create(['name' => 'Pemilik Kedai A']);
        $userB = User::factory()->create(['name' => 'Pemilik Kedai B']);

        $productA = $this->createProductWithIngredients($userA, 'Resep Rahasia Warung A', 30000, 1, [
            ['name' => 'Bumbu Rahasia', 'price' => 15000],
        ]);

        // User B mencoba mengakses saran harga produk User A
        $response = $this->actingAs($userB, 'sanctum')->getJson("/api/products/{$productA->id}/advice");

        $response->assertStatus(404);
    }

    /**
     * 7. Sukses: POST /api/ai/chat mengembalikan konsultasi bisnis dari Gemini AI.
     */
    public function test_ai_chat_returns_gemini_reply(): void
    {
        $user = User::factory()->create(['business_name' => 'Kedai Sejahtera']);

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'Fokuslah pada menu dengan margin tertinggi untuk meningkatkan laba harian.'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/ai/chat', [
            'message' => 'Bagaimana cara meningkatkan margin usaha saya?',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.source', 'gemini')
            ->assertJsonPath('data.reply', 'Fokuslah pada menu dengan margin tertinggi untuk meningkatkan laba harian.');
    }

    /**
     * 8. Fallback: POST /api/ai/chat mengembalikan fallback cerdas saat Gemini API offline/error.
     */
    public function test_ai_chat_fallback_on_network_failure(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://generativelanguage.googleapis.com/*' => Http::response(null, 500),
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/ai/chat', [
            'message' => 'Tips margin usaha yang sehat',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.source', 'fallback')
            ->assertJsonStructure(['data' => ['reply', 'source']]);
    }

    /**
     * 9. Validasi: POST /api/ai/chat wajib menyertakan message dan terautentikasi.
     */
    public function test_ai_chat_validation_and_auth(): void
    {
        // Unauthenticated -> 401
        $this->postJson('/api/ai/chat', ['message' => 'Halo'])->assertStatus(401);

        $user = User::factory()->create();

        // Empty message -> 422
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/ai/chat', ['message' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }
}

