import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/features/auth/AuthContext';

export function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Your workspace</p>
                    <h1>Good work starts here, {user?.name.split(' ')[0]}.</h1>
                </div>
                <span className="foundation-badge">Foundation ready</span>
            </header>

            <section className="metric-grid" aria-label="Workspace status">
                <article>
                    <span>Lists</span>
                    <strong>—</strong>
                    <small>API planned</small>
                </article>
                <article>
                    <span>Open tasks</span>
                    <strong>—</strong>
                    <small>API planned</small>
                </article>
                <article className="metric-accent">
                    <span>Team progress</span>
                    <strong>Next</strong>
                    <small>Milestone 2</small>
                </article>
            </section>

            <EmptyState
                eyebrow="Ready for Programmer 2"
                title="Your task lists will live here."
                description="The shared routes, authentication session, and domain types are ready for list and membership development."
            />
        </div>
    );
}
