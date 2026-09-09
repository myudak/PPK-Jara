import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { MemberPanel } from '@/features/lists/MemberPanel';
import { deleteList, fetchList, fetchMembers, updateList } from '@/features/lists/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/features/auth/AuthContext';
import { TaskBoard } from '@/features/tasks/TaskBoard';
import { getApiErrorMessage } from '@/lib/api';
import type { ListMember, TaskList } from '@/types/domain';

export function ListDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const listId = Number(id);
    const isValidId = Number.isInteger(listId) && listId > 0;

    const [list, setList] = useState<TaskList | null>(null);
    const [members, setMembers] = useState<ListMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!isValidId) {
            return;
        }

        let isCurrent = true;

        Promise.all([fetchList(listId), fetchMembers(listId)])
            .then(([listData, memberData]) => {
                if (!isCurrent) {
                    return;
                }
                setList(listData);
                setMembers(memberData);
                setName(listData.name);
                setDescription(listData.description ?? '');
                setError(null);
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
    }, [isValidId, listId]);

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (list === null) {
            return;
        }

        setSaveError(null);
        setIsSaving(true);

        try {
            const updated = await updateList(list.id, {
                name,
                description: description.trim() === '' ? null : description,
            });
            setList(updated);
            setIsEditing(false);
        } catch (requestError: unknown) {
            setSaveError(getApiErrorMessage(requestError));
        } finally {
            setIsSaving(false);
        }
    }

    async function reloadList() {
        setIsLoading(true);

        try {
            const [listData, memberData] = await Promise.all([
                fetchList(listId),
                fetchMembers(listId),
            ]);
            setList(listData);
            setMembers(memberData);
            setName(listData.name);
            setDescription(listData.description ?? '');
            setError(null);
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (list === null) {
            return;
        }

        if (!window.confirm(`Delete "${list.name}"? Its members and tasks will be removed.`)) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteList(list.id);
            void navigate('/dashboard');
        } catch (requestError: unknown) {
            setIsDeleting(false);
            setSaveError(getApiErrorMessage(requestError));
        }
    }

    const invalidMessage = isValidId ? null : 'This task list does not exist.';

    if (invalidMessage !== null) {
        return (
            <div className="page-stack">
                <div role="alert" className="action-card">
                    <h2>List unavailable.</h2>
                    <p>{invalidMessage}</p>
                    <Link to="/dashboard" className="primary-button">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="page-stack">
                <div role="status" className="loader" aria-label="Loading task list" />
            </div>
        );
    }

    if (error || list === null) {
        return (
            <div className="page-stack">
                <div role="alert" className="action-card">
                    <h2>List unavailable.</h2>
                    <p>{error ?? 'This task list could not be loaded.'}</p>
                    <Link to="/dashboard" className="primary-button">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = user !== null && user.id === list.owner_id;

    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">{isOwner ? 'You own this list' : 'Shared with you'}</p>
                    <h1>{list.name}</h1>
                </div>
                {isOwner && (
                    <div className="header-actions">
                        <button
                            type="button"
                            className="primary-button"
                            onClick={() => setIsEditing((current) => !current)}
                        >
                            {isEditing ? 'Close editor' : 'Edit details'}
                        </button>
                        <button
                            type="button"
                            className="danger-button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting…' : 'Delete list'}
                        </button>
                    </div>
                )}
            </header>
            <section className="action-card" aria-label="List details">
                {isEditing ? (
                    <form onSubmit={(event) => void handleSave(event)}>
                        <h2>Edit details</h2>
                        <label htmlFor="detail-name">Name</label>
                        <input
                            id="detail-name"
                            required
                            maxLength={255}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={isSaving}
                        />
                        <label htmlFor="detail-description">Description (optional)</label>
                        <input
                            id="detail-description"
                            maxLength={2000}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            disabled={isSaving}
                        />
                        {saveError && (
                            <p role="alert" className="form-error">
                                {saveError}
                            </p>
                        )}
                        <button type="submit" className="primary-button" disabled={isSaving}>
                            {isSaving ? 'Saving…' : 'Save changes'}
                        </button>
                    </form>
                ) : (
                    <>
                        <h2>{list.name}</h2>
                        <p>{list.description ?? 'No description yet.'}</p>
                    </>
                )}
            </section>

            <MemberPanel
                listId={list.id}
                members={members}
                isOwner={isOwner}
                onChanged={() => void reloadList()}
            />

            <TaskBoard listId={String(list.id)} />

            {!isOwner && (
                <EmptyState
                    eyebrow="Read only"
                    title="Only the owner can change this list."
                    description="You can view the list and its members, and participate once tasks land here."
                />
            )}
        </div>
    );
}
