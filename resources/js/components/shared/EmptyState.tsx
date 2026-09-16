import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyStateProps {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ eyebrow, title, description, action }: EmptyStateProps) {
    return (
        <Card className="border-dashed bg-card/70 shadow-none">
            <CardHeader className="max-w-2xl gap-3 py-10 sm:py-14">
                <span className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                    {eyebrow}
                </span>
                <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
                <CardDescription className="text-base leading-7">{description}</CardDescription>
            </CardHeader>
            {action ? <CardContent className="-mt-8 pb-10 sm:pb-14">{action}</CardContent> : null}
        </Card>
    );
}
