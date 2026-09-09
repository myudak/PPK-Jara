<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('api.login');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/me', [AuthController::class, 'me'])->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    Route::middleware('admin')->group(function (): void {
        Route::get('/admin/users', [AdminUserController::class, 'index'])
            ->name('api.admin.users.index');
        Route::post('/admin/users', [AdminUserController::class, 'store'])
            ->name('api.admin.users.store');
        Route::patch('/admin/users/{user}', [AdminUserController::class, 'update'])
            ->name('api.admin.users.update');
    });

    // TODO(programmer-2): Implement list and membership endpoints with TaskListPolicy.
    // TODO(programmer-3): Implement task endpoints with TaskPolicy.
});
