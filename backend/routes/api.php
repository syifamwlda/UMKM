<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthScoreController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicReceiptController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/google', [AuthController::class, 'google']);

// Struk Digital Publik (Read-Only via UUID, throttle 60 req/menit)
Route::get('/public/receipts/{uuid}', [PublicReceiptController::class, 'show'])->middleware('throttle:60,1');
Route::get('/receipts/{uuid}', [PublicReceiptController::class, 'show'])->middleware('throttle:60,1');

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profil
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);

    // Produk & Kalkulasi HPP
    Route::get('/products/{id}/advice', [ProductController::class, 'advice']);
    Route::apiResource('products', ProductController::class);

    // Kasir & Transaksi Penjualan
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);

    // Dashboard & Laporan Statistik
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Skor Kesehatan Usaha (0-100)
    Route::get('/health-score', [HealthScoreController::class, 'show']);
    Route::get('/business-health', [HealthScoreController::class, 'show']);

    // Asisten Konsultasi Bisnis AI (Gemini)
    Route::post('/ai/chat', [AiChatController::class, 'chat'])->middleware('throttle:30,1');
});
