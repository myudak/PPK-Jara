<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_and_regular_user_cannot_create_users(): void
    {
        $this->postJson('/api/admin/users', [
            'name' => 'Blocked User',
            'username' => 'blocked',
            'email' => 'blocked@example.com',
            'password' => 'password123',
            'role' => 'USER',
            'status' => 'ACTIVE',
        ])->assertUnauthorized()->assertJsonPath('success', false);

        $this->actingAs(User::factory()->create())
            ->postJson('/api/admin/users', [
                'name' => 'Blocked User',
                'username' => 'blocked',
                'email' => 'blocked@example.com',
                'password' => 'password123',
                'role' => 'USER',
                'status' => 'ACTIVE',
            ])->assertForbidden()
            ->assertJsonPath('message', 'Administrator access is required.');

        $this->assertDatabaseCount('users', 1);
    }

    public function test_admin_can_create_user_with_hashed_password(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => 'New Member',
                'username' => 'newmember',
                'email' => 'newmember@example.com',
                'password' => 'password123',
                'role' => 'USER',
                'status' => 'ACTIVE',
            ])->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'User created successfully.')
            ->assertJsonPath('data.username', 'newmember')
            ->assertJsonPath('data.role', 'USER')
            ->assertJsonPath('data.status', 'ACTIVE');

        $user = User::query()->where('username', 'newmember')->firstOrFail();

        $this->assertNotSame('password123', $user->password);
        $this->assertTrue(password_verify('password123', $user->password));
        $this->assertStringNotContainsString('password123', $user->password);
    }

    public function test_admin_can_create_another_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => 'Second Admin',
                'username' => 'secondadmin',
                'email' => 'secondadmin@example.com',
                'password' => 'password123',
                'role' => 'ADMIN',
                'status' => 'ACTIVE',
            ])->assertCreated()
            ->assertJsonPath('data.role', 'ADMIN');
    }

    public function test_creation_rejects_duplicate_username_and_email(): void
    {
        $admin = User::factory()->admin()->create();
        $existing = User::factory()->create(['username' => 'taken', 'email' => 'taken@example.com']);

        $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => 'Duplicate User',
                'username' => 'taken',
                'email' => 'taken@example.com',
                'password' => 'password123',
                'role' => 'USER',
                'status' => 'ACTIVE',
            ])->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonValidationErrors(['username', 'email']);

        $this->assertSame($existing->id, User::query()->where('username', 'taken')->sole()->id);
    }

    public function test_creation_validates_all_fields(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->postJson('/api/admin/users', [
                'name' => '',
                'username' => 'x',
                'email' => 'not-an-email',
                'password' => 'short',
                'role' => 'SUPERADMIN',
                'status' => 'PAUSED',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'username', 'email', 'password', 'role', 'status']);
    }
}
