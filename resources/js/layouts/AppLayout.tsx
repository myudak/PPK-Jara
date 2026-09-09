import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';
import { initials } from '@/lib/utils';

export function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        void navigate('/login', { replace: true });
    };

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <NavLink to="/dashboard" className="wordmark" aria-label="JARA dashboard">
                    <span className="wordmark-mark">J</span>
                    <span>JARA</span>
                </NavLink>

                <nav className="sidebar-nav" aria-label="Primary navigation">
                    <NavLink to="/dashboard">Workspace</NavLink>
                    {user?.role === 'ADMIN' ? <NavLink to="/admin">Administration</NavLink> : null}
                </nav>

                <div className="profile-card">
                    <span className="avatar" aria-hidden="true">
                        {initials(user?.name ?? 'JARA User')}
                    </span>
                    <span className="profile-copy">
                        <strong>{user?.name}</strong>
                        <small>{user?.email}</small>
                    </span>
                    <button
                        className="text-button"
                        type="button"
                        onClick={() => void handleLogout()}
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            <main className="workspace">
                <Outlet />
            </main>
        </div>
    );
}
