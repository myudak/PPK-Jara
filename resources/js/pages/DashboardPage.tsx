import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { ListCreateForm } from '@/features/lists/ListCreateForm';
import { fetchLists } from '@/features/lists/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/features/auth/AuthContext';
import { getApiErrorMessage } from '@/lib/api';
import type { TaskList } from '@/types/domain';

export function DashboardPage() {
    const { user } = useAuth();
    const [lists, setLists] = useState<TaskList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadLists = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchLists();
            setLists(data);
            setError(null);
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isCurrent = true;

        fetchLists()
            .then((data) => {
                if (isCurrent) {
                    setLists(data);
                }
            })
            .catch((requestError: unknown) => {
                if (isCurrent) {
                    setError(getApiErrorMessage(requestError));
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
    }, []);

    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Your workspace</p>
                    <h1>Good work starts here, {user?.name.split(' ')[0]}.</h1>
                </div>
            </header>

            <ListCreateForm onCreated={(list) => setLists((current) => [list, ...current])} />

            {isLoading && <div role="status" className="loader" aria-label="Loading task lists" />}

            {!isLoading && error && (
                <div role="alert" className="action-card">
                    <h2>Something went wrong.</h2>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                            setIsLoading(true);
                            void loadLists();
                        }}
                    >
                        Try again
                    </button>
                </div>
            )}

            {!isLoading && !error && lists.length === 0 && (
                <EmptyState
                    eyebrow="No lists yet"
                    title="Create your first task list."
                    description="Use the form above to start a personal or shared list. Lists you own or join will appear here."
                />
            )}

            {!isLoading && !error && lists.length > 0 && (
                <ul className="list-grid" aria-label="Your task lists">
                    {lists.map((list) => (
                        <li key={list.id}>
                            <Link to={`/lists/${list.id}`} className="list-card">
                                <span className="eyebrow">Task list</span>
                                <strong>{list.name}</strong>
                                <p>{list.description ?? 'No description yet.'}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
