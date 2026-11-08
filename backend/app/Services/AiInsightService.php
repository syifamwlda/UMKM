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

    /**
     * Menghasilkan narasi evaluasi skor kesehatan usaha.
     * Menggunakan Gemini AI jika tersedia dan aktif, dengan fallback otomatis ke aturan heuristik.
     * Cache disimpan selama 6 jam per user dan hash data skor.
     */
    public function healthScoreNarrative(User $user, array $healthData): array
    {
        $score = (int) ($healthData['score'] ?? 0);
        $label = (string) ($healthData['label'] ?? 'Kritis');
        $margin = (float) ($healthData['weighted_margin'] ?? 0);
        $activeDays = (int) ($healthData['active_days'] ?? 0);
        $totalDays = (int) ($healthData['total_days'] ?? 14);
        $healthyProducts = (int) ($healthData['healthy_products'] ?? 0);
        $totalProducts = (int) ($healthData['total_products'] ?? 0);

        // Siapkan fallback berbasis aturan
        $fallback = $this->buildRuleBasedHealthNarrative($healthData);

        // Jika skor 0 atau tidak ada data sama sekali, langsung berikan fallback ramah
        if ($score === 0 && $totalProducts === 0 && $margin === 0.0) {
            return $fallback;
        }

        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $baseUrl = rtrim(config('services.gemini.url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        if (empty($apiKey)) {
            return $fallback;
        }

        $hash = md5(json_encode([
            'score' => $score,
            'label' => $label,
            'margin' => $margin,
            'active_days' => $activeDays,
            'healthy_products' => $healthyProducts,
            'total_products' => $totalProducts,
        ]));

        $cacheKey = "gemini_health_score_{$user->id}_{$hash}";

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($apiKey, $model, $baseUrl, $score, $label, $margin, $activeDays, $totalDays, $healthyProducts, $totalProducts, $fallback) {
            try {
                $prompt = "Anda adalah konsultan keuangan UMKM UntungJelas. Berikan evaluasi skor kesehatan usaha untuk pemilik kedai/warung.\n"
                    . "Instruksi wajib: Gunakan bahasa Indonesia santai dan akrab. Tepat 2 kalimat. HANYA gunakan angka yang tertera di data bawah ini, DILARANG MENGARANG angka baru.\n\n"
                    . "Data Kesehatan Usaha:\n"
                    . "- Skor Kesehatan: {$score}/100 (Status: {$label})\n"
                    . "- Margin Rata-rata Tertimbang: {$margin}%\n"
                    . "- Konsistensi Penjualan: {$activeDays} dari {$totalDays} hari terakhir\n"
                    . "- Menu Berstatus Sehat: {$healthyProducts} dari {$totalProducts} produk";

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
                    Log::warning('Gemini API healthScoreNarrative HTTP Error: ' . $response->status());
                    return $fallback;
                }

                $aiText = trim((string) $response->json('candidates.0.content.parts.0.text'));
                if (empty($aiText)) {
                    return $fallback;
                }

                return [
                    'headline' => "Evaluasi Kesehatan Usaha ({$score}/100)",
                    'text' => $aiText,
                    'source' => 'ai',
                ];
            } catch (Throwable $e) {
                Log::warning('Gemini API healthScoreNarrative Exception: ' . $e->getMessage());
                return $fallback;
            }
        });
    }

    /**
     * Heuristic fallback untuk healthScoreNarrative.
     */
    protected function buildRuleBasedHealthNarrative(array $healthData): array
    {
        $score = (int) ($healthData['score'] ?? 0);
        $label = (string) ($healthData['label'] ?? 'Kritis');
        $margin = (float) ($healthData['weighted_margin'] ?? 0);
        $totalProducts = (int) ($healthData['total_products'] ?? 0);

        if ($score === 0 && $totalProducts === 0) {
            return [
                'headline' => 'Mulai Perjalanan Bisnis Anda',
                'text' => 'Belum ada aktivitas bisnis yang cukup untuk dianalisis. Masukkan produk di menu Katalog & HPP serta catat transaksi pertama Anda di menu Kasir.',
                'source' => 'fallback',
            ];
        }

        if ($score >= 80) {
            return [
                'headline' => "Kondisi Usaha Sangat Prima ({$score}/100)",
                'text' => "Bisnis Anda berada dalam kategori {$label} dengan margin solid {$margin}%. Pertahankan disiplin resep dan pencatatan kasir harian agar performa stabil.",
                'source' => 'fallback',
            ];
        }

        if ($score >= 60) {
            return [
                'headline' => "Kondisi Usaha Sehat ({$score}/100)",
                'text' => "Usaha Anda tergolong {$label} dengan perputaran transaksi yang baik. Tingkatkan promosi di hari sepi agar skor kesehatan bisnis Anda makin optimal.",
                'source' => 'fallback',
            ];
        }

        if ($score >= 40) {
            return [
                'headline' => "Kondisi Usaha Cukup ({$score}/100)",
                'text' => "Skor kesehatan usaha Anda berada pada kategori {$label} ({$score}/100). Fokus benahi menu dengan margin tipis dan dorong transaksi kasir lebih rutin.",
                'source' => 'fallback',
            ];
        }

        return [
            'headline' => "Perlu Perhatian Khusus ({$score}/100)",
            'text' => "Kesehatan bisnis Anda saat ini berstatus {$label} dengan skor {$score}/100. Segera evaluasi harga jual produk dan tekan pemborosan bahan baku.",
            'source' => 'fallback',
        ];
    }

    /**
     * Konsultasi tanya-jawab bisnis UMKM interaktif via Gemini AI dengan fallback cerdas.
     */
    public function chat(User $user, string $message): array
    {
        $message = trim($message);
        if (empty($message)) {
            return [
                'reply' => 'Halo! Ada yang bisa saya bantu terkait strategi harga, modal bahan, atau keuntungan usaha Anda?',
                'source' => 'fallback',
            ];
        }

        // Siapkan ringkasan finansial usaha user untuk konteks Gemini
        $products = $user->products()->with('ingredients')->get();
        $enriched = $products->map(fn ($p) => $this->hppService->enrichProduct($p));
        $rugiCount = $enriched->where('status', 'rugi')->count();
        $tipisCount = $enriched->where('status', 'tipis')->count();
        $sehatCount = $enriched->where('status', 'sehat')->count();

        $todayTrx = $user->transactions()->whereDate('paid_at', now()->toDateString())->get();
        $todayOmzet = (float) $todayTrx->sum('total');

        $apiKey = config('services.gemini.key');
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $baseUrl = rtrim(config('services.gemini.url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        if (! empty($apiKey)) {
            try {
                $businessName = $user->business_name ?: 'UMKM Anda';
                $businessType = $user->business_type ?: 'Usaha Kuliner / Retail';

                $prompt = <<<PROMPT
Anda adalah "Asisten AI UntungJelas", konsultan keuangan & bisnis profesional khusus pelaku UMKM Indonesia.
Gaya komunikasi Anda: ramah, ringkas, solutif, suportif, dan menggunakan bahasa Indonesia yang mudah dipahami (maksimal 2-3 paragraf singkat).

Konteks Usaha Pengguna:
- Nama Usaha: {$businessName}
- Kategori Usaha: {$businessType}
- Omzet Hari Ini: Rp {$todayOmzet}
- Jumlah Menu Sehat: {$sehatCount}, Tipis: {$tipisCount}, Rugi: {$rugiCount}

Pertanyaan / Permintaan Pengguna:
"{$message}"

Berikan jawaban atau saran bisnis yang praktis, cerdas, dan langsung bisa dieksekusi oleh pelaku usaha:
PROMPT;

                $response = Http::timeout(10)->post("{$baseUrl}/models/{$model}:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 600,
                    ],
                ]);

                if ($response->successful()) {
                    $replyText = $response->json('candidates.0.content.parts.0.text');
                    if (! empty($replyText)) {
                        return [
                            'reply' => trim($replyText),
                            'source' => 'gemini',
                        ];
                    }
                }
            } catch (Throwable $e) {
                Log::warning("Gemini AI Chat Exception: {$e->getMessage()}");
            }
        }

        return $this->buildFallbackChatReply($user, $message, $todayOmzet, $rugiCount, $tipisCount, $sehatCount);
    }

    /**
     * Fallback jawaban cerdas berbasis aturan jika Gemini offline/limit tercapai.
     */
    protected function buildFallbackChatReply(User $user, string $message, float $todayOmzet, int $rugiCount, int $tipisCount, int $sehatCount): array
    {
        $lower = strtolower($message);

        if (str_contains($lower, 'harga') || str_contains($lower, 'margin') || str_contains($lower, 'evaluasi') || str_contains($lower, 'rugi')) {
            if ($rugiCount > 0) {
                return [
                    'reply' => "💡 **Saran Margin:** Anda memiliki {$rugiCount} produk berstatus **Rugi**. Segera buka menu *Katalog & HPP*, lalu sesuaikan harga jualnya minimal 30% di atas modal bahan agar usaha tidak bocor halus.",
                    'source' => 'fallback',
                ];
            }
            if ($tipisCount > 0) {
                return [
                    'reply' => "💡 **Saran Margin:** Anda memiliki {$tipisCount} produk berstatus **Margin Tipis**. Pertimbangkan untuk menaikkan harga jual Rp1.000 - Rp2.000 atau cari supplier bahan baku dengan harga lebih kompetitif.",
                    'source' => 'fallback',
                ];
            }
            return [
                'reply' => "✨ **Katalog Sehat!** Seluruh produk Anda saat ini berstatus sehat. Untuk meningkatkan profitabilitas lebih lanjut, coba buat paket *bundling* produk favorit dengan minuman.",
                'source' => 'fallback',
            ];
        }

        if (str_contains($lower, 'stok') || str_contains($lower, 'bahan') || str_contains($lower, 'resep')) {
            return [
                'reply' => '📦 **Manajemen Bahan Baku:** Pastikan tim Anda menimbang bahan baku sesuai takaran resep di *Katalog & HPP*. Ketidakdisiplinan takaran seringkali menjadi penyebab utama hilangnya 15-20% margin harian.',
                'source' => 'fallback',
            ];
        }

        if (str_contains($lower, 'omzet') || str_contains($lower, 'laba') || str_contains($lower, 'jual') || str_contains($lower, 'kasir')) {
            $formattedOmzet = number_format($todayOmzet, 0, ',', '.');
            return [
                'reply' => "💰 **Finansial Hari Ini:** Omzet tercatat hari ini sebesar **Rp{$formattedOmzet}**. Tingkatkan transaksi kasir dengan strategi *upselling* (menawarkan ukuran lebih besar atau topping tambahan di kasir).",
                'source' => 'fallback',
            ];
        }

        return [
            'reply' => "🚀 **Tips Bisnis UntungJelas:** Fokus pada produk dengan margin tertinggi Anda dan promosikan sebagai menu andalan (*signature menu*). Pelanggan lebih menyukai produk dengan cerita khas daripada menu standar.",
            'source' => 'fallback',
        ];
    }
}

