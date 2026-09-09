import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ProtectedRoute } from '@/routes/ProtectedRoute';

const authState = vi.hoisted(() => ({ user: null as { role: string } | null, isLoading: false }));

vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => authState }));

describe('ProtectedRoute', () => {
    it('redirects guests to login', () => {
        authState.user = null;
        authState.isLoading = false;

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/login" element={<h1>Sign in</h1>} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('renders protected content for an authenticated user', () => {
        authState.user = { role: 'USER' };

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<h1>Dashboard</h1>} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });
});
