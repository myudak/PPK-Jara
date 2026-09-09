<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_current_user(): void
    {
        $this->getJson('/api/me')
            ->assertUnauthorized()
            ->assertExactJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_login_requires_a_valid_email_and_password(): void
    {
        $this->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonValidationErrors(['email', 'password']);

        User::factory()->create(['email' => 'member@example.com']);

        $this->withHeader('Origin', 'http://localhost')->postJson('/api/login', [
            'email' => 'member@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('errors.email.0', 'The provided credentials are invalid.');
    }

    public function test_active_user_can_login_read_their_identity_and_logout(): void
    {
        $user = User::factory()->create(['email' => 'member@example.com']);

        $this->withHeader('Origin', 'http://localhost')->postJson('/api/login', [
            'email' => 'member@example.com',
            'password' => 'password',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', 'USER');

        $this->assertAuthenticatedAs($user);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'member@example.com');

        $this->withHeader('Origin', 'http://localhost')->postJson('/api/logout')
            ->assertOk()
            ->assertExactJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);

        $this->assertGuest('web');
    }

    public function test_disabled_user_cannot_start_or_continue_a_session(): void
    {
        $disabled = User::factory()->disabled()->create(['email' => 'disabled@example.com']);

        $this->withHeader('Origin', 'http://localhost')->postJson('/api/login', [
            'email' => 'disabled@example.com',
            'password' => 'password',
        ])->assertForbidden()
            ->assertJsonPath('message', 'This account is disabled.');

        $this->assertGuest();

        $this->actingAs($disabled)
            ->getJson('/api/me')
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }
}
