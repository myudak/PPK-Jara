import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/AuthContext';

interface LocationState {
    from?: { pathname?: string };
}

export function LoginPage() {
    const { user, login, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await login({ email, password });
            const state = location.state as LocationState | null;
            void navigate(state?.from?.pathname ?? '/dashboard', { replace: true });
        } catch {
            // AuthContext exposes the safe API error message to the form.
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-story" aria-labelledby="login-heading">
                <span className="story-index">01 / FOUNDATION</span>
                <div>
                    <p className="eyebrow">Work, made visible</p>
                    <h1 id="login-heading">A shared place for the work that matters.</h1>
                    <p className="story-copy">
                        JARA brings lists, people, and progress into one calm, accountable
                        workspace.
                    </p>
                </div>
                <p className="story-footnote">Built for focused teams and personal momentum.</p>
            </section>

            <section className="login-panel" aria-label="Sign in">
                <div className="login-card">
                    <span className="wordmark compact">
                        <span className="wordmark-mark">J</span>
                        <span>JARA</span>
                    </span>
                    <div className="login-copy">
                        <p className="eyebrow">Welcome back</p>
                        <h2>Enter your workspace</h2>
                        <p>Use the email assigned by your administrator.</p>
                    </div>

                    <form onSubmit={(event) => void handleSubmit(event)}>
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />

                        {error ? (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        ) : null}

                        <button className="primary-button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing in…' : 'Sign in'}
                        </button>
                    </form>

                    <p className="login-note">Accounts are managed by a JARA administrator.</p>
                </div>
            </section>
        </main>
    );
}
