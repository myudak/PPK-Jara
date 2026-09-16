import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Brand } from '@/components/shared/Brand';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/AuthContext';

interface LocationState {
    from?: { pathname?: string };
}

export function LoginPage() {
    const { user, isLoading, login, error } = useAuth();
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
            // AuthContext exposes a safe error message to the form.
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
            <section className="relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col lg:justify-between">
                <Brand inverse />
                <div className="relative z-10 max-w-3xl">
                    <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                        Work, made visible
                    </p>
                    <h1 className="mt-6 font-heading text-7xl leading-[0.95] font-semibold tracking-[-0.05em]">
                        A shared place for the work that matters.
                    </h1>
                    <p className="mt-7 max-w-xl text-lg leading-8 text-background/65">
                        JARA brings lists, people, priorities, and progress into one calm,
                        accountable workspace.
                    </p>
                </div>
                <p className="relative z-10 text-sm text-background/55">
                    Built for focused teams and personal momentum.
                </p>
                <div className="absolute -right-40 -bottom-52 size-[36rem] rounded-full border-[6rem] border-primary/80" />
            </section>

            <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
                <div className="w-full max-w-md">
                    <Brand className="mb-10 lg:hidden" />
                    <Card className="border-border/70 bg-card/85 shadow-xl shadow-foreground/5 backdrop-blur">
                        <CardHeader>
                            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                                Welcome back
                            </p>
                            <CardTitle className="text-3xl">Enter your workspace</CardTitle>
                            <CardDescription>
                                Use the email assigned by your administrator.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="space-y-5"
                                onSubmit={(event) => void handleSubmit(event)}
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                    />
                                </div>

                                {error ? (
                                    <Alert variant="destructive">
                                        <AlertTitle>Sign-in failed</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                ) : null}

                                <Button
                                    className="w-full"
                                    size="lg"
                                    type="submit"
                                    disabled={isSubmitting || isLoading}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </form>
                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Return to the{' '}
                                <Link className="font-medium text-primary hover:underline" to="/">
                                    JARA overview
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
}
