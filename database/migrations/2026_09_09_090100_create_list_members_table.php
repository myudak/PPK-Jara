<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('list_members', function (Blueprint $table): void {
            $table->foreignId('task_list_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();

            $table->primary(['task_list_id', 'user_id']);
            $table->index(['user_id', 'joined_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('list_members');
    }
};
