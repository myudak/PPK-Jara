import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DestructiveConfirmDialog } from '@/features/workspace/DestructiveConfirmDialog';
import type { Task, TaskStatus } from '@/types/domain';

const statusLabels: Record<TaskStatus, string> = {
    TODO: 'To do',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed',
};

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
        new Date(`${value}T00:00:00`),
    );
}

interface TaskSectionProps {
    tasks: Task[];
    pendingTaskIds: ReadonlySet<number>;
    onCreate: () => void;
    onEdit: (task: Task) => void;
    onStatusChange: (task: Task, status: TaskStatus) => Promise<void>;
    onDelete: (task: Task) => Promise<void>;
}

export function TaskSection({
    tasks,
    pendingTaskIds,
    onCreate,
    onEdit,
    onStatusChange,
    onDelete,
}: TaskSectionProps) {
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
    ).padStart(2, '0')}`;

    return (
        <section className="grid min-w-0 gap-4" aria-labelledby="tasks-heading">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 id="tasks-heading" className="text-xl font-semibold">
                        Tasks
                    </h2>
                    <p className="text-sm text-muted-foreground">{tasks.length} total</p>
                </div>
                <Button className="sm:hidden" onClick={onCreate}>
                    New task
                </Button>
            </div>

            {tasks.length === 0 ? (
                <Card className="border-dashed py-8 text-center">
                    <CardHeader>
                        <CardTitle>No tasks yet</CardTitle>
                        <CardDescription>Create the first task for this list.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={onCreate}>Create task</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {tasks.map((task) => {
                        const isOverdue =
                            task.due_date !== null &&
                            task.due_date < today &&
                            task.status !== 'COMPLETED';
                        const assigneeNames = task.assignees?.map((assignee) => assignee.name);

                        return (
                            <Card key={task.id}>
                                <CardHeader>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <CardTitle className="break-words">
                                                {task.title}
                                            </CardTitle>
                                            {task.description && (
                                                <CardDescription className="mt-1 whitespace-pre-wrap">
                                                    {task.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <Badge
                                                variant={
                                                    task.priority === 'HIGH'
                                                        ? 'destructive'
                                                        : task.priority === 'LOW'
                                                          ? 'outline'
                                                          : 'secondary'
                                                }
                                            >
                                                {task.priority} priority
                                            </Badge>
                                            {isOverdue && (
                                                <Badge variant="destructive">Overdue</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                                    <div>
                                        <span className="text-muted-foreground">Dates: </span>
                                        {task.start_date
                                            ? formatDate(task.start_date)
                                            : 'No start date'}
                                        {' - '}
                                        {task.due_date ? formatDate(task.due_date) : 'No due date'}
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Assignees: </span>
                                        {assigneeNames !== undefined && assigneeNames.length > 0
                                            ? assigneeNames.join(', ')
                                            : task.assignee_ids.length > 0
                                              ? task.assignee_ids
                                                    .map((assigneeId) => `#${assigneeId}`)
                                                    .join(', ')
                                              : 'Unassigned'}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                                    <div className="grid gap-1">
                                        <Label
                                            htmlFor={`task-status-${task.id}`}
                                            className="sr-only"
                                        >
                                            Status for {task.title}
                                        </Label>
                                        <Select
                                            value={task.status}
                                            disabled={pendingTaskIds.has(task.id)}
                                            onValueChange={(value) =>
                                                void onStatusChange(task, value as TaskStatus)
                                            }
                                        >
                                            <SelectTrigger id={`task-status-${task.id}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(statusLabels) as TaskStatus[]).map(
                                                    (status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {statusLabels[status]}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(task)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={pendingTaskIds.has(task.id)}
                                            onClick={() => setTaskToDelete(task)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            <DestructiveConfirmDialog
                open={taskToDelete !== null}
                title="Delete this task?"
                description={
                    taskToDelete === null
                        ? ''
                        : `Delete “${taskToDelete.title}”? This action cannot be undone.`
                }
                actionLabel="Delete task"
                pendingLabel="Deleting..."
                pending={taskToDelete !== null && pendingTaskIds.has(taskToDelete.id)}
                onOpenChange={(open) => !open && setTaskToDelete(null)}
                onConfirm={async () => {
                    if (taskToDelete !== null) {
                        await onDelete(taskToDelete);
                    }
                }}
            />
        </section>
    );
}
