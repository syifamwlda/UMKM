<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardService
{
    public function __construct(
        protected HppService $hppService,
        protected AiInsightService $aiInsightService
    ) {}

    /**
     * Menghitung seluruh metrik statistik dashboard untuk user yang terautentikasi:
     * 1. today: omzet, laba, modal, jumlah transaksi, dan margin rata-rata hari ini.
     * 2. trend: tren 7 hari terakhir (omzet, modal, dan laba per hari; hari kosong bernilai 0).
     * 3. products: daftar produk user dengan margin & status (produk rugi diurutkan paling atas).
     * 4. insight: narasi singkat berbasis aturan (heuristic fallback).
     */
    public function getStats(User $user, ?Carbon $date = null): array
    {
        $today = $date ? $date->copy() : Carbon::today();
        $todayStr = $today->format('Y-m-d');

        // ================= 1. METRIK HARI INI =================
        $todayTransactions = $user->transactions()
            ->with(['items'])
            ->whereDate('paid_at', $todayStr)
            ->get();

        $todayOmzet = 0.0;
        $todayModal = 0.0;

        foreach ($todayTransactions as $trx) {
            $todayOmzet += (float) $trx->total;
            foreach ($trx->items as $item) {
                $todayModal += (float) $item->unit_cost * (int) $item->qty;
            }
        }

        $todayOmzet = round($todayOmzet, 2);
        $todayModal = round($todayModal, 2);
        $todayLaba = round($todayOmzet - $todayModal, 2);
        $todayCount = $todayTransactions->count();
        $todayMargin = $todayOmzet > 0 ? round(($todayLaba / $todayOmzet) * 100, 2) : 0.0;

        // ================= 2. TREN 14 HARI & 7 HARI TERAKHIR =================
        $startDate = $today->copy()->subDays(13)->startOfDay();
        $endDate = $today->copy()->endOfDay();

        $rangeTransactions = $user->transactions()
            ->with(['items'])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->get();

        $groupedByDate = $rangeTransactions->groupBy(function ($trx) {
            return $trx->paid_at ? $trx->paid_at->format('Y-m-d') : '';
        });

        $trend14 = [];
        for ($i = 13; $i >= 0; $i--) {
            $curDateStr = $today->copy()->subDays($i)->format('Y-m-d');
            $dayTrxList = $groupedByDate->get($curDateStr, collect());

            $dayOmzet = 0.0;
            $dayModal = 0.0;

            foreach ($dayTrxList as $trx) {
                $dayOmzet += (float) $trx->total;
                foreach ($trx->items as $it) {
                    $dayModal += (float) $it->unit_cost * (int) $it->qty;
                }
            }

            $dayOmzet = round($dayOmzet, 2);
            $dayModal = round($dayModal, 2);
            $dayLaba = round($dayOmzet - $dayModal, 2);

            $trend14[] = [
                'date' => $curDateStr,
                'day' => Carbon::parse($curDateStr)->locale('id')->isoFormat('D MMM'),
                'omzet' => $dayOmzet,
                'modal' => $dayModal,
                'laba' => $dayLaba,
                'transaksi_count' => $dayTrxList->count(),
            ];
        }

        // Ambil 7 hari terakhir untuk backward-compatibility
        $trend = array_slice($trend14, -7);

        // ================= 3. SEBARAN METODE PEMBAYARAN & KAS FISIK =================
        $paymentMethodsRaw = $user->transactions()
            ->selectRaw("payment_method, count(*) as count, sum(total) as total")
            ->groupBy('payment_method')
            ->get();

        $pmCounts = ['Tunai' => 0, 'QRIS' => 0, 'Kartu/Debit' => 0];
        $pmTotals = ['Tunai' => 0.0, 'QRIS' => 0.0, 'Kartu/Debit' => 0.0];

        foreach ($paymentMethodsRaw as $pm) {
            $name = $pm->payment_method ?: 'Tunai';
            $pmCounts[$name] = (int) $pm->count;
            $pmTotals[$name] = (float) $pm->total;
        }

        $totalPmTrx = array_sum($pmCounts);
        $pmBreakdown = [
            'Tunai' => [
                'count' => $pmCounts['Tunai'],
                'total' => $pmTotals['Tunai'],
                'pct' => $totalPmTrx > 0 ? round(($pmCounts['Tunai'] / $totalPmTrx) * 100, 1) : 0,
            ],
            'QRIS' => [
                'count' => $pmCounts['QRIS'],
                'total' => $pmTotals['QRIS'],
                'pct' => $totalPmTrx > 0 ? round(($pmCounts['QRIS'] / $totalPmTrx) * 100, 1) : 0,
            ],
            'Kartu/Debit' => [
                'count' => $pmCounts['Kartu/Debit'],
                'total' => $pmTotals['Kartu/Debit'],
                'pct' => $totalPmTrx > 0 ? round(($pmCounts['Kartu/Debit'] / $totalPmTrx) * 100, 1) : 0,
            ],
        ];

        // Uang fisik kas masuk hari ini (Tunai)
        $todayCashIn = 0.0;
        foreach ($todayTransactions as $trx) {
            if (($trx->payment_method ?? 'Tunai') === 'Tunai') {
                $todayCashIn += (float) $trx->total;
            }
        }

        // ================= 3. DAFTAR PRODUK (RUGI PALING ATAS) =================
        $userProducts = $user->products()
            ->with('ingredients')
            ->get();

        $enrichedProducts = $userProducts->map(function ($p) {
            return $this->hppService->enrichProduct($p);
        });

        // Urutkan: status 'rugi' paling atas, lalu 'tipis', lalu 'sehat'
        $statusRank = ['rugi' => 1, 'tipis' => 2, 'sehat' => 3];
        $sortedProducts = $enrichedProducts->sort(function ($a, $b) use ($statusRank) {
            $rankA = $statusRank[$a['status']] ?? 4;
            $rankB = $statusRank[$b['status']] ?? 4;
            if ($rankA !== $rankB) {
                return $rankA <=> $rankB;
            }
            return $a['margin_percent'] <=> $b['margin_percent'];
        })->values()->all();

        // ================= 4. INSIGHT GEMINI (DENGAN FALLBACK) =================
        $insight = $this->aiInsightService->dailyInsight($user, [
            'today' => [
                'omzet' => $todayOmzet,
                'laba' => $todayLaba,
                'modal' => $todayModal,
                'transaksi_count' => $todayCount,
                'margin_rata_rata' => $todayMargin,
            ],
            'products' => $sortedProducts,
        ]);

        return [
            'today' => [
                'omzet' => $todayOmzet,
                'laba' => $todayLaba,
                'untung_bersih' => $todayLaba,
                'modal' => $todayModal,
                'modal_sebenarnya' => $todayModal,
                'transaksi_count' => $todayCount,
                'jumlah_transaksi' => $todayCount,
                'margin_rata_rata' => $todayMargin,
                'cash_in' => round($todayCashIn, 2),
            ],
            'trend' => $trend,
            'trend_14_days' => $trend14,
            'payment_methods' => $pmBreakdown,
            'products' => $sortedProducts,
            'insight' => $insight,
        ];
    }

    /**
     * Menghasilkan teks rekomendasi ringkas berbasis aturan heuristik tanpa bergantung pada LLM luar.
     */
    protected function generateRuleBasedInsight(array $products, float $omzet, float $laba, float $margin, int $trxCount): array
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
}

