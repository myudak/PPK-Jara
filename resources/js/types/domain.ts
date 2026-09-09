export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}

export interface TaskList {
    id: number;
    name: string;
    description: string | null;
    owner_id: number;
    created_at: string;
    updated_at: string;
}

export interface ListMember {
    task_list_id: number;
    user_id: number;
    joined_at: string;
    user?: User;
}

export interface Task {
    id: number;
    task_list_id: number;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    assignee_id: number | null;
    start_date: string | null;
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}
