import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';

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

    const fieldError = (field: string) => fieldErrors[field]?.join(' ');

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !isSaving) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Edit ${user.name}` : 'Create user'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Update identity, credentials, role, or account status.'
                            : 'Create a managed account for a new JARA participant.'}
                    </DialogDescription>
                </DialogHeader>

                {isSelf ? (
                    <Alert>
                        <AlertDescription>
                            You cannot change your own role or status.
                        </AlertDescription>
                    </Alert>
                ) : null}

                <form
                    id="user-form"
                    className="space-y-4"
                    onSubmit={(event) => void handleSubmit(event)}
                    noValidate
                >
                    <div className="space-y-2">
                        <Label htmlFor="user-form-name">Name</Label>
                        <Input
                            id="user-form-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            aria-invalid={fieldError('name') !== undefined}
                            aria-describedby={
                                fieldError('name') ? 'user-form-name-error' : undefined
                            }
                            required
                        />
                        {fieldError('name') ? (
                            <p id="user-form-name-error" className="text-sm text-destructive">
                                {fieldError('name')}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user-form-username">Username</Label>
                        <Input
                            id="user-form-username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="off"
                            aria-invalid={fieldError('username') !== undefined}
                            aria-describedby={
                                fieldError('username') ? 'user-form-username-error' : undefined
                            }
                            required
                        />
                        {fieldError('username') ? (
                            <p id="user-form-username-error" className="text-sm text-destructive">
                                {fieldError('username')}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user-form-email">Email</Label>
                        <Input
                            id="user-form-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="off"
                            aria-invalid={fieldError('email') !== undefined}
                            aria-describedby={
                                fieldError('email') ? 'user-form-email-error' : undefined
                            }
                            required
                        />
                        {fieldError('email') ? (
                            <p id="user-form-email-error" className="text-sm text-destructive">
                                {fieldError('email')}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="user-form-password">
                            {isEdit ? 'New password (optional)' : 'Password'}
                        </Label>
                        <Input
                            id="user-form-password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            aria-invalid={fieldError('password') !== undefined}
                            aria-describedby={
                                fieldError('password') ? 'user-form-password-error' : undefined
                            }
                            required={!isEdit}
                            minLength={isEdit ? undefined : 8}
                        />
                        {fieldError('password') ? (
                            <p id="user-form-password-error" className="text-sm text-destructive">
                                {fieldError('password')}
                            </p>
                        ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="user-form-role">Role</Label>
                            <Select
                                value={role}
                                disabled={isSelf}
                                onValueChange={(value) => setRole(value as UserRole)}
                            >
                                <SelectTrigger id="user-form-role" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-form-status">Status</Label>
                            <Select
                                value={status}
                                disabled={isSelf}
                                onValueChange={(value) => setStatus(value as UserStatus)}
                            >
                                <SelectTrigger id="user-form-status" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error !== null ? (
                        <Alert variant="destructive" role="alert">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : null}
                </form>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="user-form"
                        disabled={isSaving}
                        focusableWhenDisabled
                        aria-live="polite"
                        aria-busy={isSaving}
                    >
                        {isSaving ? 'Saving...' : isEdit ? 'Save changes' : 'Create user'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
