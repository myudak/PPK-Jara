import { Link } from 'react-router-dom';

export function NotFoundPage() {
    return (
        <main className="not-found">
            <span className="story-index">404 / OFF THE LIST</span>
            <h1>This page is not part of the plan.</h1>
            <p>The route may have moved, or it may not exist yet.</p>
            <Link className="primary-button" to="/dashboard">
                Return to workspace
            </Link>
        </main>
    );
}
