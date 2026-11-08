<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiInsightService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function __construct(
        protected AiInsightService $aiInsightService
    ) {}

    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ], [
            'message.required' => 'Pesan untuk asisten AI tidak boleh kosong.',
            'message.max' => 'Pesan maksimal 1000 karakter.',
        ]);

        $result = $this->aiInsightService->chat($request->user(), $request->input('message'));

        return response()->json([
            'message' => 'Respon AI berhasil diperoleh.',
            'data' => $result,
        ], 200);
    }
}
