import type { Task, TaskPriority, TaskStatus } from '@/types/domain';

const PRIORITY_ORDER: TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

export function isOverdue(task: Task, today: Date = new Date()): boolean {
    if (task.status === 'COMPLETED' || task.due_date === null) {
        return false;
    }

    const todayKey = today.toISOString().slice(0, 10);

    return task.due_date < todayKey;
}

export function nextStatus(task: Task): TaskStatus | null {
    if (task.status === 'TODO') {
        return 'IN_PROGRESS';
    }

    if (task.status === 'IN_PROGRESS') {
        return 'COMPLETED';
    }

    return null;
}

export function statusLabel(status: TaskStatus): string {
    switch (status) {
        case 'TODO':
            return 'To do';
        case 'IN_PROGRESS':
            return 'In progress';
        case 'COMPLETED':
            return 'Completed';
    }
}

export function priorityLabel(priority: TaskPriority): string {
    switch (priority) {
        case 'LOW':
            return 'Low';
        case 'MEDIUM':
            return 'Medium';
        case 'HIGH':
            return 'High';
    }
}

export function sortPriorityValues(values: TaskPriority[]): TaskPriority[] {
    return [...values].sort((a, b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b));
}

export function sortStatusValues(values: TaskStatus[]): TaskStatus[] {
    return [...values].sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b));
}
