<?php

namespace Tests\Feature\Database;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DomainSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_membership_cannot_be_duplicated(): void
    {
        $list = TaskList::factory()->create();
        $member = User::factory()->create();

        $list->members()->attach($member, ['joined_at' => now()]);

        $this->expectException(QueryException::class);
        $list->members()->attach($member, ['joined_at' => now()]);
    }

    public function test_task_assignment_cannot_be_duplicated(): void
    {
        $owner = User::factory()->create();
        $assignee = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $task = Task::factory()->for($list)->create();

        $task->assignees()->attach($assignee);

        $this->expectException(QueryException::class);
        $task->assignees()->attach($assignee);
    }

    public function test_list_deletion_cascades_tasks_and_assignments(): void
    {
        $owner = User::factory()->create();
        $assignee = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($assignee, ['joined_at' => now()]);
        $task = Task::factory()->for($list)->create();
        $task->assignees()->attach($assignee);

        $list->delete();

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
        $this->assertSame(0, DB::table('list_members')->where('task_list_id', $list->id)->count());
        $this->assertSame(0, DB::table('task_assignees')->where('task_id', $task->id)->count());
    }

    public function test_user_deletion_cascades_assignment_rows(): void
    {
        $owner = User::factory()->create();
        $assignee = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $task = Task::factory()->for($list)->create();
        $task->assignees()->attach($assignee);

        $assignee->delete();

        $this->assertSame(0, DB::table('task_assignees')->where('user_id', $assignee->id)->count());
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }

    public function test_development_seeder_creates_documented_collaboration_fixture(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['email' => 'admin@example.com', 'role' => 'ADMIN']);
        $this->assertDatabaseHas('users', ['email' => 'user3@example.com', 'status' => 'ACTIVE']);
        $this->assertDatabaseHas('task_lists', ['name' => 'JARA Demo Launch']);
        $this->assertDatabaseCount('list_members', 2);
        $this->assertDatabaseCount('tasks', 2);
    }
}
