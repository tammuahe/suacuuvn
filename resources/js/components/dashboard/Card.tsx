import type { ReactNode } from 'react';

export default function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest p-5 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}
