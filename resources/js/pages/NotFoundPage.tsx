import { Link } from 'react-router-dom';

import { Brand } from '@/components/shared/Brand';
import { buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

export function NotFoundPage() {
    const { user } = useAuth();

    return (
        <main className="grid min-h-screen place-items-center px-5 py-16">
            <div className="max-w-2xl text-center">
                <Brand className="mb-12" />
                <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                    404 / Off the list
                </p>
                <h1 className="mt-5 font-heading text-5xl font-semibold tracking-tight sm:text-7xl">
                    This page is not part of the plan.
                </h1>
                <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
                    The route may have moved, or it may not exist yet.
                </p>
                <Link
                    to={user ? '/dashboard' : '/'}
                    className={cn(buttonVariants({ size: 'lg' }), 'mt-9')}
                >
                    {user ? 'Return to workspace' : 'Return home'}
                </Link>
            </div>
        </main>
    );
}
