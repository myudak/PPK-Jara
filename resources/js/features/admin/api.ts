import { api } from '@/lib/api';
import type { ApiSuccess } from '@/types/api';
import type { User, UserRole, UserStatus } from '@/types/domain';

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface AdminUserListData {
    users: User[];
    meta: PaginationMeta;
}

export interface AdminUserPayload {
    name: string;
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
}

export async function fetchAdminUsers(page = 1): Promise<AdminUserListData> {
    const response = await api.get<ApiSuccess<AdminUserListData>>('/api/admin/users', {
        params: { page },
    });

    return response.data.data;
}

export async function createAdminUser(payload: AdminUserPayload): Promise<User> {
    const response = await api.post<ApiSuccess<User>>('/api/admin/users', payload);

    return response.data.data;
}

export async function updateAdminUser(
    id: number,
    payload: Partial<AdminUserPayload>,
): Promise<User> {
    const response = await api.patch<ApiSuccess<User>>(`/api/admin/users/${id}`, payload);

    return response.data.data;
}
