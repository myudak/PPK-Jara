<?php

namespace App\Http\Requests\Tasks;

use App\Models\TaskList;

class StoreTaskRequest extends TaskRequest
{
    protected function taskList(): ?TaskList
    {
        $list = $this->route('list');

        return $list instanceof TaskList ? $list : null;
    }
}
