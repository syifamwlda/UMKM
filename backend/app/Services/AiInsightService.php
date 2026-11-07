<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class AiInsightService
{
    public function __construct(
        protected HppService $hppService
    ) {}

    /**
     * Menghasilkan insight harian untuk dashboard.
     * Menggunakan Gemini AI jika tersedia dan aktif, dengan fallback otomatis ke aturan heuristik.
     * Cache disimpan selama 6 jam per user dan hash data ringkasan.
     */
    public function dailyInsight(User $user, array $stats): array
    {
        $today = $stats['today'] ?? [];
        $products = $stats['products'] ?? [];

        $omzet = (float) ($today['omzet'] ?? 0);
        $laba = (float) ($today['laba'] ?? 0);
        $margin = (float) ($today['margin_rata_rata'] ?? 0);
        $count = (int) ($today['transaksi_count'] ?? 0);

        // Siapkan fallback berbasis aturan
        $fallback = $this->buildRuleBasedInsight($products, $omzet, $laba, $margin, $count);

        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $baseUrl = rtrim(config('services.gemini.url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        if (empty($apiKey)) {
            return $fallback;
        }

        // Cache key per user + hash data ringkasan (tanpa data pribadi)
        $hash = md5(json_encode([
            'omzet' => $omzet,
            'laba' => $laba,
            'margin' => $margin,
            'count' => $count,
            'products_count' => count($products),
            'first_product_status' => $products[0]['status'] ?? 'none',
        ]));

        $cacheKey = "gemini_daily_insight_{$user->id}_{$hash}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($apiKey, $model, $baseUrl, $omzet, $laba, $margin, $count, $products, $fallback) {
            try {
                // Rangkum data produk (hanya nama dan status margin, TANPA data pribadi/PII)
                $summaryList = [];
                foreach (array_slice($products, 0, 5) as $p) {
                    $summaryList[] = "- {$p['name']}: margin {$p['margin_percent']}% (status: {$p['status']})";
                }
                $productSummaryText = empty($summaryList) ? 'Belum ada produk terdaftar' : implode("\n", $summaryList);

                $prompt = "Anda adalah konsultan keuangan UMKM UntungJelas. Berikan saran bisnis singkat untuk pemilik warung/kedai.\n"
                    . "Instruksi wajib: Gunakan bahasa Indonesia santai dan akrab. Tepat 2 kalimat. HANYA gunakan angka yang tertera di data bawah ini, DILARANG MENGARANG angka baru.\n\n"
                    . "Data Hari Ini:\n"
                    . "- Omzet: Rp" . number_format($omzet, 0, ',', '.') . "\n"
                    . "- Untung Bersih: Rp" . number_format($laba, 0, ',', '.') . "\n"
                    . "- Margin Rata-rata: {$margin}%\n"
                    . "- Jumlah Transaksi: {$count}\n"
                    . "Daftar Menu Kunci:\n" . $productSummaryText;

                $response = Http::withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout(8)
                ->post("{$baseUrl}/models/{$model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.4,
                        'maxOutputTokens' => 800,
                    ]
                ]);

                if (! $response->successful()) {
                    Log::warning('Gemini API dailyInsight HTTP Error: ' . $response->status());
                    return $fallback;
                }

                $aiText = trim((string) $response->json('candidates.0.content.parts.0.text'));
                if (empty($aiText)) {
                    return $fallback;
                }

                return [
                    'headline' => 'Rekomendasi Cerdas Gemini',
                    'text' => $aiText,
                    'source' => 'ai',
                ];
            } catch (Throwable $e) {
                Log::warning('Gemini API dailyInsight Exception: ' . $e->getMessage());
                return $fallback;
            }
        });
    }

    /**
     * Menghasilkan saran harga jual ideal untuk satu produk.
     * Menggunakan Gemini AI jika tersedia dan aktif, dengan fallback otomatis ke aturan persentase margin sehat.
     */
    public function priceAdvice(Product $product): array
    {
        $sellingPrice = (float) $product->selling_price;
        $unitCost = $this->hppService->getModalPerUnit($product);
        $marginPercent = $sellingPrice > 0 ? round((($sellingPrice - $unitCost) / $sellingPrice) * 100, 2) : 0.0;

        $sehatThreshold = (float) config('hpp.thresholds.sehat', 20.0);
        $tipisThreshold = (float) config('hpp.thresholds.tipis', 0.0);

        if ($marginPercent >= $sehatThreshold) {
            $status = 'sehat';
        } elseif ($marginPercent >= $tipisThreshold) {
            $status = 'tipis';
        } else {
            $status = 'rugi';
        }

        // Siapkan fallback berbasis aturan
        $fallback = $this->buildRuleBasedPriceAdvice($product, $sellingPrice, $unitCost, $marginPercent, $status);

        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $baseUrl = rtrim(config('services.gemini.url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        if (empty($apiKey)) {
            return $fallback;
        }

        $hash = md5(json_encode([
            'product_id' => $product->id,
            'price' => $sellingPrice,
            'cost' => $unitCost,
            'updated_at' => $product->updated_at?->timestamp,
        ]));

        $cacheKey = "gemini_price_advice_{$product->user_id}_{$product->id}_{$hash}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($apiKey, $model, $baseUrl, $product, $sellingPrice, $unitCost, $marginPercent, $status, $fallback) {
            try {
                $prompt = "Anda adalah konsultan penentuan harga jual UMKM UntungJelas.\n"
                    . "Instruksi wajib: Bahasa Indonesia santai dan akrab. Tepat 2 kalimat. Berikan saran harga jual ideal agar margin minimal 20% sehat. HANYA gunakan angka yang diberikan, DILARANG MENGARANG data bahan lain.\n\n"
                    . "Data Produk:\n"
                    . "- Nama Menu: {$product->name}\n"
                    . "- Harga Jual Saat Ini: Rp" . number_format($sellingPrice, 0, ',', '.') . "\n"
                    . "- Modal HPP: Rp" . number_format($unitCost, 0, ',', '.') . "\n"
                    . "- Margin Saat Ini: {$marginPercent}% (Status: {$status})";

                $response = Http::withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->timeout(8)
                ->post("{$baseUrl}/models/{$model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.4,
                        'maxOutputTokens' => 800,
                    ]
                ]);

                if (! $response->successful()) {
                    Log::warning('Gemini API priceAdvice HTTP Error: ' . $response->status());
                    return $fallback;
                }

                $aiText = trim((string) $response->json('candidates.0.content.parts.0.text'));
                if (empty($aiText)) {
                    return $fallback;
                }

                return [
                    'headline' => "Saran Harga Gemini: {$product->name}",
                    'text' => $aiText,
                    'source' => 'ai',
                    'product_id' => $product->id,
                    'selling_price' => $sellingPrice,
                    'modal_per_unit' => $unitCost,
                    'margin_percent' => $marginPercent,
                    'status' => $status,
                ];
            } catch (Throwable $e) {
                Log::warning('Gemini API priceAdvice Exception: ' . $e->getMessage());
                return $fallback;
            }
        });
    }

    /**
     * Heuristic fallback untuk dailyInsight.
     */
    protected function buildRuleBasedInsight(array $products, float $omzet, float $laba, float $margin, int $trxCount): array
    {
        $productsCol = collect($products);
        $rugiProd = $productsCol->firstWhere('status', 'rugi');
        $tipisProd = $productsCol->firstWhere('status', 'tipis');

        if ($rugiProd) {
            return [
                'headline' => 'Perhatian: Ada Menu Rugi!',
                'text' => "Menu '{$rugiProd['name']}' saat ini memiliki margin minus ({$rugiProd['margin_percent']}%). Segera naikkan harga jual atau kurangi takaran bahan baku agar modal tertutup.",
                'source' => 'fallback',
            ];
        }

        if ($tipisProd) {
            return [
                'headline' => 'Peringatan Margin Tipis',
                'text' => "Menu '{$tipisProd['name']}' memiliki margin tipis ({$tipisProd['margin_percent']}%). Kenaikan harga bahan baku sedikit saja dapat membuatnya berstatus rugi.",
                'source' => 'fallback',
            ];
        }

        if ($trxCount > 0) {
            return [
                'headline' => 'Performa Usaha Sehat',
                'text' => "Semua menu Anda memiliki margin sehat dengan margin rata-rata hari ini {$margin}%. Pertahankan efisiensi bahan dan dorong transaksi kasir!",
                'source' => 'fallback',
            ];
        }

        return [
            'headline' => 'Mulai Catat Penjualan Hari Ini',
            'text' => 'Belum ada transaksi penjualan hari ini. Buka menu Kasir untuk mulai mencatat pesanan pelanggan dan pantau keuntungan Anda secara otomatis.',
            'source' => 'fallback',
        ];
    }

    /**
     * Heuristic fallback untuk priceAdvice.
     */
    protected function buildRuleBasedPriceAdvice(Product $product, float $price, float $modal, float $margin, string $status): array
    {
        $safePrice = $modal > 0 ? ceil(($modal / 0.8) / 500) * 500 : $price;

        if ($status === 'rugi') {
            return [
                'headline' => "Rekomendasi Naikkan Harga: {$product->name}",
                'text' => "Harga jual Rp" . number_format($price, 0, ',', '.') . " berada di bawah modal Rp" . number_format($modal, 0, ',', '.') . " ({$margin}%). Naikkan harga jual ke minimal Rp" . number_format($safePrice, 0, ',', '.') . " agar mencapai batas margin sehat 20%.",
                'source' => 'fallback',
                'product_id' => $product->id,
                'selling_price' => $price,
                'modal_per_unit' => $modal,
                'margin_percent' => $margin,
                'status' => $status,
            ];
        }

        if ($status === 'tipis') {
            return [
                'headline' => "Perluas Bantalan Laba: {$product->name}",
                'text' => "Margin saat ini tipis di angka {$margin}%. Pertimbangkan menyesuaikan harga jual ke Rp" . number_format($safePrice, 0, ',', '.') . " agar keuntungan usaha lebih aman dari inflasi bahan baku.",
                'source' => 'fallback',
                'product_id' => $product->id,
                'selling_price' => $price,
                'modal_per_unit' => $modal,
                'margin_percent' => $margin,
                'status' => $status,
            ];
        }

        return [
            'headline' => "Harga Sudah Optimal: {$product->name}",
            'text' => "Harga Rp" . number_format($price, 0, ',', '.') . " sudah memberikan margin sehat {$margin}% terhadap modal Rp" . number_format($modal, 0, ',', '.') . ". Pertahankan kualitas rasa dan porsi ini.",
            'source' => 'fallback',
            'product_id' => $product->id,
            'selling_price' => $price,
            'modal_per_unit' => $modal,
            'margin_percent' => $margin,
            'status' => $status,
        ];
    }
}
