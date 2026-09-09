<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskListController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('api.login');

Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
    Route::get('/me', [AuthController::class, 'me'])->name('api.me');
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.logout');

    Route::get('/lists', [TaskListController::class, 'index'])->name('api.lists.index');
    Route::post('/lists', [TaskListController::class, 'store'])->name('api.lists.store');
    Route::get('/lists/{list}', [TaskListController::class, 'show'])->name('api.lists.show');
    Route::patch('/lists/{list}', [TaskListController::class, 'update'])->name('api.lists.update');
    Route::delete('/lists/{list}', [TaskListController::class, 'destroy'])->name('api.lists.destroy');
    Route::get('/lists/{list}/members', [TaskListController::class, 'members'])->name('api.lists.members.index');
    Route::post('/lists/{list}/members', [TaskListController::class, 'addMember'])->name('api.lists.members.store');
    Route::delete('/lists/{list}/members/{member}', [TaskListController::class, 'removeMember'])->name('api.lists.members.destroy');

    // TODO(programmer-1): Implement /admin/users behind the admin middleware.
    // TODO(programmer-3): Implement task endpoints with TaskPolicy.
});
