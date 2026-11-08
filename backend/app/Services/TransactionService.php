<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class TransactionService
{
    public function __construct(
        protected HppService $hppService
    ) {}

    /**
     * Mencatat transaksi baru dengan snapshot harga jual dan modal per unit saat transaksi berlangsung.
     * Dijalankan di dalam DB::transaction untuk integritas data.
     */
    public function createTransaction(User $user, array $itemsData, ?string $paidAt = null, ?string $paymentMethod = 'Tunai'): array
    {
        return DB::transaction(function () use ($user, $itemsData, $paidAt, $paymentMethod) {
            $productIds = collect($itemsData)->pluck('product_id')->unique()->all();

            // Ambil semua produk milik user yang relevan beserta bahan bakunya
            $products = $user->products()
                ->with('ingredients')
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            $totalPrice = 0.0;
            $totalCost = 0.0;
            $preparedItems = [];

            foreach ($itemsData as $item) {
                $productId = $item['product_id'];
                $qty = (int) $item['qty'];

                if (! isset($products[$productId])) {
                    throw new InvalidArgumentException("Produk dengan ID {$productId} tidak ditemukan atau bukan milik Anda.");
                }

                $product = $products[$productId];
                $unitCost = $this->hppService->getModalPerUnit($product);

                if ($unitCost <= 0) {
                    throw new InvalidArgumentException("Produk '{$product->name}' belum memiliki modal HPP. Silakan hitung modal terlebih dahulu di menu Katalog & HPP.");
                }

                $unitPrice = (float) $product->selling_price;
                $subtotalPrice = round($unitPrice * $qty, 2);
                $subtotalCost = round($unitCost * $qty, 2);

                $totalPrice += $subtotalPrice;
                $totalCost += $subtotalCost;

                // Snapshot harga dan modal per unit saat penjualan
                $preparedItems[] = [
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'unit_cost' => $unitCost,
                ];
            }

            $transaction = $user->transactions()->create([
                'uuid' => (string) Str::uuid(),
                'total' => round($totalPrice, 2),
                'payment_method' => $paymentMethod ?: 'Tunai',
                'paid_at' => $paidAt ? Carbon::parse($paidAt) : now(),
            ]);

            $transaction->items()->createMany($preparedItems);

            return $this->formatTransaction($transaction->load(['items.product']));
        });
    }

    /**
     * Format output respons transaksi konsisten dan lengkap dengan profit & items.
     */
    public function formatTransaction(Transaction $transaction): array
    {
        $items = $transaction->items;

        $totalCost = 0.0;
        $formattedItems = [];

        foreach ($items as $item) {
            $unitPrice = (float) $item->unit_price;
            $unitCost = (float) $item->unit_cost;
            $qty = (int) $item->qty;

            $subtotalPrice = round($unitPrice * $qty, 2);
            $subtotalCost = round($unitCost * $qty, 2);
            $subtotalProfit = round($subtotalPrice - $subtotalCost, 2);

            $totalCost += $subtotalCost;

            $formattedItems[] = [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name ?? 'Produk Dihapus',
                'qty' => $qty,
                'unit_price' => $unitPrice,
                'unit_cost' => $unitCost,
                'subtotal_price' => $subtotalPrice,
                'subtotal_cost' => $subtotalCost,
                'subtotal_profit' => $subtotalProfit,
            ];
        }

        $totalPrice = (float) $transaction->total;
        $totalProfit = round($totalPrice - $totalCost, 2);

        return [
            'id' => $transaction->id,
            'uuid' => $transaction->uuid,
            'total' => $totalPrice,
            'total_cost' => round($totalCost, 2),
            'profit' => $totalProfit,
            'total_profit' => $totalProfit,
            'payment_method' => $transaction->payment_method ?? 'Tunai',
            'paid_at' => $transaction->paid_at?->toISOString(),
            'receipt_url' => "/struk/{$transaction->uuid}",
            'items_count' => $items->count(),
            'items' => $formattedItems,
            'created_at' => $transaction->created_at?->toISOString(),
            'updated_at' => $transaction->updated_at?->toISOString(),
        ];
    }
}

