import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Administration</p>
                    <h1>Keep the workspace healthy.</h1>
                </div>
            </header>
            <section className="action-card">
                <span className="story-index">USER DIRECTORY</span>
                <h2>Manage people and access</h2>
                <p>User creation, editing, and account disabling belong in this module.</p>
                <Link className="inline-link" to="/admin/users">
                    Open user foundation →
                </Link>
            </section>
        </div>
    );
}
