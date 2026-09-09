<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\TaskList;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Task> */
class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'task_list_id' => TaskList::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'priority' => TaskPriority::Medium,
            'status' => TaskStatus::Todo,
            'assignee_id' => null,
            'start_date' => null,
            'due_date' => null,
            'completed_at' => null,
        ];
    }
}
