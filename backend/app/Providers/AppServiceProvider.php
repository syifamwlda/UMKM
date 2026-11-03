<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiter untuk endpoint login (max 5 percobaan per menit per nomor HP / IP)
        RateLimiter::for('login', function (Request $request) {
            $key = (string) ($request->input('phone') ?: $request->ip());

            return Limit::perMinute(5)->by($key)->response(function () {
                return response()->json([
                    'message' => 'Terlalu banyak percobaan masuk. Silakan coba lagi dalam 1 menit.',
                ], 429);
            });
        });
    }
}
