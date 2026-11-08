<?php

namespace App\Http\Requests\Transaction;

use App\Services\HppService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'paid_at' => ['nullable', 'date'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang transaksi tidak boleh kosong.',
            'items.array' => 'Format item transaksi tidak valid.',
            'items.min' => 'Transaksi harus memiliki minimal 1 produk.',
            'items.*.product_id.required' => 'ID produk wajib diisi.',
            'items.*.product_id.integer' => 'ID produk harus berupa bilangan bulat.',
            'items.*.qty.required' => 'Jumlah beli (qty) wajib diisi.',
            'items.*.qty.integer' => 'Jumlah beli (qty) harus berupa bilangan bulat.',
            'items.*.qty.min' => 'Jumlah beli minimal 1.',
            'paid_at.date' => 'Format tanggal pembayaran tidak valid.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            if (! is_array($items) || empty($items)) {
                return;
            }

            $user = $this->user();
            if (! $user) {
                return;
            }

            $productIds = collect($items)
                ->pluck('product_id')
                ->filter(fn ($id) => is_numeric($id))
                ->unique()
                ->all();

            $products = $user->products()
                ->with('ingredients')
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            $hppService = app(HppService::class);

            foreach ($items as $index => $item) {
                $productId = $item['product_id'] ?? null;
                if (! $productId || ! is_numeric($productId)) {
                    continue;
                }

                // Periksa apakah produk milik user yang login
                if (! isset($products[$productId])) {
                    $validator->errors()->add(
                        "items.{$index}.product_id",
                        'Produk tidak ditemukan atau bukan milik usaha Anda.'
                    );
                    continue;
                }

                $product = $products[$productId];
                $unitCost = $hppService->getModalPerUnit($product);

                // Periksa apakah produk memiliki modal HPP > 0
                if ($unitCost <= 0) {
                    $validator->errors()->add(
                        "items.{$index}.product_id",
                        "Produk '{$product->name}' belum memiliki modal HPP. Silakan hitung modal terlebih dahulu di menu Katalog & HPP."
                    );
                }
            }
        });
    }
}

