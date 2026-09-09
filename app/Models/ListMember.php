<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

#[Fillable(['task_list_id', 'user_id', 'joined_at'])]
class ListMember extends Pivot
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'list_members';

    /** @return BelongsTo<TaskList, $this> */
    public function taskList(): BelongsTo
    {
        return $this->belongsTo(TaskList::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['joined_at' => 'datetime'];
    }
}
