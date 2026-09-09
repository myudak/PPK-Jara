<?php

namespace App\Models;

use Database\Factories\TaskListFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description', 'owner_id'])]
class TaskList extends Model
{
    /** @use HasFactory<TaskListFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return BelongsToMany<User, $this> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'list_members')
            ->using(ListMember::class)
            ->withPivot('joined_at');
    }

    /** @return HasMany<ListMember, $this> */
    public function memberships(): HasMany
    {
        return $this->hasMany(ListMember::class);
    }

    /** @return HasMany<Task, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function includesUser(User $user): bool
    {
        return $this->owner_id === $user->id
            || $this->members()->whereKey($user->id)->exists();
    }
}
