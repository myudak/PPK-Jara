<?php

namespace App\Http\Requests\Tasks;

use App\Models\Task;
use App\Models\TaskList;

class UpdateTaskRequest extends TaskRequest
{
    public function authorize(): bool
    {
        $task = $this->route('task');
        $user = $this->user();

        return $task instanceof Task && $user !== null && $user->can('update', $task);
    }

    protected function taskList(): ?TaskList
    {
        $task = $this->route('task');

        return $task instanceof Task ? $task->taskList : null;
    }
}
