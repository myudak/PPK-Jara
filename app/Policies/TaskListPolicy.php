<?php

namespace App\Policies;

use App\Models\TaskList;
use App\Models\User;

class TaskListPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isActive();
    }

    public function view(User $user, TaskList $taskList): bool
    {
        return $user->isActive() && $taskList->includesUser($user);
    }

    public function create(User $user): bool
    {
        return $user->isActive();
    }

    public function update(User $user, TaskList $taskList): bool
    {
        return $user->isActive() && $taskList->owner_id === $user->id;
    }

    public function delete(User $user, TaskList $taskList): bool
    {
        return $this->update($user, $taskList);
    }

    public function manageMembers(User $user, TaskList $taskList): bool
    {
        return $this->update($user, $taskList);
    }
}
