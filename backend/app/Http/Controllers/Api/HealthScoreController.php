<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HealthScoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HealthScoreController extends Controller
{
    public function __construct(
        protected HealthScoreService $healthScoreService
    ) {}

    /**
     * Menampilkan skor kesehatan usaha (0-100) milik user yang terautentikasi:
     * - Skor 0-100 dihitung deterministik di backend berdasarkan config/health.php
     * - Menyertakan label, 2-3 alasan, 2-3 saran, dan narasi AiInsightService
     */
    public function show(Request $request): JsonResponse
    {
        $data = $this->healthScoreService->getHealthScore($request->user());

        return response()->json([
            'message' => 'Skor kesehatan usaha berhasil dimuat.',
            'data' => $data,
        ], 200);
    }
}

