<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tasks\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    use AuthorizesRequests;

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return ApiResponse::success(new TaskResource($task->load('assignee')));
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $data = $request->validated();

        $task->fill($data);

        if (array_key_exists('status', $data)) {
            $task->completed_at = $task->status === TaskStatus::Completed
                ? ($task->completed_at ?? now())
                : null;
        }

        $task->save();

        return ApiResponse::success(
            new TaskResource($task->fresh('assignee')),
            'Task updated successfully.',
        );
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return ApiResponse::success(message: 'Task deleted successfully.');
    }
}
