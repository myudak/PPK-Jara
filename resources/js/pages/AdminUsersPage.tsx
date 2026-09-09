import { useCallback, useEffect, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { fetchAdminUsers } from '@/features/admin/api';
import type { AdminUserListData } from '@/features/admin/api';
import { getApiErrorMessage } from '@/lib/api';
import type { User } from '@/types/domain';

export function AdminUsersPage() {
    const [listData, setListData] = useState<AdminUserListData | null>(null);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let isCurrent = true;

        fetchAdminUsers(page)
            .then((data) => {
                if (!isCurrent) {
                    return;
                }

                setListData(data);
                setError(null);
            })
            .catch((requestError: unknown) => {
                if (!isCurrent) {
                    return;
                }

                setError(getApiErrorMessage(requestError));
            });

        return () => {
            isCurrent = false;
        };
    }, [page, reloadToken]);

    const retry = useCallback(() => {
        setError(null);
        setReloadToken((token) => token + 1);
    }, []);

    const users = listData?.users ?? [];
    const meta = listData?.meta;
    const currentPage = meta?.current_page ?? page;
    const lastPage = meta?.last_page ?? page;
    const isLoading = error === null && (listData === null || listData.meta.current_page !== page);

    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Administration / Users</p>
                    <h1>User directory.</h1>
                </div>
                {meta !== undefined && !isLoading && (
                    <span className="foundation-badge">{meta.total} users</span>
                )}
            </header>

            {error !== null && (
                <section className="empty-state" role="alert">
                    <span className="eyebrow">Something went wrong</span>
                    <h2>Could not load users.</h2>
                    <p>{error}</p>
                    <button type="button" className="primary-button" onClick={retry}>
                        Try again
                    </button>
                </section>
            )}

            {error === null && isLoading && (
                <section className="admin-loading" aria-busy="true" aria-live="polite">
                    <span className="loader" aria-hidden="true" />
                    <p>Loading users…</p>
                </section>
            )}

            {error === null && !isLoading && users.length === 0 && (
                <EmptyState
                    eyebrow="User directory"
                    title="No users yet."
                    description="Create the first account so people can sign in and start collaborating."
                />
            )}

            {error === null && !isLoading && users.length > 0 && (
                <section className="admin-table-panel">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Username</th>
                                <th scope="col">Email</th>
                                <th scope="col">Role</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: User) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span
                                            className={`badge badge-role-${user.role.toLowerCase()}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge badge-status-${user.status.toLowerCase()}`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <nav className="table-pagination" aria-label="User list pagination">
                        <button
                            type="button"
                            className="primary-button"
                            disabled={isLoading || currentPage <= 1}
                            onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {lastPage}
                        </span>
                        <button
                            type="button"
                            className="primary-button"
                            disabled={isLoading || currentPage >= lastPage}
                            onClick={() => setPage((previous) => Math.min(lastPage, previous + 1))}
                        >
                            Next
                        </button>
                    </nav>
                </section>
            )}
        </div>
    );
}
