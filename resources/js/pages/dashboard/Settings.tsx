import { useForm, usePage } from '@inertiajs/react';
import { Lock, Save, Eye, EyeOff, User, Shield } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import Card from '@/components/dashboard/Card';
import Section from '@/components/dashboard/Section';
import DashboardLayout from '@/layouts/DashboardLayout';
import { password } from '@/routes/dashboard/settings';

interface SettingsProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg
            className={`animate-spin ${className}`}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
            />
        </svg>
    );
}

export default function Settings() {
    const { user } = usePage<{ props: SettingsProps }>().props as unknown as SettingsProps;

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post(password.url(), {
            onSuccess: () => {
                passwordForm.reset();
            },
            preserveScroll: true,
        });
    };

    const roleLabel: Record<string, string> = {
        admin: 'Quản trị viên',
        manager: 'Quản lý',
        staff: 'Nhân viên',
    };

    return (
        <div className="space-y-8">
            <Section icon={User} title="Thông tin tài khoản">
                <Card>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <p className="text-xs font-medium text-md-on-surface-variant">
                                Tên đăng nhập
                            </p>
                            <p className="mt-1 text-sm font-semibold text-md-on-surface">
                                {user.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-md-on-surface-variant">
                                Email
                            </p>
                            <p className="mt-1 text-sm font-semibold text-md-on-surface">
                                {user.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-md-on-surface-variant">
                                Vai trò
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-md-primary" />
                                <p className="text-sm font-semibold text-md-on-surface">
                                    {roleLabel[user.role] ?? user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </Section>

            <Section icon={Lock} title="Đổi mật khẩu">
                <Card>
                    <form
                        onSubmit={handlePasswordSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-md-on-surface-variant">
                                Mật khẩu hiện tại
                            </label>
                            <div
                                className={`flex items-center gap-3 rounded-xl border bg-md-surface-container-lowest px-3.5 py-2.5 transition-colors focus-within:border-md-primary ${
                                    passwordForm.errors.current_password
                                        ? 'border-md-error'
                                        : 'border-md-outline-variant/50'
                                }`}
                            >
                                <Lock className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={
                                        passwordForm.data.current_password
                                    }
                                    onChange={(e) =>
                                        passwordForm.setData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowCurrent((v) => !v)
                                    }
                                    className="shrink-0 text-md-on-surface-variant hover:text-md-on-surface"
                                >
                                    {showCurrent ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {passwordForm.errors.current_password && (
                                <p className="mt-1 text-xs text-md-error">
                                    {passwordForm.errors.current_password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-md-on-surface-variant">
                                Mật khẩu mới
                            </label>
                            <div
                                className={`flex items-center gap-3 rounded-xl border bg-md-surface-container-lowest px-3.5 py-2.5 transition-colors focus-within:border-md-primary ${
                                    passwordForm.errors.password
                                        ? 'border-md-error'
                                        : 'border-md-outline-variant/50'
                                }`}
                            >
                                <Lock className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={passwordForm.data.password}
                                    onChange={(e) =>
                                        passwordForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="shrink-0 text-md-on-surface-variant hover:text-md-on-surface"
                                >
                                    {showNew ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {passwordForm.errors.password && (
                                <p className="mt-1 text-xs text-md-error">
                                    {passwordForm.errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-md-on-surface-variant">
                                Xác nhận mật khẩu mới
                            </label>
                            <div
                                className={`flex items-center gap-3 rounded-xl border bg-md-surface-container-lowest px-3.5 py-2.5 transition-colors focus-within:border-md-primary ${
                                    passwordForm.errors.password_confirmation
                                        ? 'border-md-error'
                                        : 'border-md-outline-variant/50'
                                }`}
                            >
                                <Lock className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                                <input
                                    type="password"
                                    value={
                                        passwordForm.data.password_confirmation
                                    }
                                    onChange={(e) =>
                                        passwordForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                    className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                                />
                            </div>
                            {passwordForm.errors.password_confirmation && (
                                <p className="mt-1 text-xs text-md-error">
                                    {
                                        passwordForm.errors
                                            .password_confirmation
                                    }
                                </p>
                            )}
                        </div>

                        <p className="text-xs text-md-on-surface-variant">
                            Mật khẩu phải có ít nhất 8 ký tự.
                        </p>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-md-primary px-4 py-2.5 text-sm font-semibold text-md-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                                {passwordForm.processing ? (
                                    <Spinner />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Cập nhật mật khẩu
                            </button>
                        </div>
                    </form>
                </Card>
            </Section>
        </div>
    );
}

Settings.layout = (page: ReactNode) => (
    <DashboardLayout title="Cài đặt">{page}</DashboardLayout>
);
