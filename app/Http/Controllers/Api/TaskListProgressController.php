<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Models\TaskList;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

class TaskListProgressController extends Controller
{
    use AuthorizesRequests;

    public function __invoke(TaskList $list): JsonResponse
    {
        $this->authorize('view', $list);

        $counts = $list->tasks()
            ->selectRaw("status, count(*) as aggregate")
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $total = (int) $counts->sum();
        $completed = (int) ($counts[TaskStatus::Completed->value] ?? 0);
        $percent = $total > 0 ? (int) floor(($completed / $total) * 100) : 0;

        return ApiResponse::success([
            'total' => $total,
            'completed' => $completed,
            'percent' => $percent,
        ]);
    }
}
