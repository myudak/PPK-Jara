<?php

namespace App\Http\Requests\Tasks;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\UserStatus;
use App\Models\TaskList;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class TaskRequest extends FormRequest
{
    abstract protected function taskList(): ?TaskList;

    public function authorize(): bool
    {
        $list = $this->taskList();
        $user = $this->user();

        return $list !== null && $user !== null && $user->can('create', $list);
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            'title' => [$this->isMethod('post') ? 'required' : 'sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', Rule::enum(TaskPriority::class)],
            'status' => ['nullable', Rule::enum(TaskStatus::class)],
            'assignee_ids' => ['nullable', 'array', $this->validateAssignees(...)],
            'assignee_ids.*' => ['integer', Rule::exists('users', 'id')],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', $this->validateDueDate(...)],
        ];
    }

    private function validateAssignees(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            return;
        }

        $list = $this->taskList();

        if ($list === null) {
            return;
        }

        $userIds = array_map(intval(...), array_values(array_filter($value, is_numeric(...))));

        if (count($userIds) !== count(array_unique($userIds))) {
            $fail('The assignee ids must not contain duplicates.');

            return;
        }

        if ($userIds === []) {
            return;
        }

        $activeMemberIds = $list->members()
            ->whereIn('users.id', $userIds)
            ->where('users.status', UserStatus::Active->value)
            ->pluck('users.id');

        foreach ($userIds as $userId) {
            if ($userId !== $list->owner_id && ! $activeMemberIds->contains($userId)) {
                $fail('Every assignee must be the list owner or a current member of the list.');

                return;
            }
        }
    }

    private function validateDueDate(string $attribute, mixed $value, Closure $fail): void
    {
        $start = $this->input('start_date');
        $due = $this->input('due_date');

        if (! is_string($start) || ! is_string($due) || $start === '' || $due === '') {
            return;
        }

        $startTimestamp = strtotime($start);
        $dueTimestamp = strtotime($due);

        if ($startTimestamp !== false && $dueTimestamp !== false && $dueTimestamp < $startTimestamp) {
            $fail('The due date must be on or after the start date.');
        }
    }
}
