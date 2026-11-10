<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'message' => 'Pendaftaran berhasil! Selamat datang di UntungJelas.',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->input('phone'),
            $request->input('password')
        );

        return response()->json([
            'message' => 'Berhasil masuk. Selamat beraktivitas!',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ], 200);
    }

    public function google(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credential' => 'nullable|string',
            'google_id'  => 'nullable|string',
            'email'      => 'nullable|email',
            'name'       => 'nullable|string',
            'avatar'     => 'nullable|string',
        ]);

        $result = $this->authService->loginWithGoogle($validated);

        return response()->json([
            'message' => 'Autentikasi dengan Google berhasil. Selamat datang di UntungJelas!',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ], 200);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Data profil berhasil dimuat.',
            'data' => new UserResource($request->user()),
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Berhasil keluar dari akun.',
            'data' => null,
        ], 200);
    }

    /**
     * Update profil pengguna yang sedang login.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:100',
            'phone'         => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
            'business_name' => 'sometimes|string|max:150',
            'business_type' => 'sometimes|string|max:100',
            'avatar'        => 'sometimes|nullable|string',
            'current_password' => 'required_with:new_password|string',
            'new_password'     => 'sometimes|string|min:8|confirmed',
        ]);

        // Ubah kata sandi jika ada permintaan
        if (isset($validated['new_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Kata sandi saat ini tidak sesuai.',
                    'errors'  => ['current_password' => ['Kata sandi saat ini tidak sesuai.']],
                ], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        // Update field profil
        foreach (['name', 'phone', 'business_name', 'business_type', 'avatar'] as $field) {
            if (array_key_exists($field, $validated)) {
                $user->$field = $validated[$field];
            }
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data'    => new UserResource($user),
        ], 200);
    }
}
