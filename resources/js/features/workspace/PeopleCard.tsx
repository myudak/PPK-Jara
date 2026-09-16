import { useState, type FormEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DestructiveConfirmDialog } from '@/features/workspace/DestructiveConfirmDialog';
import type { ListMember } from '@/types/domain';

interface PeopleCardProps {
    ownerName: string;
    members: ListMember[];
    isOwner: boolean;
    isAddingMember: boolean;
    pendingMemberIds: ReadonlySet<number>;
    onAddMember: (userId: number) => Promise<boolean>;
    onRemoveMember: (member: ListMember) => Promise<void>;
    onValidationError: (message: string) => void;
}

export function PeopleCard({
    ownerName,
    members,
    isOwner,
    isAddingMember,
    pendingMemberIds,
    onAddMember,
    onRemoveMember,
    onValidationError,
}: PeopleCardProps) {
    const [newMemberId, setNewMemberId] = useState('');
    const [memberToRemove, setMemberToRemove] = useState<ListMember | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userId = Number(newMemberId);
        if (!Number.isInteger(userId) || userId <= 0) {
            onValidationError('Enter a valid user ID.');
            return;
        }

        if (await onAddMember(userId)) {
            setNewMemberId('');
        }
    };

    const memberName =
        memberToRemove?.user?.name ??
        (memberToRemove === null ? '' : `user ${memberToRemove.user_id}`);

    return (
        <aside>
            <Card>
                <CardHeader>
                    <CardTitle>People</CardTitle>
                    <CardDescription>
                        The owner participates automatically. Members can be assigned to tasks.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-muted p-2.5">
                        <span className="min-w-0 truncate font-medium">{ownerName}</span>
                        <Badge>Owner</Badge>
                    </div>
                    {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No members have joined yet.</p>
                    ) : (
                        <ul className="grid gap-2">
                            {members.map((member) => (
                                <li
                                    key={member.user_id}
                                    className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {member.user?.name ?? `User #${member.user_id}`}
                                        </p>
                                        {member.user?.email && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {member.user.email}
                                            </p>
                                        )}
                                    </div>
                                    {isOwner && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={pendingMemberIds.has(member.user_id)}
                                            aria-label={`Remove ${member.user?.name ?? `user ${member.user_id}`}`}
                                            onClick={() => setMemberToRemove(member)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
                {isOwner && (
                    <CardFooter>
                        <form
                            className="grid w-full gap-2"
                            onSubmit={(event) => void handleSubmit(event)}
                        >
                            <Label htmlFor="new-member-id">Add member by user ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="new-member-id"
                                    type="number"
                                    min="1"
                                    step="1"
                                    inputMode="numeric"
                                    value={newMemberId}
                                    onChange={(event) => setNewMemberId(event.target.value)}
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={isAddingMember || newMemberId === ''}
                                    focusableWhenDisabled={isAddingMember}
                                    aria-live="polite"
                                    aria-busy={isAddingMember}
                                >
                                    {isAddingMember ? 'Adding...' : 'Add'}
                                </Button>
                            </div>
                        </form>
                    </CardFooter>
                )}
            </Card>

            <DestructiveConfirmDialog
                open={memberToRemove !== null}
                title="Remove this member?"
                description={`Remove ${memberName} from this list? Their assignments will be cleared.`}
                actionLabel="Remove member"
                pendingLabel="Removing..."
                pending={memberToRemove !== null && pendingMemberIds.has(memberToRemove.user_id)}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
                onConfirm={async () => {
                    if (memberToRemove !== null) {
                        await onRemoveMember(memberToRemove);
                    }
                }}
            />
        </aside>
    );
}
