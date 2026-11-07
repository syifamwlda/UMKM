<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Services\AiInsightService;
use App\Services\HppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected HppService $hppService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Pembatasan data per user: hanya ambil produk milik user yang sedang terautentikasi
        $products = $request->user()
            ->products()
            ->with('ingredients')
            ->latest()
            ->get();

        $data = $products->map(fn ($product) => $this->hppService->enrichProduct($product));

        return response()->json([
            'message' => 'Daftar produk berhasil dimuat.',
            'data' => $data,
        ], 200);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $productData = $this->hppService->createProduct(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => $productData,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        // Pastikan produk milik user yang sedang login (otomatis 404 jika bukan milik user)
        $product = $request->user()
            ->products()
            ->with('ingredients')
            ->findOrFail($id);

        return response()->json([
            'message' => 'Detail produk berhasil dimuat.',
            'data' => $this->hppService->enrichProduct($product),
        ], 200);
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = $request->user()
            ->products()
            ->findOrFail($id);

        $productData = $this->hppService->updateProduct(
            $product,
            $request->validated()
        );

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => $productData,
        ], 200);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = $request->user()
            ->products()
            ->findOrFail($id);

        $this->hppService->deleteProduct($product);

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
            'data' => null,
        ], 200);
    }

    /**
     * Memberikan rekomendasi penetapan harga jual dari Gemini AI (dengan fallback heuristik).
     */
    public function advice(Request $request, int $id, AiInsightService $aiService): JsonResponse
    {
        $product = $request->user()
            ->products()
            ->with('ingredients')
            ->findOrFail($id);

        $advice = $aiService->priceAdvice($product);

        return response()->json([
            'message' => 'Saran harga produk berhasil dimuat.',
            'data' => $advice,
        ], 200);
    }
}
