import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';

import { createTask, extractFieldErrors, updateTask, type TaskFieldErrors, type TaskFormData } from './api';
import { priorityLabel, statusLabel } from './taskUtils';
import type { Task, TaskPriority, TaskStatus, User } from '@/types/domain';

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

interface TaskFormDialogProps {
    listId: string;
    editingTask: Task | null;
    participants: User[];
    onCancel: () => void;
    onSaved: (message: string) => void;
}

function toFormData(task: Task | null): TaskFormData {
    return {
        title: task?.title ?? '',
        description: task?.description ?? '',
        priority: task?.priority ?? 'MEDIUM',
        status: task?.status ?? 'TODO',
        assignee_id: task?.assignee_id === null || task?.assignee_id === undefined ? '' : String(task.assignee_id),
        start_date: task?.start_date ?? '',
        due_date: task?.due_date ?? '',
    };
}

export function TaskFormDialog({ listId, editingTask, participants, onCancel, onSaved }: TaskFormDialogProps) {
    const [form, setForm] = useState<TaskFormData>(() => toFormData(editingTask));
    const [isSaving, setIsSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<TaskFieldErrors>({});

    const setField = <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setIsSaving(true);
        setFieldErrors({});

        try {
            if (editingTask === null) {
                await createTask(listId, form);
            } else {
                await updateTask(editingTask, form);
            }
            onSaved(editingTask === null ? 'Task created successfully.' : 'Task updated successfully.');
        } catch (requestError: unknown) {
            if (isAxiosError(requestError)) {
                const response = requestError.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
                setFieldErrors(extractFieldErrors(response?.message ?? 'Validation failed.', response?.errors));
            } else {
                setFieldErrors({ form: 'An unexpected error occurred.' });
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="task-dialog" role="dialog" aria-modal="true" aria-label={editingTask === null ? 'Create task' : 'Edit task'}>
            <form className="task-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
                <header className="task-form-header">
                    <h2>{editingTask === null ? 'New task' : 'Edit task'}</h2>
                    <button type="button" className="text-button" onClick={onCancel}>
                        Close
                    </button>
                </header>

                {fieldErrors.form !== undefined && (
                    <p className="form-error" role="alert">
                        {fieldErrors.form}
                    </p>
                )}

                <label htmlFor="task-title">Title</label>
                <input
                    id="task-title"
                    name="title"
                    value={form.title}
                    onChange={(event) => setField('title', event.target.value)}
                    aria-invalid={fieldErrors.title !== undefined}
                    required
                />
                {fieldErrors.title !== undefined && <p className="form-error">{fieldErrors.title}</p>}

                <label htmlFor="task-description">Description (optional)</label>
                <textarea
                    id="task-description"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setField('description', event.target.value)}
                    aria-invalid={fieldErrors.description !== undefined}
                />
                {fieldErrors.description !== undefined && <p className="form-error">{fieldErrors.description}</p>}

                <div className="task-form-grid">
                    <label htmlFor="task-priority">Priority</label>
                    <select
                        id="task-priority"
                        name="priority"
                        value={form.priority}
                        onChange={(event) => setField('priority', event.target.value as TaskPriority)}
                    >
                        {PRIORITIES.map((priority) => (
                            <option key={priority} value={priority}>
                                {priorityLabel(priority)}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="task-status">Status</label>
                    <select
                        id="task-status"
                        name="status"
                        value={form.status}
                        onChange={(event) => setField('status', event.target.value as TaskStatus)}
                    >
                        {STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {statusLabel(status)}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="task-assignee">Assignee (optional)</label>
                    <select
                        id="task-assignee"
                        name="assignee_id"
                        value={form.assignee_id}
                        onChange={(event) => setField('assignee_id', event.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {participants.map((participant) => (
                            <option key={participant.id} value={String(participant.id)}>
                                {participant.name}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="task-start-date">Start date (optional)</label>
                    <input
                        id="task-start-date"
                        name="start_date"
                        type="date"
                        value={form.start_date}
                        onChange={(event) => setField('start_date', event.target.value)}
                        aria-invalid={fieldErrors.start_date !== undefined}
                    />
                    {fieldErrors.start_date !== undefined && <p className="form-error">{fieldErrors.start_date}</p>}

                    <label htmlFor="task-due-date">Due date (optional)</label>
                    <input
                        id="task-due-date"
                        name="due_date"
                        type="date"
                        value={form.due_date}
                        onChange={(event) => setField('due_date', event.target.value)}
                        aria-invalid={fieldErrors.due_date !== undefined}
                    />
                    {fieldErrors.due_date !== undefined && <p className="form-error">{fieldErrors.due_date}</p>}
                </div>

                <footer className="task-form-actions">
                    <button type="submit" className="primary-button" disabled={isSaving}>
                        {isSaving ? 'Saving…' : 'Save task'}
                    </button>
                    <button type="button" className="primary-button task-form-cancel" onClick={onCancel} disabled={isSaving}>
                        Cancel
                    </button>
                </footer>
            </form>
        </section>
    );
}
