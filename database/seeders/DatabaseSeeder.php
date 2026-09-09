<?php

namespace Database\Seeders;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $accounts = [
            ['name' => 'JARA Admin', 'username' => 'admin', 'email' => 'admin@example.com', 'role' => UserRole::Admin],
            ['name' => 'JARA User One', 'username' => 'user1', 'email' => 'user1@example.com', 'role' => UserRole::User],
            ['name' => 'JARA User Two', 'username' => 'user2', 'email' => 'user2@example.com', 'role' => UserRole::User],
            ['name' => 'JARA User Three', 'username' => 'user3', 'email' => 'user3@example.com', 'role' => UserRole::User],
        ];

        $users = collect($accounts)->mapWithKeys(function (array $account): array {
            $user = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [...$account, 'status' => UserStatus::Active, 'password' => Hash::make('password')],
            );

            return [$account['email'] => $user];
        });

        $list = TaskList::query()->updateOrCreate(
            ['owner_id' => $users['user1@example.com']->id, 'name' => 'JARA Demo Launch'],
            ['description' => 'Development-only fixture for testing collaboration workflows.'],
        );

        $list->members()->syncWithoutDetaching([
            $users['user2@example.com']->id => ['joined_at' => now()],
            $users['user3@example.com']->id => ['joined_at' => now()],
        ]);

        Task::query()->updateOrCreate(
            ['task_list_id' => $list->id, 'title' => 'Review the shared API contract'],
            ['status' => TaskStatus::InProgress, 'assignee_id' => $users['user2@example.com']->id],
        );

        Task::query()->updateOrCreate(
            ['task_list_id' => $list->id, 'title' => 'Prepare milestone one demo'],
            ['status' => TaskStatus::Todo, 'assignee_id' => $users['user3@example.com']->id],
        );
    }
}
