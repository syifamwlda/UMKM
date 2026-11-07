<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Menampilkan data statistik dashboard untuk pemilik usaha yang login:
     * - today: omzet, laba, jumlah transaksi, margin rata-rata
     * - trend: tren performa 7 hari terakhir
     * - products: daftar produk dan margin (yang rugi paling atas)
     * - insight: rekomendasi singkat berbasis aturan
     */
    public function stats(Request $request): JsonResponse
    {
        $data = $this->dashboardService->getStats($request->user());

        return response()->json([
            'message' => 'Data statistik dashboard berhasil dimuat.',
            'data' => $data,
        ], 200);
    }
}

