<?php

namespace App\Services;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HppService
{
    /**
     * Hitung metrik HPP, modal per unit, margin %, dan status keuntungan.
     * Menggunakan ambang batas resmi dari config/hpp.php sesuai aturan domain di docs/BRIEF.md.
     */
    public function calculate(float $sellingPrice, float $yieldQty, iterable $ingredients): array
    {
        $yieldQty = $yieldQty > 0 ? $yieldQty : 1.0;

        $totalModal = 0.0;
        foreach ($ingredients as $ingredient) {
            $price = is_array($ingredient) ? ($ingredient['price'] ?? 0) : ($ingredient->price ?? 0);
            $totalModal += (float) $price;
        }

        $modalPerUnit = $yieldQty > 0 ? round($totalModal / $yieldQty, 2) : 0.0;

        $marginPercent = 0.0;
        if ($sellingPrice > 0) {
            $marginPercent = round((($sellingPrice - $modalPerUnit) / $sellingPrice) * 100, 2);
        }

        $sehatThreshold = (float) config('hpp.thresholds.sehat', 20.0);
        $tipisThreshold = (float) config('hpp.thresholds.tipis', 0.0);

        if ($marginPercent >= $sehatThreshold) {
            $status = 'sehat';
        } elseif ($marginPercent >= $tipisThreshold) {
            $status = 'tipis';
        } else {
            $status = 'rugi';
        }

        return [
            'total_modal' => round($totalModal, 2),
            'modal_per_unit' => $modalPerUnit,
            'margin_percent' => $marginPercent,
            'status' => $status,
        ];
    }

    /**
     * Memperkaya model Product dengan kalkulasi HPP resmi.
     */
    public function enrichProduct(Product $product): array
    {
        $ingredients = $product->relationLoaded('ingredients')
            ? $product->ingredients
            : $product->ingredients()->get();

        $calc = $this->calculate(
            (float) $product->selling_price,
            (float) $product->yield_qty,
            $ingredients
        );

        return array_merge([
            'id' => $product->id,
            'user_id' => $product->user_id,
            'name' => $product->name,
            'category' => $product->category,
            'image' => $product->image,
            'selling_price' => (float) $product->selling_price,
            'yield_qty' => (float) $product->yield_qty,
            'ingredients' => $ingredients->map(fn ($ing) => [
                'id' => $ing->id,
                'name' => $ing->name,
                'price' => (float) $ing->price,
            ])->values()->all(),
            'created_at' => $product->created_at?->toISOString(),
            'updated_at' => $product->updated_at?->toISOString(),
        ], $calc);
    }

    /**
     * Mengambil nilai modal per unit (HPP) dari sebuah produk.
     */
    public function getModalPerUnit(Product $product): float
    {
        $ingredients = $product->relationLoaded('ingredients')
            ? $product->ingredients
            : $product->ingredients()->get();

        $calc = $this->calculate(
            (float) $product->selling_price,
            (float) $product->yield_qty,
            $ingredients
        );

        return (float) $calc['modal_per_unit'];
    }

    /**
     * Menyimpan produk baru beserta bahan bakunya di dalam database transaction.
     */
    public function createProduct(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $product = $user->products()->create([
                'name' => $data['name'],
                'category' => $data['category'] ?? null,
                'image' => $data['image'] ?? null,
                'selling_price' => $data['selling_price'],
                'yield_qty' => $data['yield_qty'] ?? 1,
            ]);

            if (! empty($data['ingredients'])) {
                $product->ingredients()->createMany($data['ingredients']);
            }

            $product->load('ingredients');

            return $this->enrichProduct($product);
        });
    }

    /**
     * Memperbarui produk beserta daftar bahan bakunya.
     */
    public function updateProduct(Product $product, array $data): array
    {
        return DB::transaction(function () use ($product, $data) {
            $updateData = [
                'name' => $data['name'] ?? $product->name,
                'selling_price' => $data['selling_price'] ?? $product->selling_price,
                'yield_qty' => $data['yield_qty'] ?? $product->yield_qty,
            ];
            if (array_key_exists('category', $data)) {
                $updateData['category'] = $data['category'];
            }
            if (array_key_exists('image', $data)) {
                $updateData['image'] = $data['image'];
            }
            $product->update($updateData);

            if (isset($data['ingredients'])) {
                $product->ingredients()->delete();
                if (! empty($data['ingredients'])) {
                    $product->ingredients()->createMany($data['ingredients']);
                }
            }

            $product->load('ingredients');

            return $this->enrichProduct($product);
        });
    }

    /**
     * Menghapus produk.
     */
    public function deleteProduct(Product $product): void
    {
        $product->delete();
    }
}
