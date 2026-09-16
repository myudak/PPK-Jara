import { Link } from 'react-router-dom';

import { Brand } from '@/components/shared/Brand';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

const FEATURES = [
    {
        index: '01',
        title: 'Shape the work',
        description:
            'Turn personal goals and team projects into clear lists with priorities, dates, and ownership.',
    },
    {
        index: '02',
        title: 'Move together',
        description:
            'Invite the right people, assign responsibility, and keep every handoff visible in one workspace.',
    },
    {
        index: '03',
        title: 'See momentum',
        description:
            'Track completion at a glance and know what is moving, overdue, or ready for the next step.',
    },
];

export function LandingPage() {
    const { user, isLoading } = useAuth();
    const destination = user ? '/dashboard' : '/login';

    return (
        <main className="min-h-screen overflow-hidden">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                <Brand />
                <Link
                    to={destination}
                    className={cn(buttonVariants(), isLoading && 'pointer-events-none opacity-50')}
                    aria-disabled={isLoading}
                    tabIndex={isLoading ? -1 : undefined}
                    onClick={(event) => isLoading && event.preventDefault()}
                >
                    {user ? 'Open workspace' : 'Sign in'}
                </Link>
            </header>

            <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-24">
                <div className="relative z-10 max-w-4xl">
                    <Badge variant="secondary" className="mb-6">
                        Personal focus. Shared momentum.
                    </Badge>
                    <h1 className="font-heading text-5xl leading-[0.96] font-semibold tracking-[-0.055em] text-balance sm:text-7xl lg:text-[6.5rem]">
                        Give every task a clear next move.
                    </h1>
                    <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                        JARA is a calm workspace for planning personal work, coordinating teams, and
                        seeing progress without losing the details.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-3">
                        <Link
                            to={destination}
                            className={cn(
                                buttonVariants({ size: 'lg' }),
                                isLoading && 'pointer-events-none opacity-50',
                            )}
                            aria-disabled={isLoading}
                            tabIndex={isLoading ? -1 : undefined}
                            onClick={(event) => isLoading && event.preventDefault()}
                        >
                            {user ? 'Continue to workspace' : 'Enter your workspace'}
                        </Link>
                        <a
                            href="#capabilities"
                            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
                        >
                            Explore the system
                        </a>
                    </div>
                    <p className="mt-5 text-sm text-muted-foreground">
                        Accounts are securely managed by your JARA administrator.
                    </p>
                </div>

                <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-hidden="true">
                    <div className="absolute -inset-16 -z-10 rounded-full bg-primary/10 blur-3xl" />
                    <Card className="rotate-2 border-primary/20 bg-card/90 p-2 shadow-2xl shadow-primary/10 backdrop-blur">
                        <CardHeader className="flex-row items-center justify-between space-y-0">
                            <div>
                                <p className="text-xs font-semibold tracking-widest text-primary uppercase">
                                    Product launch
                                </p>
                                <CardTitle className="mt-2 text-2xl">
                                    This week&apos;s momentum
                                </CardTitle>
                            </div>
                            <span className="grid size-14 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                72%
                            </span>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                ['Finalize research', 'Completed'],
                                ['Review interface flows', 'In progress'],
                                ['Prepare release notes', 'Next'],
                            ].map(([task, status], index) => (
                                <div
                                    key={task}
                                    className="flex items-center gap-3 rounded-xl border bg-background/80 p-4"
                                >
                                    <span
                                        className={`size-3 rounded-full ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-chart-2' : 'bg-muted-foreground/30'}`}
                                    />
                                    <span className="flex-1 font-medium">{task}</span>
                                    <span className="text-xs text-muted-foreground">{status}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section id="capabilities" className="border-y bg-foreground py-20 text-background">
                <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
                    <div className="max-w-2xl">
                        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
                            One operating rhythm
                        </p>
                        <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                            From scattered work to shared clarity.
                        </h2>
                    </div>
                    <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-background/15 md:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <article key={feature.index} className="bg-foreground p-7 sm:p-9">
                                <span className="text-sm text-primary">{feature.index}</span>
                                <h3 className="mt-12 font-heading text-2xl font-semibold">
                                    {feature.title}
                                </h3>
                                <p className="mt-3 leading-7 text-background/65">
                                    {feature.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                <Brand />
                <p>Plan clearly. Work accountably. Finish together.</p>
            </footer>
        </main>
    );
}
