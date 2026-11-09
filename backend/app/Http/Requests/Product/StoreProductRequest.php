<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'image' => ['nullable', 'string'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'yield_qty' => ['required', 'numeric', 'min:1'],
            'ingredients' => ['required', 'array', 'min:1'],
            'ingredients.*.name' => ['required', 'string', 'max:255'],
            'ingredients.*.price' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama produk wajib diisi.',
            'selling_price.required' => 'Harga jual wajib diisi.',
            'selling_price.numeric' => 'Harga jual harus berupa angka.',
            'selling_price.min' => 'Harga jual tidak boleh bernilai negatif.',
            'yield_qty.required' => 'Jumlah porsi resep (yield qty) wajib diisi.',
            'yield_qty.min' => 'Jumlah porsi resep minimal 1.',
            'ingredients.required' => 'Daftar bahan baku wajib disertakan.',
            'ingredients.min' => 'Tambahkan minimal 1 bahan baku ke dalam resep.',
            'ingredients.*.name.required' => 'Nama bahan baku wajib diisi.',
            'ingredients.*.price.required' => 'Harga/biaya bahan baku wajib diisi.',
            'ingredients.*.price.numeric' => 'Biaya bahan baku harus berupa angka.',
            'ingredients.*.price.min' => 'Biaya bahan baku tidak boleh bernilai negatif.',
        ];
    }
}
