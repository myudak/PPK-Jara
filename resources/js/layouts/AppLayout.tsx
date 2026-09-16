import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Brand } from '@/components/shared/Brand';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, initials } from '@/lib/utils';

const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
        'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
    );

export function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        void navigate('/login', { replace: true });
    };

    const navigation = (onNavigate?: () => void) => (
        <nav className="grid gap-1" aria-label="Primary navigation">
            <NavLink to="/dashboard" className={navClass} onClick={onNavigate}>
                Workspace
            </NavLink>
            {user?.role === 'ADMIN' ? (
                <NavLink to="/admin" className={navClass} onClick={onNavigate}>
                    Administration
                </NavLink>
            ) : null}
        </nav>
    );

    const profile = (
        <div className="flex items-center gap-3 border-t pt-4">
            <Avatar>
                <AvatarFallback>{initials(user?.name ?? 'JARA User')}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void handleLogout()}>
                Sign out
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen md:grid md:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="sticky top-0 hidden h-screen flex-col border-r bg-sidebar p-5 md:flex">
                <Brand to="/dashboard" />
                <div className="mt-10">{navigation()}</div>
                <div className="mt-auto">{profile}</div>
            </aside>

            <div className="min-w-0">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:hidden">
                    <Brand to="/dashboard" />
                    <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                        <SheetTrigger render={<Button variant="outline" size="sm" />}>
                            Menu
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Navigation</SheetTitle>
                                <SheetDescription>
                                    Move through your JARA workspace.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="px-4">
                                {navigation(() => setIsMobileNavOpen(false))}
                            </div>
                            <div className="mt-auto p-4">{profile}</div>
                        </SheetContent>
                    </Sheet>
                </header>
                <main className="mx-auto w-full max-w-[96rem] p-5 sm:p-8 lg:p-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
