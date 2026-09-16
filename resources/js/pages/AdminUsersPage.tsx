import { useCallback, useEffect, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { deleteAdminUser, fetchAdminUsers } from '@/features/admin/api';
import type { AdminUserListData } from '@/features/admin/api';
import { UserForm } from '@/features/admin/UserForm';
import { useAuth } from '@/features/auth/AuthContext';
import { getApiErrorMessage } from '@/lib/api';
import type { User } from '@/types/domain';

export function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const [listData, setListData] = useState<AdminUserListData | null>(null);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [formUser, setFormUser] = useState<User | 'new' | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [rowError, setRowError] = useState<string | null>(null);
    const [pendingUserId, setPendingUserId] = useState<number | null>(null);

    useEffect(() => {
        let isCurrent = true;

        fetchAdminUsers(page)
            .then((data) => {
                if (isCurrent) {
                    setListData(data);
                    setError(null);
                }
            })
            .catch((requestError: unknown) => {
                if (isCurrent) {
                    setError(getApiErrorMessage(requestError));
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [page, reloadToken]);

    const retry = useCallback(() => {
        setError(null);
        setReloadToken((token) => token + 1);
    }, []);

    const handleSaved = useCallback(() => {
        setFormUser(null);
        setReloadToken((token) => token + 1);
    }, []);

    const handleDelete = useCallback(async () => {
        if (deleteTarget === null) {
            return;
        }

        setRowError(null);
        setPendingUserId(deleteTarget.id);

        try {
            await deleteAdminUser(deleteTarget.id);
            setDeleteTarget(null);
            setReloadToken((token) => token + 1);
        } catch (requestError: unknown) {
            setRowError(getApiErrorMessage(requestError));
        } finally {
            setPendingUserId(null);
        }
    }, [deleteTarget]);

    const users = listData?.users ?? [];
    const meta = listData?.meta;
    const currentPage = meta?.current_page ?? page;
    const lastPage = meta?.last_page ?? page;
    const isLoading = error === null && (listData === null || listData.meta.current_page !== page);

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-3xl space-y-3">
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                        Administration / Users
                    </p>
                    <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
                        User directory
                    </h1>
                    <p className="text-muted-foreground">
                        Create accounts, maintain roles, and remove access without losing work
                        history.
                    </p>
                </div>
                <Button onClick={() => setFormUser('new')}>New user</Button>
            </header>

            {error !== null ? (
                <EmptyState
                    eyebrow="Something went wrong"
                    title="Could not load users"
                    description={error}
                    action={<Button onClick={retry}>Try again</Button>}
                />
            ) : null}

            {error === null && isLoading ? (
                <Card aria-busy="true" aria-live="polite">
                    <CardContent className="space-y-3 py-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ) : null}

            {error === null && !isLoading && users.length === 0 ? (
                <EmptyState
                    eyebrow="User directory"
                    title="No users yet"
                    description="Create the first account so people can sign in and start collaborating."
                    action={<Button onClick={() => setFormUser('new')}>Create user</Button>}
                />
            ) : null}

            {error === null && !isLoading && users.length > 0 ? (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const isSelf = currentUser?.id === user.id;
                                    const isPending = pendingUserId === user.id;

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.name}
                                            </TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.role === 'ADMIN'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.status === 'ACTIVE'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setFormUser(user)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={
                                                            isSelf ||
                                                            isPending ||
                                                            user.status === 'DISABLED'
                                                        }
                                                        title={
                                                            isSelf
                                                                ? 'You cannot delete your own account.'
                                                                : user.status === 'DISABLED'
                                                                  ? 'This account has already been deleted.'
                                                                  : undefined
                                                        }
                                                        focusableWhenDisabled={isPending}
                                                        aria-live="polite"
                                                        onClick={() => {
                                                            setRowError(null);
                                                            setDeleteTarget(user);
                                                        }}
                                                    >
                                                        {isPending ? 'Deleting...' : 'Delete'}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <CardContent className="flex items-center justify-between gap-4 border-t py-4">
                        <Button
                            variant="outline"
                            disabled={isLoading || currentPage <= 1}
                            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {lastPage}
                        </span>
                        <Button
                            variant="outline"
                            disabled={isLoading || currentPage >= lastPage}
                            onClick={() => setPage((previous) => Math.min(lastPage, previous + 1))}
                        >
                            Next
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            {formUser !== null && currentUser !== null ? (
                <UserForm
                    user={formUser === 'new' ? null : formUser}
                    currentUserId={currentUser.id}
                    onClose={() => setFormUser(null)}
                    onSaved={handleSaved}
                />
            ) : null}

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open && pendingUserId === null) {
                        setDeleteTarget(null);
                        setRowError(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {deleteTarget?.name}&apos;s account?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            The account will immediately lose access. JARA keeps its lists,
                            memberships, and assignments so collaboration history remains intact.
                        </AlertDialogDescription>
                        {rowError !== null ? (
                            <Alert variant="destructive" role="alert">
                                <AlertTitle>Could not delete the account</AlertTitle>
                                <AlertDescription>{rowError}</AlertDescription>
                            </Alert>
                        ) : null}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={pendingUserId !== null}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={pendingUserId !== null}
                            focusableWhenDisabled
                            aria-live="polite"
                            aria-busy={pendingUserId !== null}
                            onClick={() => void handleDelete()}
                        >
                            {pendingUserId !== null ? 'Deleting...' : 'Delete account'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
