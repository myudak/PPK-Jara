import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/features/auth/AuthContext';
import { AppLayout } from '@/layouts/AppLayout';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ListDetailPage } from '@/pages/ListDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AdminRoute } from '@/routes/AdminRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/lists/:id" element={<ListDetailPage />} />
                            <Route element={<AdminRoute />}>
                                <Route path="/admin" element={<AdminDashboardPage />} />
                                <Route path="/admin/users" element={<AdminUsersPage />} />
                            </Route>
                        </Route>
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
