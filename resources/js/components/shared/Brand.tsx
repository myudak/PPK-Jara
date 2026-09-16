import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface BrandProps {
    to?: string;
    inverse?: boolean;
    className?: string;
}

export function Brand({ to = '/', inverse = false, className }: BrandProps) {
    return (
        <Link
            to={to}
            className={cn(
                'inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight',
                className,
            )}
            aria-label="JARA home"
        >
            <span
                className={cn(
                    'grid size-9 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm',
                    inverse && 'bg-primary-foreground text-primary',
                )}
                aria-hidden="true"
            >
                J
            </span>
            <span>JARA</span>
        </Link>
    );
}
