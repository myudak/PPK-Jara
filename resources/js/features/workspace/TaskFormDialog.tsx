import { useState, type FormEvent } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createTask, updateTask, type TaskPayload } from '@/features/workspace/api';
import { getApiErrorMessage } from '@/lib/api';
import type { Task, TaskList, TaskPriority, TaskStatus } from '@/types/domain';

interface ParticipantOption {
    id: number;
    name: string;
}

interface TaskFormDialogProps {
    list: TaskList;
    task?: Task;
    participants: ParticipantOption[];
    onClose: () => void;
    onSaved: (task: Task) => void;
}

const priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

export function TaskFormDialog({
    list,
    task,
    participants,
    onClose,
    onSaved,
}: TaskFormDialogProps) {
    const [title, setTitle] = useState(task?.title ?? '');
    const [description, setDescription] = useState(task?.description ?? '');
    const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM');
    const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO');
    const [startDate, setStartDate] = useState(task?.start_date ?? '');
    const [dueDate, setDueDate] = useState(task?.due_date ?? '');
    const [assigneeIds, setAssigneeIds] = useState<number[]>(task?.assignee_ids ?? []);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleAssignee = (userId: number) => {
        setAssigneeIds((current) =>
            current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
        );
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (startDate && dueDate && dueDate < startDate) {
            setError('Due date cannot be earlier than the start date.');
            return;
        }

        setIsSaving(true);
        const payload: TaskPayload = {
            title: title.trim(),
            description: description.trim() || null,
            priority,
            status,
            assignee_ids: assigneeIds,
            start_date: startDate || null,
            due_date: dueDate || null,
        };

        try {
            const saved = task
                ? await updateTask(task.id, payload)
                : await createTask(list.id, payload);
            onSaved(saved);
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError));
            setIsSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit task' : 'Create a task'}</DialogTitle>
                    <DialogDescription>
                        Plan the work, dates, and people responsible for it.
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
                    <div className="grid gap-2">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="task-description">Description (optional)</Label>
                        <Textarea
                            id="task-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={(value) => setPriority(value as TaskPriority)}
                            >
                                <SelectTrigger id="task-priority" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {priorities.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task-status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(value) => setStatus(value as TaskStatus)}
                            >
                                <SelectTrigger id="task-status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="task-start-date">Start date (optional)</Label>
                            <Input
                                id="task-start-date"
                                type="date"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="task-due-date">Due date (optional)</Label>
                            <Input
                                id="task-due-date"
                                type="date"
                                min={startDate || undefined}
                                value={dueDate}
                                onChange={(event) => setDueDate(event.target.value)}
                            />
                        </div>
                    </div>
                    <fieldset className="grid gap-2">
                        <legend className="text-sm font-medium">Assignees (optional)</legend>
                        {participants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No participant details available.
                            </p>
                        ) : (
                            <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                                {participants.map((participant) => (
                                    <label
                                        key={participant.id}
                                        className="flex min-w-0 items-center gap-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={assigneeIds.includes(participant.id)}
                                            onChange={() => toggleAssignee(participant.id)}
                                        />
                                        <span className="truncate">{participant.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </fieldset>
                    {error !== null && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving || title.trim().length === 0}
                            focusableWhenDisabled={isSaving}
                            aria-live="polite"
                            aria-busy={isSaving}
                        >
                            {isSaving ? 'Saving...' : task ? 'Save task' : 'Create task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
