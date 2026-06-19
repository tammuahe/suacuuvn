import type { ReactNode } from 'react';

export default function Tip({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <span className="group relative inline-flex">
            {children}
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded-lg bg-md-on-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-md-surface opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                {label}
            </span>
        </span>
    );
}
