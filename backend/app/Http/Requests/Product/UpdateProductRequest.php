<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'selling_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'yield_qty' => ['sometimes', 'required', 'numeric', 'min:1'],
            'ingredients' => ['sometimes', 'required', 'array', 'min:1'],
            'ingredients.*.name' => ['required_with:ingredients', 'string', 'max:255'],
            'ingredients.*.price' => ['required_with:ingredients', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama produk wajib diisi.',
            'selling_price.required' => 'Harga jual wajib diisi.',
            'selling_price.numeric' => 'Harga jual harus berupa angka.',
            'selling_price.min' => 'Harga jual tidak boleh bernilai negatif.',
            'yield_qty.required' => 'Jumlah porsi resep wajib diisi.',
            'yield_qty.min' => 'Jumlah porsi resep minimal 1.',
            'ingredients.required' => 'Daftar bahan baku wajib disertakan jika diubah.',
            'ingredients.min' => 'Tambahkan minimal 1 bahan baku ke dalam resep.',
            'ingredients.*.name.required_with' => 'Nama bahan baku wajib diisi.',
            'ingredients.*.price.required_with' => 'Biaya bahan baku wajib diisi.',
            'ingredients.*.price.numeric' => 'Biaya bahan baku harus berupa angka.',
            'ingredients.*.price.min' => 'Biaya bahan baku tidak boleh bernilai negatif.',
        ];
    }
}
