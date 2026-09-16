import { Link } from 'react-router-dom';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AdminDashboardPage() {
    return (
        <div className="space-y-10">
            <header className="max-w-3xl space-y-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                    Administration
                </p>
                <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-6xl">
                    Keep the workspace healthy.
                </h1>
                <p className="text-lg text-muted-foreground">
                    Manage who can enter JARA and keep access aligned with your team.
                </p>
            </header>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User directory</CardTitle>
                    <CardDescription>
                        Create accounts, update roles, and remove access while preserving work
                        history.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link to="/admin/users" className={cn(buttonVariants())}>
                        Manage users
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
