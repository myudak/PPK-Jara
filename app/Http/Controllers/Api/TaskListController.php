<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lists\StoreListRequest;
use App\Http\Requests\Lists\UpdateListRequest;
use App\Http\Resources\ListMemberResource;
use App\Http\Resources\TaskListResource;
use App\Models\Task;
use App\Models\TaskList;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskListController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $lists = TaskList::query()
            ->where(function (Builder $query) use ($user): void {
                $query->where('owner_id', $user->id)
                    ->orWhereHas('members', function (Builder $members) use ($user): void {
                        $members->whereKey($user->id);
                    });
            })
            ->withCount('tasks')
            ->latest()
            ->get();

        return ApiResponse::success(TaskListResource::collection($lists));
    }

    public function store(StoreListRequest $request): JsonResponse
    {
        $data = $request->validated();

        $list = TaskList::query()->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'owner_id' => $request->user()->id,
        ]);

        return ApiResponse::success(
            new TaskListResource($list),
            'Task list created successfully.',
            201,
        );
    }

    public function show(Request $request, TaskList $list): JsonResponse
    {
        $this->authorize('view', $list);

        $list->loadCount('tasks');

        return ApiResponse::success(new TaskListResource($list));
    }

    public function update(UpdateListRequest $request, TaskList $list): JsonResponse
    {
        $this->authorize('update', $list);

        $list->update($request->safe()->only(['name', 'description']));

        return ApiResponse::success(new TaskListResource($list), 'Task list updated successfully.');
    }

    public function destroy(Request $request, TaskList $list): JsonResponse
    {
        $this->authorize('delete', $list);

        DB::transaction(function () use ($list): void {
            $list->tasks()->delete();
            $list->memberships()->delete();
            $list->delete();
        });

        return ApiResponse::success(message: 'Task list deleted successfully.');
    }

    public function members(Request $request, TaskList $list): JsonResponse
    {
        $this->authorize('view', $list);

        $members = $list->members()->withPivot('joined_at')->orderBy('joined_at')->get();

        return ApiResponse::success(ListMemberResource::collection($members));
    }

    public function addMember(Request $request, TaskList $list): JsonResponse
    {
        $this->authorize('manageMembers', $list);

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::query()->findOrFail($validated['user_id']);

        if ($user->id === $list->owner_id) {
            return ApiResponse::error('The owner is already an implicit list participant.', 422);
        }

        if ($list->members()->whereKey($user->id)->exists()) {
            return ApiResponse::error('The user is already a member of this list.', 422);
        }

        $list->members()->attach($user->id, ['joined_at' => now()]);

        $member = $list->members()->withPivot('joined_at')->whereKey($user->id)->firstOrFail();

        return ApiResponse::success(
            new ListMemberResource($member),
            'Member added successfully.',
            201,
        );
    }

    public function removeMember(Request $request, TaskList $list, User $member): JsonResponse
    {
        $this->authorize('manageMembers', $list);

        $exists = $list->members()->whereKey($member->id)->exists();

        if (! $exists) {
            return ApiResponse::error('The user is not a member of this list.', 404);
        }

        DB::transaction(function () use ($list, $member): void {
            Task::query()
                ->where('task_list_id', $list->id)
                ->where('assignee_id', $member->id)
                ->update(['assignee_id' => null]);

            $list->members()->detach($member->id);
        });

        return ApiResponse::success(message: 'Member removed successfully.');
    }
}
