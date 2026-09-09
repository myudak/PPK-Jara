import { useParams } from 'react-router-dom';

import { EmptyState } from '@/components/shared/EmptyState';

export function ListDetailPage() {
    const { id } = useParams();

    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Task list / {id}</p>
                    <h1>List detail foundation</h1>
                </div>
            </header>
            <EmptyState
                eyebrow="Ready for Programmers 2 + 3"
                title="Membership and tasks connect here."
                description="This route is reserved for the collaborative list workspace; its API operations are intentionally not implemented in the scaffold."
            />
        </div>
    );
}
