<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\StoreTransactionRequest;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(
        protected TransactionService $transactionService
    ) {}

    /**
     * Menampilkan riwayat transaksi milik user yang login.
     * Dapat difilter berdasarkan tanggal (?date=YYYY-MM-DD), default hari ini.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $dateParam = $request->query('date');

        $query = $user->transactions()
            ->with(['items.product'])
            ->latest('paid_at');

        if ($dateParam && $dateParam !== 'all') {
            $query->whereDate('paid_at', $dateParam);
        } elseif (! $dateParam) {
            // Default transaksi hari ini sesuai brief dan API spec
            $query->whereDate('paid_at', now()->toDateString());
        }

        $transactions = $query->get();

        $data = $transactions->map(
            fn ($trx) => $this->transactionService->formatTransaction($trx)
        );

        return response()->json([
            'message' => 'Riwayat transaksi berhasil dimuat.',
            'data' => $data,
        ], 200);
    }

    /**
     * Menyimpan transaksi penjualan baru dari kasir POS.
     * Snapshot unit_price dan unit_cost diambil otomatis oleh server.
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transactionData = $this->transactionService->createTransaction(
            $request->user(),
            $request->validated()['items'],
            $request->validated()['paid_at'] ?? null
        );

        return response()->json([
            'message' => 'Transaksi berhasil disimpan.',
            'data' => $transactionData,
        ], 201);
    }

    /**
     * Menampilkan detail satu transaksi milik user yang login.
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $query = $request->user()->transactions()->with(['items.product']);

        $transaction = is_numeric($id)
            ? $query->findOrFail($id)
            : $query->where('uuid', $id)->firstOrFail();

        return response()->json([
            'message' => 'Detail transaksi berhasil dimuat.',
            'data' => $this->transactionService->formatTransaction($transaction),
        ], 200);
    }
}
