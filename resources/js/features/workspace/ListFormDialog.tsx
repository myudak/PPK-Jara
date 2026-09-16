import { useState, type FormEvent } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { createList, updateList } from '@/features/workspace/api';
import { getApiErrorMessage } from '@/lib/api';
import type { TaskList } from '@/types/domain';

interface ListFormDialogProps {
    list?: TaskList;
    onClose: () => void;
    onSaved: (list: TaskList) => void;
}

export function ListFormDialog({ list, onClose, onSaved }: ListFormDialogProps) {
    const [name, setName] = useState(list?.name ?? '');
    const [description, setDescription] = useState(list?.description ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = { name: name.trim(), description: description.trim() || null };
            const saved = list ? await updateList(list.id, payload) : await createList(payload);
            onSaved(saved);
        } catch (requestError: unknown) {
            setError(getApiErrorMessage(requestError));
            setIsSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={(open) => !open && !isSaving && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{list ? 'Edit list' : 'Create a list'}</DialogTitle>
                    <DialogDescription>
                        {list
                            ? 'Update the name and description for this workspace.'
                            : 'Start a shared workspace for a project or team.'}
                    </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
                    <div className="grid gap-2">
                        <Label htmlFor="list-name">Name</Label>
                        <Input
                            id="list-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="list-description">Description (optional)</Label>
                        <Textarea
                            id="list-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                        />
                    </div>
                    {error !== null && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving || name.trim().length === 0}
                            focusableWhenDisabled={isSaving}
                            aria-live="polite"
                            aria-busy={isSaving}
                        >
                            {isSaving ? 'Saving...' : list ? 'Save changes' : 'Create list'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
