<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_valid_data(): void
    {
        $payload = [
            'name' => 'Siti Rahma',
            'phone' => '081298765432',
            'business_name' => 'Dapur Rahma Enak',
            'business_type' => 'Kuliner & Minuman',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'user' => ['id', 'name', 'phone', 'business_name', 'business_type'],
                    'token',
                ],
            ])
            ->assertJsonPath('data.user.phone', '081298765432');

        $this->assertDatabaseHas('users', [
            'phone' => '081298765432',
            'business_name' => 'Dapur Rahma Enak',
        ]);
    }

    public function test_registration_fails_if_phone_already_registered(): void
    {
        User::factory()->create([
            'phone' => '081233334444',
        ]);

        $payload = [
            'name' => 'Budi Santoso',
            'phone' => '081233334444',
            'business_name' => 'Kopi Mantap',
            'business_type' => 'Kuliner & Minuman',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'phone' => '081255556666',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'phone' => '081255556666',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'user' => ['id', 'name', 'phone'],
                    'token',
                ],
            ])
            ->assertJsonPath('data.user.id', $user->id);
    }

    public function test_login_fails_with_incorrect_password(): void
    {
        User::factory()->create([
            'phone' => '081277778888',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'phone' => '081277778888',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    public function test_authenticated_user_can_access_me_profile(): void
    {
        $user = User::factory()->create([
            'phone' => '081299990000',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.phone', '081299990000');
    }

    public function test_unauthenticated_request_to_me_returns_401(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Berhasil keluar dari akun.');

        $this->assertCount(0, $user->tokens);
    }
}
