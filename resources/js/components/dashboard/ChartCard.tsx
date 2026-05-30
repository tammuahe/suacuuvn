import type { ReactNode } from 'react';

import Card from './Card';

export default function ChartCard({
    title,
    children,
    className = '',
}: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Card className={className}>
            <p className="mb-4 text-sm font-semibold text-md-on-surface">
                {title}
            </p>
            {children}
        </Card>
    );
}
