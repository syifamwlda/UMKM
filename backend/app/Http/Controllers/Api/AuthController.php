<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

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

    /**
     * Redirect pengguna ke halaman Google OAuth 2.0 resmi (Account Chooser / Pilih Akun).
     */
    public function redirectToGoogle(Request $request): RedirectResponse
    {
        $clientId = config('services.google.client_id');
        $redirectUri = config('services.google.redirect_uri', 'http://127.0.0.1:8000/api/auth/google/callback');
        $frontendUrl = config('services.google.frontend_url', 'http://localhost:5173');
        $from = $request->query('from', 'login');

        if (empty($clientId)) {
            $targetHash = ($from === 'register' || $from === 'daftar') ? '#daftar' : '#login';
            return redirect()->away($frontendUrl . '/' . $targetHash . '?error=' . urlencode('Google OAuth belum aktif: GOOGLE_CLIENT_ID belum diisi di backend/.env. Silakan masukkan Client ID dari Google Cloud Console.'));
        }

        $params = http_build_query([
            'client_id'              => $clientId,
            'redirect_uri'           => $redirectUri,
            'response_type'          => 'code',
            'scope'                  => 'openid email profile',
            'access_type'            => 'offline',
            'include_granted_scopes' => 'true',
            'prompt'                 => 'select_account',
            'state'                  => $from,
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?' . $params);
    }

    /**
     * Menangani callback resmi dari Google API setelah otorisasi akun.
     */
    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        $frontendUrl = config('services.google.frontend_url', 'http://localhost:5173');
        $from = $request->query('state', 'login');
        $targetHash = ($from === 'register' || $from === 'daftar') ? '#daftar' : '#login';

        if ($request->has('error')) {
            $errorDesc = $request->query('error_description') ?: $request->query('error');
            return redirect()->away($frontendUrl . '/' . $targetHash . '?error=' . urlencode('Login Google dibatalkan: ' . $errorDesc));
        }

        $code = $request->query('code');
        if (empty($code)) {
            return redirect()->away($frontendUrl . '/' . $targetHash . '?error=' . urlencode('Kode otorisasi dari Google tidak ditemukan.'));
        }

        try {
            $clientId = config('services.google.client_id');
            $clientSecret = config('services.google.client_secret');
            $redirectUri = config('services.google.redirect_uri', 'http://127.0.0.1:8000/api/auth/google/callback');

            // 1. Tukar authorization code dengan access token ke Google Token API
            $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'client_id'     => $clientId,
                'client_secret' => $clientSecret,
                'code'          => $code,
                'grant_type'    => 'authorization_code',
                'redirect_uri'  => $redirectUri,
            ]);

            if ($tokenResponse->failed()) {
                $err = $tokenResponse->json('error_description') ?? 'Gagal menukarkan token otorisasi ke Google API.';
                return redirect()->away($frontendUrl . '/' . $targetHash . '?error=' . urlencode($err));
            }

            $tokens = $tokenResponse->json();
            $accessToken = $tokens['access_token'] ?? null;

            if (empty($accessToken)) {
                return redirect()->away($frontendUrl . '/' . $targetHash . '?error=' . urlencode('Access token dari Google tidak valid.'));
            }

            // 2. Ambil profil user resmi langsung dari Google UserInfo API
            $userResponse = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo');

            if ($userResponse->failed()) {
                return redirect()->away($frontendUrl . '/' . $targetHash . '?error=' . urlencode('Gagal memuat profil akun dari Google.'));
            }

            $profile = $userResponse->json();

            // 3. Login / Buat akun di UntungJelas dan terbitkan Sanctum token
            $result = $this->authService->loginWithGoogle([
                'google_id' => $profile['sub'] ?? null,
                'email'     => $profile['email'] ?? null,
                'name'      => $profile['name'] ?? null,
                'avatar'    => $profile['picture'] ?? null,
            ]);

            $token = $result['token'];
            $userData = base64_encode(json_encode((new UserResource($result['user']))->toArray(request())));

            return redirect()->away($frontendUrl . '/#google-callback?token=' . urlencode($token) . '&user=' . urlencode($userData));
        } catch (\Throwable $e) {
            return redirect()->away($frontendUrl . '/' . $targetHash . '?error=' . urlencode('Terjadi kesalahan saat memproses login Google: ' . $e->getMessage()));
        }
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
