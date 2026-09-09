import { useParams } from 'react-router-dom';

import { TaskBoard } from '@/features/tasks/TaskBoard';

export function ListDetailPage() {
    const { id } = useParams();

    return (
        <div className="page-stack">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Task list / {id}</p>
                    <h1>Tasks</h1>
                </div>
            </header>
            <TaskBoard listId={id ?? ''} />
        </div>
    );
}
