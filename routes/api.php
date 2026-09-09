<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskListTaskController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('api.login');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/me', [AuthController::class, 'me'])->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    // TODO(programmer-1): Implement /admin/users behind the admin middleware.
    // TODO(programmer-2): Implement list and membership endpoints with TaskListPolicy.

    Route::get('/lists/{list}/tasks', [TaskListTaskController::class, 'index'])
        ->name('api.lists.tasks.index');
    Route::post('/lists/{list}/tasks', [TaskListTaskController::class, 'store'])
        ->name('api.lists.tasks.store');

    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('api.tasks.show');
    Route::patch('/tasks/{task}', [TaskController::class, 'update'])->name('api.tasks.update');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('api.tasks.destroy');
});
