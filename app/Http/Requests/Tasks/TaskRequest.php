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
            'assignee_id' => ['nullable', 'integer', Rule::exists('users', 'id'), $this->validateAssignee(...)],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', $this->validateDueDate(...)],
        ];
    }

    private function validateAssignee(string $attribute, mixed $value, Closure $fail): void
    {
        $list = $this->taskList();

        if ($list === null || ! is_numeric($value)) {
            return;
        }

        $userId = (int) $value;

        if ($list->owner_id === $userId) {
            return;
        }

        $isMember = $list->members()
            ->whereKey($userId)
            ->where('users.status', UserStatus::Active->value)
            ->exists();

        if (! $isMember) {
            $fail('The assignee must be the list owner or a current member of the list.');
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
