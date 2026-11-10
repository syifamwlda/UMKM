<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'business_name' => $data['business_name'],
            'business_type' => $data['business_type'],
            'password' => $data['password'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function login(string $phone, string $password): array
    {
        $user = User::where('phone', $phone)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'phone' => ['Nomor HP atau kata sandi tidak cocok. Silakan coba lagi.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /**
     * Autentikasi atau pendaftaran instan menggunakan akun Google.
     */
    public function loginWithGoogle(array $data): array
    {
        $googleId = $data['google_id'] ?? $data['sub'] ?? null;
        $email = $data['email'] ?? null;
        $name = $data['name'] ?? null;
        $avatar = $data['avatar'] ?? $data['picture'] ?? null;

        // Jika diberikan token credential JWT Google dari One Tap / Google Button
        if (!empty($data['credential'])) {
            $parsed = $this->parseGoogleJwt($data['credential']);
            if ($parsed) {
                $googleId = $parsed['sub'] ?? $googleId;
                $email = $parsed['email'] ?? $email;
                $name = $parsed['name'] ?? $name;
                $avatar = $parsed['picture'] ?? $avatar;
            }
        }

        if (!$googleId && !$email) {
            throw ValidationException::withMessages([
                'google' => ['Autentikasi Google gagal: data akun tidak valid.'],
            ]);
        }

        $user = null;
        if ($googleId) {
            $user = User::where('google_id', $googleId)->first();
        }

        if (!$user && $email) {
            $user = User::where('email', $email)->first();
            if ($user && $googleId) {
                $user->google_id = $googleId;
                if (!$user->avatar && $avatar) {
                    $user->avatar = $avatar;
                }
                $user->save();
            }
        }

        if (!$user) {
            // Pengguna baru -> auto-register
            $storeName = !empty($name) ? 'Kedai ' . $name : 'Kedai Saya';
            $user = User::create([
                'name' => $name ?: 'Pengguna Google',
                'email' => $email,
                'google_id' => $googleId ?: ('google_' . time() . '_' . rand(1000, 9999)),
                'phone' => null,
                'business_name' => $storeName,
                'business_type' => 'Kuliner (Coffee & Bakery)',
                'avatar' => $avatar,
                'password' => Hash::make(\Illuminate\Support\Str::random(32)),
            ]);
        } else {
            // Perbarui foto avatar jika sebelumnya kosong
            if (!$user->avatar && $avatar) {
                $user->avatar = $avatar;
                $user->save();
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Parsing payload JWT Google Identity Services tanpa library pihak ketiga.
     */
    protected function parseGoogleJwt(string $credential): ?array
    {
        $parts = explode('.', $credential);
        if (count($parts) < 2) {
            return null;
        }

        $payload = $parts[1];
        $payload = str_replace(['-', '_'], ['+', '/'], $payload);
        $modulo = strlen($payload) % 4;
        if ($modulo) {
            $payload .= str_repeat('=', 4 - $modulo);
        }

        $decoded = base64_decode($payload);
        if (!$decoded) {
            return null;
        }

        return json_decode($decoded, true);
    }
}
