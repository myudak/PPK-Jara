import { api } from '@/lib/api';
import type { ApiSuccess } from '@/types/api';
import type { ListMember, Task, TaskList, TaskPriority, TaskStatus } from '@/types/domain';

export interface ListPayload {
    name: string;
    description?: string | null;
}

export interface TaskPayload {
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignee_ids?: number[];
    start_date?: string | null;
    due_date?: string | null;
}

export async function fetchLists(): Promise<TaskList[]> {
    const response = await api.get<ApiSuccess<TaskList[]>>('/api/lists');
    return response.data.data;
}

export async function createList(payload: ListPayload): Promise<TaskList> {
    const response = await api.post<ApiSuccess<TaskList>>('/api/lists', payload);
    return response.data.data;
}

export async function fetchList(id: number): Promise<TaskList> {
    const response = await api.get<ApiSuccess<TaskList>>(`/api/lists/${id}`);
    return response.data.data;
}

export async function updateList(id: number, payload: Partial<ListPayload>): Promise<TaskList> {
    const response = await api.patch<ApiSuccess<TaskList>>(`/api/lists/${id}`, payload);
    return response.data.data;
}

export async function deleteList(id: number): Promise<void> {
    await api.delete(`/api/lists/${id}`);
}

export async function fetchMembers(listId: number): Promise<ListMember[]> {
    const response = await api.get<ApiSuccess<ListMember[]>>(`/api/lists/${listId}/members`);
    return response.data.data;
}

export async function addMember(listId: number, userId: number): Promise<ListMember> {
    const response = await api.post<ApiSuccess<ListMember>>(`/api/lists/${listId}/members`, {
        user_id: userId,
    });
    return response.data.data;
}

export async function removeMember(listId: number, userId: number): Promise<void> {
    await api.delete(`/api/lists/${listId}/members/${userId}`);
}

export async function fetchTasks(listId: number): Promise<Task[]> {
    const response = await api.get<ApiSuccess<Task[]>>(`/api/lists/${listId}/tasks`);
    return response.data.data;
}

export async function createTask(listId: number, payload: TaskPayload): Promise<Task> {
    const response = await api.post<ApiSuccess<Task>>(`/api/lists/${listId}/tasks`, payload);
    return response.data.data;
}

export async function fetchTask(id: number): Promise<Task> {
    const response = await api.get<ApiSuccess<Task>>(`/api/tasks/${id}`);
    return response.data.data;
}

export async function updateTask(id: number, payload: Partial<TaskPayload>): Promise<Task> {
    const response = await api.patch<ApiSuccess<Task>>(`/api/tasks/${id}`, payload);
    return response.data.data;
}

export async function deleteTask(id: number): Promise<void> {
    await api.delete(`/api/tasks/${id}`);
}
