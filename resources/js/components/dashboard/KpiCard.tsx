import { TrendingUp } from 'lucide-react';
import type { ComponentType } from 'react';

import Card from './Card';

export default function KpiCard({
    label,
    value,
    sub,
    trend,
    icon: Icon,
    color = 'primary',
}: {
    label: string;
    value: string;
    sub?: string;
    trend?: { value: string; up: boolean };
    icon: ComponentType<{ className?: string }>;
    color?: 'primary' | 'green' | 'amber' | 'red' | 'blue';
}) {
    const cls = {
        primary: 'bg-md-primary/10 text-md-primary',
        green: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-700',
        blue: 'bg-blue-50 text-blue-600',
    }[color];

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-md-on-surface-variant">
                        {label}
                    </p>
                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                        {value}
                    </p>
                    {sub && (
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            {sub}
                        </p>
                    )}
                    {trend && (
                        <span
                            className={`mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium ${trend.up ? 'text-emerald-600' : 'text-red-700'}`}
                        >
                            <TrendingUp
                                className={`h-3 w-3 ${!trend.up && 'rotate-180'}`}
                            />
                            {trend.value}
                        </span>
                    )}
                </div>
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cls}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </Card>
    );
}
