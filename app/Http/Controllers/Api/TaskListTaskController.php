<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tasks\StoreTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\TaskList;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class TaskListTaskController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, TaskList $list): JsonResponse
    {
        $this->authorize('view', $list);

        $query = $list->tasks()->with('assignee');

        if (is_string($priority = $request->query('priority')) && $this->isValidEnumValue($priority, TaskPriority::cases())) {
            $query->where('priority', $priority);
        }

        if (is_string($status = $request->query('status')) && $this->isValidEnumValue($status, TaskStatus::cases())) {
            $query->where('status', $status);
        }

        $tasks = $this->sortTasks($query->get(), $request->query('sort'), $request->query('direction', 'asc'));

        return ApiResponse::success(TaskResource::collection($tasks));
    }

    public function store(StoreTaskRequest $request, TaskList $list): JsonResponse
    {
        $this->authorize('create', [Task::class, $list]);

        $data = $request->validated();

        $task = $list->tasks()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'priority' => isset($data['priority']) ? TaskPriority::from($data['priority']) : TaskPriority::Medium,
            'status' => isset($data['status']) ? TaskStatus::from($data['status']) : TaskStatus::Todo,
            'assignee_id' => $data['assignee_id'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'due_date' => $data['due_date'] ?? null,
        ]);

        if ($task->status === TaskStatus::Completed) {
            $task->completed_at = now();
            $task->save();
        }

        return ApiResponse::success(
            new TaskResource($task->fresh('assignee')),
            'Task created successfully.',
            201,
        );
    }

    /**
     * @param  Collection<int, Task>  $tasks
     * @return Collection<int, Task>
     */
    private function sortTasks(Collection $tasks, mixed $sort, mixed $direction): Collection
    {
        $descending = $direction === 'desc';

        return match ($sort) {
            'priority' => $tasks->sortBy(
                fn (Task $task): int => match ($task->priority) {
                    TaskPriority::Low => 1,
                    TaskPriority::Medium => 2,
                    TaskPriority::High => 3,
                },
                SORT_REGULAR,
                $descending,
            ),
            'due_date' => $tasks->sortBy('due_date', SORT_REGULAR, $descending),
            default => $tasks->sortBy('id', SORT_REGULAR, $descending),
        };
    }

    /**
     * @param  list<TaskPriority|TaskStatus>  $cases
     */
    private function isValidEnumValue(string $value, array $cases): bool
    {
        foreach ($cases as $case) {
            if ($case->value === $value) {
                return true;
            }
        }

        return false;
    }
}
