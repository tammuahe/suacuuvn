import React from 'react'

export default function InfoRow({
    icon: Icon,
    label,
    value,
    className = '',
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-md-surface-container">
                <Icon className="h-3.5 w-3.5 text-md-on-surface-variant" />
            </span>
            <div className="min-w-0">
                <p className="text-[11px] text-md-on-surface-variant">
                    {label}
                </p>
                <p className="truncate text-sm font-medium text-md-on-surface">
                    {value}
                </p>
            </div>
        </div>
    );
}
