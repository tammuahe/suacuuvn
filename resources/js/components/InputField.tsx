import React from 'react';

export default function InputField({
    label,
    icon: Icon,
    error,
    required,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
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
                className={`flex items-center gap-3 rounded-2xl border-2 bg-md-surface-container-lowest px-4 py-3 transition-colors focus-within:border-md-primary ${error ? 'border-md-error' : 'border-md-outline-variant'}`}
            >
                <Icon className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                <input
                    className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-md-error">{error}</p>}
        </div>
    );
}
