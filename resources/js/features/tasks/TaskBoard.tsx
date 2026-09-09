import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    createTask,
    deleteTask,
    fetchProgress,
    fetchTasks,
    updateTask,
    type TaskFilters,
    type TaskProgress,
} from './api';
import { TaskCard } from './TaskCard';
import { TaskFormDialog } from './TaskFormDialog';
import { getApiErrorMessage } from '@/lib/api';
import type { Task, TaskPriority, TaskStatus, User } from '@/types/domain';

const DEFAULT_FILTERS: TaskFilters = {
    priority: '',
    status: '',
    sort: 'id',
    direction: 'asc',
};

interface TaskBoardProps {
    listId: string;
}

export function TaskBoard({ listId }: TaskBoardProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [progress, setProgress] = useState<TaskProgress | null>(null);
    const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [busyTaskId, setBusyTaskId] = useState<number | null>(null);

    const loadBoard = useCallback(
        async (activeFilters: TaskFilters) => {
            setIsLoading(true);
            setError(null);

            try {
                const [taskList, taskProgress] = await Promise.all([
                    fetchTasks(listId, activeFilters),
                    fetchProgress(listId),
                ]);

                setTasks(taskList);
                setProgress(taskProgress);
            } catch (loadError: unknown) {
                setError(getApiErrorMessage(loadError));
            } finally {
                setIsLoading(false);
            }
        },
        [listId],
    );

    useEffect(() => {
        void loadBoard(filters);
    }, [loadBoard, filters]);

    const refresh = useCallback(() => loadBoard(filters), [filters, loadBoard]);

    const setFilter = <K extends keyof TaskFilters>(filter: K, value: TaskFilters[K]) => {
        setFilters((current) => ({ ...current, [filter]: value }));
    };

    const participants = useMemo<User[]>(() => {
        const participantMap = new Map<number, User>();

        for (const task of tasks) {
            if (task.assignee !== undefined && !participantMap.has(task.assignee.id)) {
                participantMap.set(task.assignee.id, task.assignee);
            }
        }

        return [...participantMap.values()];
    }, [tasks]);

    const handleAdvanceStatus = useCallback(
        async (task: Task, status: 'IN_PROGRESS' | 'COMPLETED') => {
            setBusyTaskId(task.id);
            setError(null);
            setNotice(null);

            try {
                await updateTask(task, {
                    title: task.title,
                    description: task.description ?? '',
                    priority: task.priority,
                    status,
                    assignee_id: task.assignee_id === null ? '' : String(task.assignee_id),
                    start_date: task.start_date ?? '',
                    due_date: task.due_date ?? '',
                });
                await refresh();
            } catch (statusError: unknown) {
                setError(getApiErrorMessage(statusError));
            } finally {
                setBusyTaskId(null);
            }
        },
        [refresh],
    );

    const handleDelete = useCallback(
        async (task: Task) => {
            if (!window.confirm(`Delete the task "${task.title}"? This cannot be undone.`)) {
                return;
            }

            setBusyTaskId(task.id);
            setError(null);
            setNotice(null);

            try {
                await deleteTask(task.id);
                setNotice('Task deleted successfully.');
                if (editingTask !== null && editingTask.id === task.id) {
                    setFormOpen(false);
                    setEditingTask(null);
                }
                await refresh();
            } catch (deleteError: unknown) {
                setError(getApiErrorMessage(deleteError));
            } finally {
                setBusyTaskId(null);
            }
        },
        [editingTask, refresh],
    );

    const openCreateForm = () => {
        setEditingTask(null);
        setFormOpen(true);
    };

    const openEditForm = (task: Task) => {
        setEditingTask(task);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditingTask(null);
    };

    const handleSaved = async (message: string) => {
        setFormOpen(false);
        setEditingTask(null);
        setNotice(message);
        await refresh();
    };

    return (
        <section className="task-board" aria-label="Tasks">
            <div className="task-board-header">
                {progress !== null && (
                    <div
                        className="task-progress"
                        role="status"
                        aria-label={`${progress.completed} of ${progress.total} tasks completed`}
                    >
                        <div className="task-progress-bar">
                            <div className="task-progress-fill" style={{ width: `${progress.percent}%` }} />
                        </div>
                        <span className="task-progress-label">
                            {progress.completed}/{progress.total} completed ({progress.percent}%)
                        </span>
                    </div>
                )}
                <button type="button" className="primary-button" onClick={openCreateForm}>
                    New task
                </button>
            </div>

            <div className="task-toolbar">
                <label htmlFor="filter-priority">Priority</label>
                <select
                    id="filter-priority"
                    value={filters.priority}
                    onChange={(event) => setFilter('priority', event.target.value as TaskPriority | '')}
                >
                    <option value="">All priorities</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                </select>

                <label htmlFor="filter-status">Status</label>
                <select
                    id="filter-status"
                    value={filters.status}
                    onChange={(event) => setFilter('status', event.target.value as TaskStatus | '')}
                >
                    <option value="">All statuses</option>
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>

                <label htmlFor="filter-sort">Sort by</label>
                <select
                    id="filter-sort"
                    value={filters.sort}
                    onChange={(event) => setFilter('sort', event.target.value as TaskFilters['sort'])}
                >
                    <option value="id">Created</option>
                    <option value="priority">Priority</option>
                    <option value="due_date">Due date</option>
                </select>

                <button
                    type="button"
                    className="text-button"
                    onClick={() => setFilter('direction', filters.direction === 'asc' ? 'desc' : 'asc')}
                >
                    Direction: {filters.direction === 'asc' ? 'ascending' : 'descending'}
                </button>
            </div>

            {error !== null && (
                <p className="form-error" role="alert">
                    {error}
                </p>
            )}
            {notice !== null && (
                <p className="task-notice" role="status">
                    {notice}
                </p>
            )}

            {formOpen && (
                <TaskFormDialog
                    key={editingTask?.id ?? 'create'}
                    listId={listId}
                    editingTask={editingTask}
                    participants={participants}
                    onCancel={closeForm}
                    onSaved={(message) => void handleSaved(message)}
                />
            )}

            {isLoading ? (
                <p className="task-loading" role="status">
                    Loading tasks…
                </p>
            ) : tasks.length === 0 ? (
                <div className="empty-state">
                    <span className="eyebrow">Nothing here yet</span>
                    <h2>No tasks found</h2>
                    <p>
                        {filters.priority !== '' || filters.status !== ''
                            ? 'No tasks match the current filters.'
                            : 'Create the first task to start tracking progress.'}
                    </p>
                </div>
            ) : (
                <ul className="task-list">
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <TaskCard
                                task={task}
                                isBusy={busyTaskId === task.id}
                                onEdit={openEditForm}
                                onDelete={(taskCard) => void handleDelete(taskCard)}
                                onAdvanceStatus={(taskCard, status) => void handleAdvanceStatus(taskCard, status)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
