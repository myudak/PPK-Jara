import { api } from '@/lib/api';
import type { ApiSuccess } from '@/types/api';
import type { Task, TaskPriority, TaskStatus } from '@/types/domain';

export interface TaskFilters {
    priority: TaskPriority | '';
    status: TaskStatus | '';
    sort: 'id' | 'priority' | 'due_date';
    direction: 'asc' | 'desc';
}

export interface TaskFormData {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignee_id: string;
    start_date: string;
    due_date: string;
}

export interface TaskProgress {
    total: number;
    completed: number;
    percent: number;
}

export interface TaskFieldErrors {
    [field: string]: string | undefined;
}

function taskPayload(data: TaskFormData): Record<string, unknown> {
    return {
        title: data.title,
        description: data.description.trim() === '' ? null : data.description,
        priority: data.priority,
        status: data.status,
        assignee_id: data.assignee_id === '' ? null : Number(data.assignee_id),
        start_date: data.start_date === '' ? null : data.start_date,
        due_date: data.due_date === '' ? null : data.due_date,
    };
}

export async function fetchTasks(listId: string, filters: TaskFilters): Promise<Task[]> {
    const response = await api.get<ApiSuccess<Task[]>>(`/api/lists/${listId}/tasks`, {
        params: {
            priority: filters.priority === '' ? undefined : filters.priority,
            status: filters.status === '' ? undefined : filters.status,
            sort: filters.sort,
            direction: filters.direction,
        },
    });

    return response.data.data;
}

export async function fetchProgress(listId: string): Promise<TaskProgress> {
    const response = await api.get<ApiSuccess<TaskProgress>>(`/api/lists/${listId}/progress`);

    return response.data.data;
}

export async function createTask(listId: string, data: TaskFormData): Promise<Task> {
    const response = await api.post<ApiSuccess<Task>>(`/api/lists/${listId}/tasks`, taskPayload(data));

    return response.data.data;
}

export async function updateTask(task: Task, data: TaskFormData): Promise<Task> {
    const response = await api.patch<ApiSuccess<Task>>(`/api/tasks/${task.id}`, taskPayload(data));

    return response.data.data;
}

export async function deleteTask(taskId: number): Promise<void> {
    await api.delete(`/api/tasks/${taskId}`);
}

export function extractFieldErrors(message: string, errors?: Record<string, string[]>): TaskFieldErrors {
    const fieldErrors: TaskFieldErrors = {};

    if (errors === undefined) {
        return { form: message };
    }

    for (const [field, messages] of Object.entries(errors)) {
        fieldErrors[field] = messages[0];
    }

    return fieldErrors;
}
