import type { Task } from '@/types/domain';

import { isOverdue, nextStatus, priorityLabel, statusLabel } from './taskUtils';

interface TaskCardProps {
    task: Task;
    isBusy: boolean;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onAdvanceStatus: (task: Task, status: 'IN_PROGRESS' | 'COMPLETED') => void;
}

export function TaskCard({ task, isBusy, onEdit, onDelete, onAdvanceStatus }: TaskCardProps) {
    const upcomingStatus = nextStatus(task);
    const overdue = isOverdue(task);

    return (
        <article className={`task-card${overdue ? ' task-card-overdue' : ''}`}>
            <header className="task-card-header">
                <h3>{task.title}</h3>
                <div className="task-badges">
                    <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
                        {priorityLabel(task.priority)}
                    </span>
                    <span className={`badge badge-status-${task.status.toLowerCase()}`}>
                        {statusLabel(task.status)}
                    </span>
                    {overdue && <span className="badge badge-overdue">Overdue</span>}
                </div>
            </header>
            {task.description !== null && <p className="task-card-description">{task.description}</p>}
            <dl className="task-card-meta">
                <div>
                    <dt>Assignee</dt>
                    <dd>{task.assignee?.name ?? 'Unassigned'}</dd>
                </div>
                <div>
                    <dt>Start date</dt>
                    <dd>{task.start_date ?? '—'}</dd>
                </div>
                <div>
                    <dt>Due date</dt>
                    <dd>{task.due_date ?? '—'}</dd>
                </div>
                {task.completed_at !== null && (
                    <div>
                        <dt>Completed</dt>
                        <dd>{new Date(task.completed_at).toLocaleString()}</dd>
                    </div>
                )}
            </dl>
            <footer className="task-card-actions">
                {upcomingStatus !== null && (
                    <button
                        type="button"
                        className="text-button"
                        disabled={isBusy}
                        onClick={() => onAdvanceStatus(task, upcomingStatus)}
                    >
                        {upcomingStatus === 'IN_PROGRESS' ? 'Start task' : 'Mark completed'}
                    </button>
                )}
                <button type="button" className="text-button" disabled={isBusy} onClick={() => onEdit(task)}>
                    Edit
                </button>
                <button
                    type="button"
                    className="text-button text-button-danger"
                    disabled={isBusy}
                    onClick={() => onDelete(task)}
                >
                    Delete
                </button>
            </footer>
        </article>
    );
}
