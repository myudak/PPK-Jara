import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';

import { createAdminUser, updateAdminUser } from '@/features/admin/api';
import { getApiErrorMessage } from '@/lib/api';
import type { ApiFailure } from '@/types/api';
import type { User, UserRole, UserStatus } from '@/types/domain';

interface UserFormProps {
    user: User | null;
    currentUserId: number;
    onClose: () => void;
    onSaved: () => void;
}

const ROLE_OPTIONS: UserRole[] = ['USER', 'ADMIN'];
const STATUS_OPTIONS: UserStatus[] = ['ACTIVE', 'DISABLED'];

export function UserForm({ user, currentUserId, onClose, onSaved }: UserFormProps) {
    const isEdit = user !== null;
    const isSelf = isEdit && user.id === currentUserId;

    const [name, setName] = useState(user?.name ?? '');
    const [username, setUsername] = useState(user?.username ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(user?.role ?? 'USER');
    const [status, setStatus] = useState<UserStatus>(user?.status ?? 'ACTIVE');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setFieldErrors({});
        setIsSaving(true);

        const payload = {
            name,
            username,
            email,
            role,
            status,
            ...(password.length > 0 || !isEdit ? { password } : {}),
        };

        try {
            if (isEdit) {
                await updateAdminUser(user.id, payload);
            } else {
                await createAdminUser(payload);
            }

            onSaved();
        } catch (requestError: unknown) {
            if (isAxiosError(requestError)) {
                const failure = requestError.response?.data as ApiFailure | undefined;

                if (failure?.errors !== undefined) {
                    setFieldErrors(failure.errors);
                }

                setError(failure?.message ?? getApiErrorMessage(requestError));
            } else {
                setError(getApiErrorMessage(requestError));
            }

            setIsSaving(false);
        }
    };

    const renderFieldError = (field: string) => {
        const messages = fieldErrors[field];

        if (messages === undefined || messages.length === 0) {
            return null;
        }

        return (
            <p className="form-error" role="alert">
                {messages.join(' ')}
            </p>
        );
    };

    return (
        <section className="dialog-overlay">
            <div
                className="dialog-card"
                role="dialog"
                aria-modal="true"
                aria-label={isEdit ? `Edit user ${user.name}` : 'Create user'}
            >
                <header className="dialog-header">
                    <div>
                        <p className="eyebrow">{isEdit ? 'Edit user' : 'New user'}</p>
                        <h2>{isEdit ? user.name : 'Create user.'}</h2>
                    </div>
                    <button type="button" className="text-button" onClick={onClose}>
                        Cancel
                    </button>
                </header>

                {isSelf && (
                    <p className="form-error" role="note">
                        You cannot change your own role or status.
                    </p>
                )}

                <form onSubmit={(event) => void handleSubmit(event)} noValidate>
                    <label htmlFor="user-form-name">Name</label>
                    <input
                        id="user-form-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />
                    {renderFieldError('name')}

                    <label htmlFor="user-form-username">Username</label>
                    <input
                        id="user-form-username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        autoComplete="off"
                        required
                    />
                    {renderFieldError('username')}

                    <label htmlFor="user-form-email">Email</label>
                    <input
                        id="user-form-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="off"
                        required
                    />
                    {renderFieldError('email')}

                    <label htmlFor="user-form-password">
                        {isEdit ? 'New password (leave blank to keep current)' : 'Password'}
                    </label>
                    <input
                        id="user-form-password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        required={!isEdit}
                        minLength={isEdit ? undefined : 8}
                    />
                    {renderFieldError('password')}

                    <label htmlFor="user-form-role">Role</label>
                    <select
                        id="user-form-role"
                        value={role}
                        disabled={isSelf}
                        onChange={(event) => setRole(event.target.value as UserRole)}
                    >
                        {ROLE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {renderFieldError('role')}

                    <label htmlFor="user-form-status">Status</label>
                    <select
                        id="user-form-status"
                        value={status}
                        disabled={isSelf}
                        onChange={(event) => setStatus(event.target.value as UserStatus)}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {renderFieldError('status')}

                    {error !== null &&
                        fieldErrors.username === undefined &&
                        fieldErrors.email === undefined && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}

                    <button type="submit" className="primary-button" disabled={isSaving}>
                        {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
                    </button>
                </form>
            </div>
        </section>
    );
}
