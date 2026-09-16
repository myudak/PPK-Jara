<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_assignees', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['task_id', 'user_id']);
            $table->index(['user_id', 'task_id']);
        });

        DB::table('tasks')
            ->whereNotNull('assignee_id')
            ->orderBy('id')
            ->chunkById(500, function ($tasks): void {
                $assignments = [];

                foreach ($tasks as $task) {
                    $assignments[] = [
                        'task_id' => $task->id,
                        'user_id' => $task->assignee_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                DB::table('task_assignees')->insertOrIgnore($assignments);
            });

        Schema::table('tasks', function (Blueprint $table): void {
            $table->dropForeign(['assignee_id']);
            $table->dropIndex(['assignee_id', 'status']);
            $table->dropColumn('assignee_id');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table): void {
            $table->foreignId('assignee_id')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->index(['assignee_id', 'status']);
        });

        DB::table('task_assignees')
            ->orderBy('task_id')
            ->orderBy('id')
            ->chunkById(500, function ($assignments): void {
                foreach ($assignments as $assignment) {
                    $exists = DB::table('tasks')
                        ->where('id', $assignment->task_id)
                        ->whereNull('assignee_id')
                        ->update(['assignee_id' => $assignment->user_id]);

                    if ($exists === 0) {
                        continue;
                    }
                }
            });

        Schema::dropIfExists('task_assignees');
    }
};
