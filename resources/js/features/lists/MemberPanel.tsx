import { useState, type FormEvent } from 'react';

import { addMember, removeMember } from '@/features/lists/api';
import { getApiErrorMessage } from '@/lib/api';
import type { ListMember } from '@/types/domain';

interface MemberPanelProps {
    listId: number;
    members: ListMember[];
    isOwner: boolean;
    onChanged: () => void;
}

export function MemberPanel({ listId, members, isOwner, onChanged }: MemberPanelProps) {
    const [userId, setUserId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleAdd(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await addMember(listId, Number(userId));
            setUserId('');
            onChanged();
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRemove(member: ListMember) {
        setError(null);

        try {
            await removeMember(listId, member.user_id);
            onChanged();
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError));
        }
    }

    return (
        <section className="action-card" aria-label="List members">
            <h2>Members</h2>
            <p>
                {members.length === 0
                    ? 'No members yet. Share the list by adding collaborators.'
                    : `${members.length} collaborator(s) on this list.`}
            </p>

            {members.length > 0 && (
                <ul className="member-list">
                    {members.map((member) => (
                        <li key={member.user_id} className="member-row">
                            <span>
                                {member.user?.name ?? `User #${member.user_id}`}
                                <small>
                                    {' '}
                                    · joined{' '}
                                    {member.joined_at
                                        ? new Date(member.joined_at).toLocaleDateString()
                                        : '—'}
                                </small>
                            </span>
                            {isOwner && (
                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={() => void handleRemove(member)}
                                >
                                    Remove
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {isOwner && (
                <form onSubmit={(event) => void handleAdd(event)}>
                    <label htmlFor="member-user-id">Add member by user ID</label>
                    <input
                        id="member-user-id"
                        type="number"
                        min={1}
                        required
                        value={userId}
                        onChange={(event) => setUserId(event.target.value)}
                        disabled={isSubmitting}
                    />
                    {error && (
                        <p role="alert" className="form-error">
                            {error}
                        </p>
                    )}
                    <button type="submit" className="primary-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding…' : 'Add member'}
                    </button>
                </form>
            )}
        </section>
    );
}
