<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;

class TaskPolicy
{
    public function view(User $user, Task $task): bool
    {
        return $user->isActive() && $task->taskList->includesUser($user);
    }

    public function create(User $user, TaskList $taskList): bool
    {
        return $user->isActive() && $taskList->includesUser($user);
    }

    public function update(User $user, Task $task): bool
    {
        return $this->view($user, $task);
    }

    public function delete(User $user, Task $task): bool
    {
        return $this->view($user, $task);
    }
}
