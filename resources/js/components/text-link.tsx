import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Props = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: Props) {
    return (
        <Link
            className={cn(
                'text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition-colors duration-300 ease-out hover:text-indigo-700 hover:decoration-indigo-600',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
