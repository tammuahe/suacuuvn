import type { ComponentType } from 'react';

import Card from './Card';

export default function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description?: string;
}) {
    return (
        <Card className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-md-surface-container">
                <Icon className="h-6 w-6 text-md-on-surface-variant" />
            </div>
            <p className="mt-3 text-sm font-semibold text-md-on-surface">
                {title}
            </p>
            {description && (
                <p className="mt-1 text-xs text-md-on-surface-variant">
                    {description}
                </p>
            )}
        </Card>
    );
}
