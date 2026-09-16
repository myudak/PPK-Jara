<?php

namespace Tests\Feature\Admin;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admin_can_delete_a_user_account(): void
    {
        $target = User::factory()->create();

        $this->deleteJson("/api/admin/users/{$target->id}")
            ->assertUnauthorized();

        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Administrator access is required.');

        $this->assertDatabaseHas('users', ['id' => $target->id, 'status' => 'ACTIVE']);
    }

    public function test_admin_logically_deletes_user_and_preserves_relationship_history(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create();
        $ownedList = TaskList::factory()->for($target, 'owner')->create();
        $sharedList = TaskList::factory()->create();
        $sharedList->members()->attach($target->id, ['joined_at' => now()]);
        $task = Task::factory()->for($sharedList, 'taskList')->create(['assignee_id' => $target->id]);

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'User account deleted successfully.')
            ->assertJsonPath('data.id', $target->id)
            ->assertJsonPath('data.status', 'DISABLED');

        $this->assertDatabaseHas('users', ['id' => $target->id, 'status' => 'DISABLED']);
        $this->assertDatabaseHas('task_lists', ['id' => $ownedList->id, 'owner_id' => $target->id]);
        $this->assertDatabaseHas('list_members', [
            'task_list_id' => $sharedList->id,
            'user_id' => $target->id,
        ]);
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'assignee_id' => $target->id]);
    }

    public function test_delete_is_idempotent_for_an_already_disabled_user(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->disabled()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$target->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'DISABLED');

        $this->assertDatabaseCount('users', 2);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->deleteJson("/api/admin/users/{$admin->id}")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'You cannot delete your own account.');

        $this->assertDatabaseHas('users', ['id' => $admin->id, 'status' => 'ACTIVE']);
    }

    public function test_admin_receives_not_found_for_missing_user(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->deleteJson('/api/admin/users/9999')
            ->assertNotFound()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Resource not found.');
    }
}
