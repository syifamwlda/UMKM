<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;

class PublicReceiptController extends Controller
{
    /**
     * Menampilkan struk digital publik read-only tanpa autentikasi.
     * Mengembalikan: nama usaha, tanggal, daftar item (nama, qty, harga satuan, subtotal), total.
     * Dilindungi throttle 60 per menit.
     * JANGAN mengembalikan modal, laba, nomor HP, id internal, atau data user lain.
     */
    public function show(string $uuid): JsonResponse
    {
        $transaction = Transaction::where('uuid', $uuid)
            ->with(['user', 'items.product'])
            ->first();

        if (! $transaction) {
            return response()->json([
                'message' => 'Struk belanja tidak ditemukan atau tautan sudah tidak valid.',
            ], 404);
        }

        $items = $transaction->items->map(function ($item) {
            $unitPrice = (float) $item->unit_price;
            $qty = (int) $item->qty;

            return [
                'name' => $item->product?->name ?? 'Produk Dihapus',
                'qty' => $qty,
                'unit_price' => $unitPrice,
                'price' => $unitPrice,
                'subtotal' => round($unitPrice * $qty, 2),
            ];
        })->values()->all();

        return response()->json([
            'message' => 'Struk belanja ditemukan.',
            'data' => [
                'business_name' => $transaction->user?->business_name ?? 'Usaha UMKM',
                'paid_at' => $transaction->paid_at?->toISOString(),
                'date' => $transaction->paid_at ? $transaction->paid_at->format('Y-m-d H:i:s') : null,
                'items' => $items,
                'total' => (float) $transaction->total,
            ],
        ], 200);
    }
}

