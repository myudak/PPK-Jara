<?php

namespace Tests\Feature\Admin;

use App\Models\TaskList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_and_regular_user_cannot_update_users(): void
    {
        $target = User::factory()->create();

        $this->patchJson("/api/admin/users/{$target->id}", ['name' => 'Hacked'])
            ->assertUnauthorized();

        $this->actingAs(User::factory()->create())
            ->patchJson("/api/admin/users/{$target->id}", ['name' => 'Hacked'])
            ->assertForbidden()
            ->assertJsonPath('message', 'Administrator access is required.');

        $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => $target->name]);
    }

    public function test_admin_can_update_user_profile_fields(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$target->id}", [
                'name' => 'Renamed Member',
                'username' => 'renamedmember',
                'email' => 'renamedmember@example.com',
            ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'User updated successfully.')
            ->assertJsonPath('data.name', 'Renamed Member')
            ->assertJsonPath('data.username', 'renamedmember')
            ->assertJsonPath('data.email', 'renamedmember@example.com');
    }

    public function test_admin_can_promote_user_role_and_reset_password(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$target->id}", [
                'role' => 'ADMIN',
                'password' => 'newpassword123',
            ])->assertOk()
            ->assertJsonPath('data.role', 'ADMIN');

        $fresh = $target->refresh();
        $this->assertTrue(password_verify('newpassword123', $fresh->password));
    }

    public function test_admin_can_disable_user_and_active_sessions_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create();

        $this->actingAs($target)->getJson('/api/me')->assertOk();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$target->id}", ['status' => 'DISABLED'])
            ->assertOk()
            ->assertJsonPath('data.status', 'DISABLED');

        $this->actingAs($target)
            ->getJson('/api/me')
            ->assertForbidden()
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('users', ['id' => $target->id, 'status' => 'DISABLED']);
    }

    public function test_disabling_user_preserves_relationship_history(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create();
        $list = TaskList::factory()->for($target, 'owner')->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$target->id}", ['status' => 'DISABLED'])
            ->assertOk();

        $this->assertDatabaseHas('task_lists', ['id' => $list->id, 'owner_id' => $target->id]);
        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_admin_cannot_disable_or_demote_themselves(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}", ['status' => 'DISABLED'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot change your own role or status.');

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}", ['role' => 'USER'])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot change your own role or status.');

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}", ['name' => 'Still Admin'])
            ->assertOk()
            ->assertJsonPath('data.status', 'ACTIVE')
            ->assertJsonPath('data.role', 'ADMIN');
    }

    public function test_update_rejects_duplicate_username_and_email_of_other_users(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->create(['username' => 'taken', 'email' => 'taken@example.com']);
        $target = User::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$target->id}", [
                'username' => 'taken',
                'email' => 'taken@example.com',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors(['username', 'email']);

        $this->assertDatabaseHas('users', ['id' => $other->id, 'username' => 'taken']);
    }

    public function test_update_allows_keeping_own_username_and_email(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}", [
                'username' => $admin->username,
                'email' => $admin->email,
            ])->assertOk();
    }

    public function test_update_validates_enum_values(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create();

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$target->id}", [
                'role' => 'SUPERADMIN',
                'status' => 'PAUSED',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors(['role', 'status']);
    }

    public function test_admin_receives_not_found_for_missing_user(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->patchJson('/api/admin/users/9999', ['name' => 'Nobody'])
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Resource not found.');
    }
}
