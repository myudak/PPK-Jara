import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import {
    addMember,
    deleteList,
    deleteTask,
    fetchList,
    fetchMembers,
    fetchTasks,
    removeMember,
    updateTask,
} from '@/features/workspace/api';
import { ListFormDialog } from '@/features/workspace/ListFormDialog';
import { ListWorkspaceHeader } from '@/features/workspace/ListWorkspaceHeader';
import { PeopleCard } from '@/features/workspace/PeopleCard';
import { TaskFormDialog } from '@/features/workspace/TaskFormDialog';
import { TaskSection } from '@/features/workspace/TaskSection';
import { getApiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ListMember, Task, TaskList, TaskStatus } from '@/types/domain';

export function ListDetailPage() {
    const { id } = useParams();

    return <ListDetailWorkspace key={id ?? 'invalid-list'} id={id} />;
}

interface ListDetailWorkspaceProps {
    id?: string;
}

function ListDetailWorkspace({ id }: ListDetailWorkspaceProps) {
    const listId = Number(id);
    const isValidListId = Number.isInteger(listId) && listId > 0;
    const navigate = useNavigate();
    const { user } = useAuth();
    const [list, setList] = useState<TaskList | null>(null);
    const [members, setMembers] = useState<ListMember[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(isValidListId);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [editingList, setEditingList] = useState(false);
    const [taskForm, setTaskForm] = useState<Task | 'new' | null>(null);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [isDeletingList, setIsDeletingList] = useState(false);
    const [pendingTaskIds, setPendingTaskIds] = useState<Set<number>>(() => new Set());
    const [pendingMemberIds, setPendingMemberIds] = useState<Set<number>>(() => new Set());
    const pendingTaskIdsRef = useRef(new Set<number>());
    const pendingMemberIdsRef = useRef(new Set<number>());

    useEffect(() => {
        let isCurrent = true;

        if (!isValidListId) {
            return;
        }

        Promise.all([fetchList(listId), fetchMembers(listId), fetchTasks(listId)])
            .then(([loadedList, loadedMembers, loadedTasks]) => {
                if (!isCurrent) {
                    return;
                }
                setList(loadedList);
                setMembers(loadedMembers);
                setTasks(loadedTasks);
                setLoadError(null);
            })
            .catch((requestError: unknown) => {
                if (isCurrent) {
                    setLoadError(getApiErrorMessage(requestError));
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setIsLoading(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [isValidListId, listId, reloadToken]);

    const handleAddMember = async (userId: number): Promise<boolean> => {
        const targetListId = listId;
        if (pendingMemberIdsRef.current.has(userId)) {
            return false;
        }
        pendingMemberIdsRef.current.add(userId);
        setPendingMemberIds(new Set(pendingMemberIdsRef.current));
        setActionError(null);
        setIsAddingMember(true);
        try {
            const member = await addMember(targetListId, userId);
            setMembers((current) => [...current, member]);
            return true;
        } catch (requestError: unknown) {
            setActionError(getApiErrorMessage(requestError));
            return false;
        } finally {
            pendingMemberIdsRef.current.delete(userId);
            setPendingMemberIds(new Set(pendingMemberIdsRef.current));
            setIsAddingMember(false);
        }
    };

    const handleRemoveMember = async (member: ListMember) => {
        const targetListId = listId;
        if (pendingMemberIdsRef.current.has(member.user_id)) {
            return;
        }
        pendingMemberIdsRef.current.add(member.user_id);
        setPendingMemberIds(new Set(pendingMemberIdsRef.current));
        setActionError(null);
        try {
            await removeMember(targetListId, member.user_id);
            setMembers((current) => current.filter((item) => item.user_id !== member.user_id));
            setTasks((current) =>
                current.map((task) => ({
                    ...task,
                    assignee_ids: task.assignee_ids.filter((userId) => userId !== member.user_id),
                    assignees: task.assignees?.filter((assignee) => assignee.id !== member.user_id),
                })),
            );
        } catch (requestError: unknown) {
            setActionError(getApiErrorMessage(requestError));
        } finally {
            pendingMemberIdsRef.current.delete(member.user_id);
            setPendingMemberIds(new Set(pendingMemberIdsRef.current));
        }
    };

    const handleDeleteList = async () => {
        if (list === null) {
            return;
        }

        setActionError(null);
        setIsDeletingList(true);
        try {
            await deleteList(list.id);
            void navigate('/dashboard');
        } catch (requestError: unknown) {
            setActionError(getApiErrorMessage(requestError));
            setIsDeletingList(false);
        }
    };

    const handleStatusChange = async (task: Task, status: TaskStatus) => {
        if (pendingTaskIdsRef.current.has(task.id)) {
            return;
        }
        pendingTaskIdsRef.current.add(task.id);
        setPendingTaskIds(new Set(pendingTaskIdsRef.current));
        setActionError(null);
        try {
            const updated = await updateTask(task.id, { status });
            setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        } catch (requestError: unknown) {
            setActionError(getApiErrorMessage(requestError));
        } finally {
            pendingTaskIdsRef.current.delete(task.id);
            setPendingTaskIds(new Set(pendingTaskIdsRef.current));
        }
    };

    const handleDeleteTask = async (task: Task) => {
        if (pendingTaskIdsRef.current.has(task.id)) {
            return;
        }
        pendingTaskIdsRef.current.add(task.id);
        setPendingTaskIds(new Set(pendingTaskIdsRef.current));
        setActionError(null);
        try {
            await deleteTask(task.id);
            setTasks((current) => current.filter((item) => item.id !== task.id));
        } catch (requestError: unknown) {
            setActionError(getApiErrorMessage(requestError));
        } finally {
            pendingTaskIdsRef.current.delete(task.id);
            setPendingTaskIds(new Set(pendingTaskIdsRef.current));
        }
    };

    if (isLoading) {
        return (
            <div className="grid gap-6" aria-label="Loading list workspace" aria-busy="true">
                <Skeleton className="h-24 w-full" />
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        );
    }

    if (!isValidListId || loadError !== null || list === null) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Could not load this workspace</AlertTitle>
                <AlertDescription className="grid gap-3">
                    <span>
                        {!isValidListId
                            ? 'This list URL is invalid.'
                            : (loadError ?? 'The list was not returned by the server.')}
                    </span>
                    <div className="flex gap-2">
                        <Link
                            to="/dashboard"
                            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                        >
                            Back to dashboard
                        </Link>
                        {isValidListId && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    setLoadError(null);
                                    setIsLoading(true);
                                    setReloadToken((token) => token + 1);
                                }}
                            >
                                Try again
                            </Button>
                        )}
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    const isOwner = list.owner_id === user?.id;
    const completedCount = tasks.filter((task) => task.status === 'COMPLETED').length;
    const participantMap = new Map<number, string>();
    participantMap.set(
        list.owner_id,
        list.owner?.name ?? (isOwner && user !== null ? user.name : `User #${list.owner_id}`),
    );
    for (const member of members) {
        participantMap.set(member.user_id, member.user?.name ?? `User #${member.user_id}`);
    }
    const participants = [...participantMap].map(([participantId, name]) => ({
        id: participantId,
        name,
    }));

    return (
        <div className="grid gap-6">
            <ListWorkspaceHeader
                list={list}
                isOwner={isOwner}
                completedCount={completedCount}
                taskCount={tasks.length}
                isDeleting={isDeletingList}
                onCreateTask={() => setTaskForm('new')}
                onEditList={() => setEditingList(true)}
                onDeleteList={handleDeleteList}
            />

            {actionError !== null && (
                <Alert variant="destructive">
                    <AlertTitle>Action failed</AlertTitle>
                    <AlertDescription>{actionError}</AlertDescription>
                </Alert>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <TaskSection
                    key={`tasks-${listId}`}
                    tasks={tasks}
                    pendingTaskIds={pendingTaskIds}
                    onCreate={() => setTaskForm('new')}
                    onEdit={setTaskForm}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTask}
                />
                <PeopleCard
                    key={`people-${listId}`}
                    ownerName={
                        list.owner?.name ??
                        (isOwner && user !== null ? user.name : `User #${list.owner_id}`)
                    }
                    members={members}
                    isOwner={isOwner}
                    isAddingMember={isAddingMember}
                    pendingMemberIds={pendingMemberIds}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveMember}
                    onValidationError={setActionError}
                />
            </div>

            {editingList && (
                <ListFormDialog
                    list={list}
                    onClose={() => setEditingList(false)}
                    onSaved={(updated) => {
                        setList(updated);
                        setEditingList(false);
                    }}
                />
            )}

            {taskForm !== null && (
                <TaskFormDialog
                    list={list}
                    task={taskForm === 'new' ? undefined : taskForm}
                    participants={participants}
                    onClose={() => setTaskForm(null)}
                    onSaved={(saved) => {
                        setTasks((current) => {
                            const exists = current.some((task) => task.id === saved.id);
                            return exists
                                ? current.map((task) => (task.id === saved.id ? saved : task))
                                : [saved, ...current];
                        });
                        setTaskForm(null);
                    }}
                />
            )}
        </div>
    );
}
