import { EmptyState } from '@/components/shared/EmptyState';

export function AdminUsersPage() {
    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Administration / Users</p>
                    <h1>User management foundation</h1>
                </div>
            </header>
            <EmptyState
                eyebrow="Ready for Programmer 1"
                title="The user directory comes next."
                description="Admin route protection and shared user types are ready; CRUD and disabling workflows remain intentionally unimplemented."
            />
        </div>
    );
}
