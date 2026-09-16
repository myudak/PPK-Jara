import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LandingPage } from '@/pages/LandingPage';

const authState = vi.hoisted(() => ({ user: null as { id: number } | null, isLoading: false }));

vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => authState }));

describe('LandingPage', () => {
    beforeEach(() => {
        authState.user = null;
        authState.isLoading = false;
    });

    it('directs guests to sign in without offering public registration', () => {
        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>,
        );

        expect(
            screen.getByRole('heading', { name: 'Give every task a clear next move.' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
        expect(screen.queryByRole('link', { name: /register/i })).not.toBeInTheDocument();
    });

    it('directs authenticated users to their workspace', () => {
        authState.user = { id: 1 };

        render(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('link', { name: 'Open workspace' })).toHaveAttribute(
            'href',
            '/dashboard',
        );
    });
});
