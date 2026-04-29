import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, PackageSearch, User } from 'lucide-react';
import { useState } from 'react';
import { login } from '@/routes';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        post(login.url(), {
            onFinish: () => setData('password', ''),
        });
    };

    return (
        <div className="flex min-h-screen bg-md-surface">
            <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-md-primary p-12 lg:flex">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
                    <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-white/5" />
                    <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-white/5" />
                    <div className="absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
                    <div className="absolute top-1/2 left-1/2 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
                </div>

                <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                        <PackageSearch className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-black text-white">
                        SuaCuuVN
                    </span>
                </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-120 lg:shrink-0">
                <div className="mb-10 flex items-center gap-3 lg:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-md-primary">
                        <PackageSearch className="h-5 w-5 text-md-on-primary" />
                    </div>
                    <span className="text-lg font-black text-md-on-surface">
                        SuaCuuVN
                    </span>
                </div>

                <div className="w-full max-w-sm">
                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-md-on-surface">
                            Đăng nhập
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-md-on-surface-variant">
                                Tên đăng nhập
                            </label>
                            <div
                                className={`flex items-center gap-3 rounded-2xl border-2 bg-md-surface-container-lowest px-4 py-3 transition-colors focus-within:border-md-primary ${
                                    errors.username
                                        ? 'border-md-error'
                                        : 'border-md-outline-variant'
                                }`}
                            >
                                <User className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                                <input
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    placeholder="admin"
                                    value={data.username}
                                    onChange={(e) =>
                                        setData('username', e.target.value)
                                    }
                                    className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-xs text-md-error">
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-md-on-surface-variant">
                                Mật khẩu
                            </label>
                            <div
                                className={`flex items-center gap-3 rounded-2xl border-2 bg-md-surface-container-lowest px-4 py-3 transition-colors focus-within:border-md-primary ${
                                    errors.password
                                        ? 'border-md-error'
                                        : 'border-md-outline-variant'
                                }`}
                            >
                                <Lock className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="shrink-0 text-md-on-surface-variant hover:text-md-on-surface"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-md-error">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember */}
                        <div className="flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-2">
                                <div
                                    onClick={() =>
                                        setData('remember', !data.remember)
                                    }
                                    className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                                        data.remember
                                            ? 'border-md-primary bg-md-primary'
                                            : 'border-md-outline-variant'
                                    }`}
                                >
                                    {data.remember && (
                                        <svg
                                            className="h-3 w-3 text-md-on-primary"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                        >
                                            <path
                                                d="M2 6l3 3 5-5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs text-md-on-surface-variant">
                                    Ghi nhớ đăng nhập
                                </span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-md-primary py-4 text-sm font-bold text-md-on-primary shadow-lg shadow-md-primary/25 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                        >
                            {processing ? (
                                <svg
                                    className="h-4 w-4 animate-spin"
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
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

Login.layout = null;
