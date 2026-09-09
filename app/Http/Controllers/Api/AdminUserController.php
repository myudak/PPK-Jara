<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(perPage: 15);

        return ApiResponse::success([
            'users' => UserResource::collection($users->items())->resolve(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::query()->create($request->safe()->all());

        return ApiResponse::success(
            new UserResource($user->refresh()),
            'User created successfully.',
            201,
        );
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $admin = $request->user();

        if ($admin !== null && $admin->is($user)) {
            $demotesSelf = $request->has('role') && $request->string('role')->toString() !== $user->role->value;
            $disablesSelf = $request->has('status') && $request->string('status')->toString() !== $user->status->value;

            if ($demotesSelf || $disablesSelf) {
                return ApiResponse::error('You cannot change your own role or status.', 422);
            }
        }

        $user->fill($request->safe()->all())->save();

        return ApiResponse::success(
            new UserResource($user->refresh()),
            'User updated successfully.',
        );
    }
}
