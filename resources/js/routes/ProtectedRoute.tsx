import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';

export function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <main className="route-state" aria-live="polite">
                <span className="loader" aria-hidden="true" />
                <p>Restoring your workspace…</p>
            </main>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
