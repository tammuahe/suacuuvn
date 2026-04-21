import { ChevronDown } from 'lucide-react';
import React from 'react';

export default function SelectField({
    label,
    icon: Icon,
    error,
    required,
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    icon: React.ElementType;
    error?: string;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold tracking-wider text-md-on-surface-variant uppercase">
                {label}
                {required && <span className="text-md-error">*</span>}
            </label>
            <div
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors relative
                    ${props.disabled
                        ? 'cursor-not-allowed border-md-outline-variant/40 bg-md-surface-container opacity-50'
                        : `bg-md-surface-container-lowest focus-within:border-md-primary ${error ? 'border-md-error' : 'border-md-outline-variant'}`
                    }`}
            >
                <Icon className="h-4 w-4 shrink-0 text-md-on-surface-variant " />
                <select
                    className={`flex-1 bg-transparent text-sm outline-none appearance-none
                        ${props.disabled
                            ? 'cursor-not-allowed text-md-on-surface-variant'
                            : 'text-md-on-surface'
                        }`}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-md-on-surface-variant" />
            </div>
            {error && <p className="text-xs text-md-error">{error}</p>}
        </div>
    );
}
