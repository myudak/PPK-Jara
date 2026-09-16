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
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    use AuthorizesRequests;

    public function show(Request $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        return ApiResponse::success(new TaskResource($task->load('assignees')));
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $data = $request->validated();

        DB::transaction(function () use ($task, $data): void {
            $task->fill($data);

            if (array_key_exists('status', $data)) {
                $task->completed_at = $task->status === TaskStatus::Completed
                    ? ($task->completed_at ?? now())
                    : null;
            }

            $task->save();

            if (array_key_exists('assignee_ids', $data)) {
                $task->syncAssignees($data['assignee_ids']);
            }
        });

        return ApiResponse::success(
            new TaskResource($task->fresh('assignees')),
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
