import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthContext';
import { fetchLists } from '@/features/workspace/api';
import { ListFormDialog } from '@/features/workspace/ListFormDialog';
import { getApiErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { TaskList } from '@/types/domain';

export function DashboardPage() {
    const { user } = useAuth();
    const [lists, setLists] = useState<TaskList[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        let isCurrent = true;

        fetchLists()
            .then((data) => {
                if (isCurrent) {
                    setLists(data);
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
    }, [reloadToken]);

    const isLoading = lists === null && error === null;

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                        Your workspace
                    </p>
                    <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
                        Good work starts here, {user?.name.split(' ')[0]}.
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Open a shared list or create a new place for your team to work.
                    </p>
                </div>
                <Button onClick={() => setShowCreate(true)}>Create list</Button>
            </header>

            {error !== null && (
                <Alert variant="destructive">
                    <AlertTitle>Could not load your lists</AlertTitle>
                    <AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span>{error}</span>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setLists(null);
                                setError(null);
                                setReloadToken((token) => token + 1);
                            }}
                        >
                            Try again
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {isLoading && (
                <section
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    aria-label="Loading task lists"
                    aria-busy="true"
                >
                    {[0, 1, 2].map((item) => (
                        <Card key={item}>
                            <CardHeader>
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}

            {lists !== null && error === null && lists.length === 0 && (
                <Card className="border-dashed py-10 text-center">
                    <CardHeader>
                        <CardTitle>No lists yet</CardTitle>
                        <CardDescription>
                            Create your first list to organize tasks and invite collaborators.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setShowCreate(true)}>Create your first list</Button>
                    </CardContent>
                </Card>
            )}

            {lists !== null && error === null && lists.length > 0 && (
                <section
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    aria-label="Task lists"
                >
                    {lists.map((list) => (
                        <Card key={list.id} className="transition-shadow hover:shadow-md">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <CardTitle>{list.name}</CardTitle>
                                    <Badge
                                        variant={
                                            list.owner_id === user?.id ? 'default' : 'secondary'
                                        }
                                    >
                                        {list.owner_id === user?.id ? 'Owner' : 'Member'}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2 min-h-10">
                                    {list.description || 'No description provided.'}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="justify-end">
                                <Link to={`/lists/${list.id}`} className={cn(buttonVariants())}>
                                    Open workspace
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </section>
            )}

            {showCreate && (
                <ListFormDialog
                    onClose={() => setShowCreate(false)}
                    onSaved={(created) => {
                        setLists((current) =>
                            current === null ? [created] : [created, ...current],
                        );
                        setShowCreate(false);
                    }}
                />
            )}
        </div>
    );
}
