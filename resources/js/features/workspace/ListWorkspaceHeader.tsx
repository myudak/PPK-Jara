import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress, ProgressLabel } from '@/components/ui/progress';
import { DestructiveConfirmDialog } from '@/features/workspace/DestructiveConfirmDialog';
import type { TaskList } from '@/types/domain';

interface ListWorkspaceHeaderProps {
    list: TaskList;
    isOwner: boolean;
    completedCount: number;
    taskCount: number;
    isDeleting: boolean;
    onCreateTask: () => void;
    onEditList: () => void;
    onDeleteList: () => Promise<void>;
}

export function ListWorkspaceHeader({
    list,
    isOwner,
    completedCount,
    taskCount,
    isDeleting,
    onCreateTask,
    onEditList,
    onDeleteList,
}: ListWorkspaceHeaderProps) {
    const [showDelete, setShowDelete] = useState(false);
    const progress = taskCount === 0 ? 0 : Math.round((completedCount / taskCount) * 100);

    return (
        <header className="grid gap-4 rounded-xl border bg-card p-4 sm:p-6 lg:grid-cols-[1fr_auto]">
            <div className="min-w-0">
                <Link
                    className="text-sm text-muted-foreground hover:text-foreground"
                    to="/dashboard"
                >
                    Workspace / Lists
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <h1 className="break-words font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                        {list.name}
                    </h1>
                    <Badge variant={isOwner ? 'default' : 'secondary'}>
                        {isOwner ? 'Owner' : 'Member'}
                    </Badge>
                </div>
                {list.description && (
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                        {list.description}
                    </p>
                )}
            </div>
            <div className="flex flex-wrap items-start gap-2">
                <Button onClick={onCreateTask}>New task</Button>
                {isOwner && (
                    <>
                        <Button variant="outline" onClick={onEditList}>
                            Edit list
                        </Button>
                        <Button variant="destructive" onClick={() => setShowDelete(true)}>
                            Delete list
                        </Button>
                    </>
                )}
            </div>
            <Progress value={progress} className="lg:col-span-2">
                <ProgressLabel>Overall progress</ProgressLabel>
                <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                    {completedCount} of {taskCount} complete ({progress}%)
                </span>
            </Progress>

            <DestructiveConfirmDialog
                open={showDelete}
                title="Delete this list?"
                description={`Delete “${list.name}” and all of its tasks? This action cannot be undone.`}
                actionLabel="Delete list"
                pendingLabel="Deleting..."
                pending={isDeleting}
                onOpenChange={setShowDelete}
                onConfirm={onDeleteList}
            />
        </header>
    );
}
