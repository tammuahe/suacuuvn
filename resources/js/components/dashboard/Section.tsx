import type { ComponentType, ReactNode } from 'react';

export default function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-md-primary/10">
                    <Icon className="h-4 w-4 text-md-primary" />
                </div>
                <h2 className="text-sm font-semibold tracking-wide text-md-on-surface uppercase">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    );
}
