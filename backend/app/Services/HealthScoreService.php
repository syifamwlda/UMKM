<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class HealthScoreService
{
    public function __construct(
        protected HppService $hppService,
        protected AiInsightService $aiInsightService
    ) {}

    /**
     * Menghitung skor kesehatan bisnis (0-100) per user berdasarkan config/health.php:
     * 1. Margin rata-rata tertimbang penjualan (40 poin)
     * 2. Konsistensi penjualan 14 hari terakhir (30 poin)
     * 3. Proporsi produk berstatus sehat (30 poin)
     */
    public function getHealthScore(User $user, ?Carbon $date = null): array
    {
        $today = $date ? $date->copy() : Carbon::today();

        $marginMaxWeight = (float) config('health.weights.margin', 40.0);
        $consistencyMaxWeight = (float) config('health.weights.consistency', 30.0);
        $healthyProductsMaxWeight = (float) config('health.weights.healthy_products', 30.0);

        $targetMargin = (float) config('health.target_margin_percent', 40.0);
        $consistencyDays = (int) config('health.consistency_days', 14);

        // ================= 1. MARGIN RATA-RATA TERTIMBANG (40 POIN) =================
        $transactions = $user->transactions()->with('items')->get();

        $totalOmzet = 0.0;
        $totalCost = 0.0;

        foreach ($transactions as $trx) {
            $totalOmzet += (float) $trx->total;
            foreach ($trx->items as $item) {
                $totalCost += (float) $item->unit_cost * (int) $item->qty;
            }
        }

        $totalOmzet = round($totalOmzet, 2);
        $totalCost = round($totalCost, 2);

        if ($totalOmzet > 0) {
            $totalProfit = round($totalOmzet - $totalCost, 2);
            $weightedMargin = round(($totalProfit / $totalOmzet) * 100, 2);
            if ($weightedMargin <= 0) {
                $marginScore = 0.0;
            } else {
                $marginScore = min($marginMaxWeight, round(($weightedMargin / $targetMargin) * $marginMaxWeight, 2));
            }
        } else {
            $weightedMargin = 0.0;
            $marginScore = 0.0;
        }

        // ================= 2. KONSISTENSI PENJUALAN 14 HARI TERAKHIR (30 POIN) =================
        $startDate = $today->copy()->subDays($consistencyDays - 1)->startOfDay();
        $endDate = $today->copy()->endOfDay();

        $rangeTransactions = $user->transactions()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->get();

        $activeDates = $rangeTransactions->groupBy(function ($trx) {
            return $trx->paid_at ? $trx->paid_at->format('Y-m-d') : '';
        })->keys()->filter()->values();

        $activeDaysCount = $activeDates->count();
        $consistencyScore = round(($activeDaysCount / $consistencyDays) * $consistencyMaxWeight, 2);

        // ================= 3. PROPORSI PRODUK BERSTATUS SEHAT (30 POIN) =================
        $products = $user->products()->with('ingredients')->get();
        $totalProducts = $products->count();

        $healthyProductsCount = 0;
        if ($totalProducts > 0) {
            foreach ($products as $p) {
                $enriched = $this->hppService->enrichProduct($p);
                if ($enriched['status'] === 'sehat') {
                    $healthyProductsCount++;
                }
            }
            $healthyRatio = $healthyProductsCount / $totalProducts;
            $healthyRatioPercent = round($healthyRatio * 100, 2);
            $healthyProductsScore = round($healthyRatio * $healthyProductsMaxWeight, 2);
        } else {
            $healthyRatioPercent = 0.0;
            $healthyProductsScore = 0.0;
        }

        // ================= TOTAL SKOR & KLASIFIKASI LABEL =================
        $rawScore = $marginScore + $consistencyScore + $healthyProductsScore;
        $finalScore = (int) min(100, max(0, round($rawScore)));

        $labels = config('health.labels');
        $label = 'Kritis';
        if ($finalScore >= ($labels['sangat_sehat']['min'] ?? 80)) {
            $label = $labels['sangat_sehat']['label'] ?? 'Sangat Sehat';
        } elseif ($finalScore >= ($labels['sehat']['min'] ?? 60)) {
            $label = $labels['sehat']['label'] ?? 'Sehat';
        } elseif ($finalScore >= ($labels['cukup']['min'] ?? 40)) {
            $label = $labels['cukup']['label'] ?? 'Cukup';
        } else {
            $label = $labels['kritis']['label'] ?? 'Kritis';
        }

        // ================= 2-3 ALASAN (REASONS) & SARAN (RECOMMENDATIONS) =================
        if ($totalProducts === 0 && $totalOmzet === 0.0) {
            $alasan = [
                'Belum ada transaksi penjualan kasir yang tercatat.',
                'Belum ada produk aktif dengan racikan HPP di sistem katalog.',
            ];
            $saran = [
                'Tambahkan menu produk dan rincian biaya bahan baku di menu Katalog & HPP.',
                'Buka menu Kasir untuk mulai mencatat transaksi penjualan harian Anda.',
            ];
        } else {
            $alasan = [];
            // Alasan 1: Margin
            if ($totalOmzet > 0) {
                $alasan[] = "Margin rata-rata tertimbang penjualan Anda berada di angka {$weightedMargin}% (menyumbang {$marginScore} dari {$marginMaxWeight} poin).";
            } else {
                $alasan[] = "Belum ada transaksi penjualan yang tercatat untuk menghitung margin keuntungan (0 dari {$marginMaxWeight} poin).";
            }

            // Alasan 2: Konsistensi
            $alasan[] = "Toko Anda aktif mencatat penjualan pada {$activeDaysCount} dari {$consistencyDays} hari terakhir (menyumbang {$consistencyScore} dari {$consistencyMaxWeight} poin).";

            // Alasan 3: Produk Sehat
            if ($totalProducts > 0) {
                $alasan[] = "Sebanyak {$healthyProductsCount} dari {$totalProducts} produk ({$healthyRatioPercent}%) berstatus sehat dan menghasilkan untung aman (menyumbang {$healthyProductsScore} dari {$healthyProductsMaxWeight} poin).";
            } else {
                $alasan[] = "Belum ada produk yang didaftarkan pada katalog usaha Anda (0 dari {$healthyProductsMaxWeight} poin).";
            }

            $saran = [];
            if ($totalProducts > 0 && $healthyProductsCount < $totalProducts) {
                $saran[] = 'Evaluasi takaran bahan baku atau sesuaikan harga jual pada menu yang marginnya tipis atau merugi.';
            } else {
                $saran[] = 'Pertahankan formula resep dan harga jual produk Anda yang sudah memberikan margin sehat.';
            }

            if ($activeDaysCount < $consistencyDays) {
                $saran[] = 'Tingkatkan konsistensi pencatatan transaksi kasir setiap hari agar performa keuangan terpantau secara penuh.';
            } else {
                $saran[] = 'Konsistensi pencatatan harian Anda sangat luar biasa, pertahankan disiplin kasir ini!';
            }

            if ($weightedMargin < 20) {
                $saran[] = 'Cari alternatif supplier bahan baku yang lebih hemat untuk memperlebar bantalan keuntungan usaha.';
            } else {
                $saran[] = 'Pantau harga beli bahan baku secara berkala agar lonjakan inflasi tidak menggerus laba bersih Anda.';
            }
        }

        // ================= NARASI EVALUASI DARI AI INSIGHT SERVICE =================
        $aiNarrative = $this->aiInsightService->healthScoreNarrative($user, [
            'score' => $finalScore,
            'label' => $label,
            'weighted_margin' => $weightedMargin,
            'active_days' => $activeDaysCount,
            'total_days' => $consistencyDays,
            'healthy_products' => $healthyProductsCount,
            'total_products' => $totalProducts,
        ]);

        return [
            'score' => $finalScore,
            'label' => $label,
            'alasan' => $alasan,
            'reasons' => $alasan,
            'saran' => $saran,
            'recommendations' => $saran,
            'narasi' => $aiNarrative['text'],
            'source' => $aiNarrative['source'],
            'breakdown' => [
                'margin_score' => $marginScore,
                'consistency_score' => $consistencyScore,
                'healthy_product_score' => $healthyProductsScore,
                'weighted_margin' => $weightedMargin,
                'active_days_14' => $activeDaysCount,
                'healthy_products_ratio' => $healthyRatioPercent,
            ],
        ];
    }
}

