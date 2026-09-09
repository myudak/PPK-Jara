import { useState, type FormEvent } from 'react';

import { createList } from '@/features/lists/api';
import { getApiErrorMessage } from '@/lib/api';
import type { TaskList } from '@/types/domain';

interface ListCreateFormProps {
    onCreated: (list: TaskList) => void;
}

export function ListCreateForm({ onCreated }: ListCreateFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const list = await createList({
                name,
                description: description.trim() === '' ? null : description,
            });
            onCreated(list);
            setName('');
            setDescription('');
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="action-card" onSubmit={(event) => void handleSubmit(event)}>
            <h2>New task list</h2>
            <label htmlFor="list-name">Name</label>
            <input
                id="list-name"
                name="name"
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isSubmitting}
            />
            <label htmlFor="list-description">Description (optional)</label>
            <input
                id="list-description"
                name="description"
                maxLength={2000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
            />
            {error && (
                <p role="alert" className="form-error">
                    {error}
                </p>
            )}
            <button type="submit" className="primary-button" disabled={isSubmitting || name.trim() === ''}>
                {isSubmitting ? 'Creating…' : 'Create list'}
            </button>
        </form>
    );
}
