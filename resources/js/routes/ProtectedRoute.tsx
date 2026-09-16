import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <main className="grid min-h-screen place-content-center gap-4" aria-live="polite">
                <Skeleton className="mx-auto size-10 rounded-full" />
                <p className="text-sm text-muted-foreground">Restoring your workspace...</p>
            </main>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
