<?php

namespace Tests\Feature\Tasks;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TaskAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_task_can_be_assigned_to_multiple_participants(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($member, ['joined_at' => now()]);

        $response = $this->actingAs($owner)->postJson("/api/lists/{$list->id}/tasks", [
            'title' => 'Shared task',
            'assignee_ids' => [$owner->id, $member->id],
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.assignees');

        $task = Task::query()->where('title', 'Shared task')->firstOrFail();
        $this->assertSame(
            [$owner->id, $member->id],
            $task->assignees()->pluck('users.id')->all(),
        );
    }

    public function test_assignee_outside_the_list_is_rejected(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();

        $this->actingAs($owner)->postJson("/api/lists/{$list->id}/tasks", [
            'title' => 'Shared task',
            'assignee_ids' => [$outsider->id],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['assignee_ids']);

        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_duplicate_assignee_ids_are_rejected(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($member, ['joined_at' => now()]);

        $this->actingAs($owner)->postJson("/api/lists/{$list->id}/tasks", [
            'title' => 'Shared task',
            'assignee_ids' => [$member->id, $member->id],
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['assignee_ids']);

        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_update_replaces_the_previous_assignments(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $replacement = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($member, ['joined_at' => now()]);
        $list->members()->attach($replacement, ['joined_at' => now()]);

        $task = $list->tasks()->create(['title' => 'Shared task']);
        $task->syncAssignees([$member->id]);

        $this->actingAs($owner)->patchJson("/api/tasks/{$task->id}", [
            'assignee_ids' => [$owner->id, $replacement->id],
        ])->assertOk()
            ->assertJsonCount(2, 'data.assignees');

        $this->assertSame(
            [$owner->id, $replacement->id],
            $task->fresh()->assignees()->pluck('users.id')->all(),
        );
    }

    public function test_update_without_assignee_ids_keeps_existing_assignments(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($member, ['joined_at' => now()]);

        $task = $list->tasks()->create(['title' => 'Shared task']);
        $task->syncAssignees([$member->id]);

        $this->actingAs($owner)->patchJson("/api/tasks/{$task->id}", [
            'status' => 'IN_PROGRESS',
        ])->assertOk();

        $this->assertSame(
            [$member->id],
            $task->fresh()->assignees()->pluck('users.id')->all(),
        );
    }

    public function test_empty_assignee_ids_unassign_every_participant(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($member, ['joined_at' => now()]);

        $task = $list->tasks()->create(['title' => 'Shared task']);
        $task->syncAssignees([$owner->id, $member->id]);

        $this->actingAs($owner)->patchJson("/api/tasks/{$task->id}", [
            'assignee_ids' => [],
        ])->assertOk();

        $this->assertSame(0, DB::table('task_assignees')->where('task_id', $task->id)->count());
    }

    public function test_removing_a_member_clears_their_assignments_in_the_list(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($member, ['joined_at' => now()]);

        $task = $list->tasks()->create(['title' => 'Shared task']);
        $task->syncAssignees([$member->id]);

        $this->actingAs($owner)->deleteJson("/api/lists/{$list->id}/members/{$member->id}")
            ->assertOk();

        $this->assertSame(0, DB::table('task_assignees')->where('task_id', $task->id)->count());
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }
}
