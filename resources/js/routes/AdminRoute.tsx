import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';

export function AdminRoute() {
    const { user } = useAuth();

    return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
