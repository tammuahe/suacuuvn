import { router, useForm } from '@inertiajs/react';
import {
    ChevronLeft,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    ShoppingBag,
    Loader2,
    ChevronDown,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import InputField from '@/components/InputField';
import { shopping } from '@/routes';
import checkout from '@/routes/checkout';
import { useAddressStore } from '@/stores/addressStore';
import type { District, Ward } from '@/stores/addressStore';
import { useShoppingStore } from '@/stores/shoppingStore';

interface SearchableSelectProps {
    label: string;
    placeholder?: string;
    value: number | '';
    onChange: (code: number | '') => void;
    options: { code: number; name: string }[];
    disabled?: boolean;
    error?: string;
    required?: boolean;
}

function SearchableSelect({
    label,
    placeholder = 'Chọn...',
    value,
    onChange,
    options,
    disabled = false,
    error,
    required,
}: SearchableSelectProps) {
    //TODO: add tel standardization
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedName = options.find((o) => o.code === value)?.name ?? '';

    const filtered = useMemo(() => {
        if (!query.trim()) {
            return options;
        }

        const q = query.toLowerCase();

        return options.filter((o) => o.name.toLowerCase().includes(q));
    }, [options, query]);

    // Close on outside click
    useEffect(() => {
        if (!open) {
            return;
        }

        const handler = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);

        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) {
            return;
        }

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('keydown', handler);

        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    const handleOpen = () => {
        if (disabled) {
            return;
        }

        setOpen(true);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSelect = (code: number) => {
        onChange(code);
        setOpen(false);
        setQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setOpen(false);
        setQuery('');
    };

    return (
        <div ref={containerRef} className="relative">
            <label className="mb-1.5 block text-xs font-semibold text-md-on-surface-variant">
                {label}
                {required && <span className="ml-0.5 text-md-error">*</span>}
            </label>

            {/* Trigger button */}
            <button
                type="button"
                onClick={handleOpen}
                disabled={disabled}
                className={`flex w-full items-center gap-2 rounded-2xl border-2 bg-md-surface-container-lowest px-4 py-3 text-left text-sm transition-colors ${error ? 'border-md-error' : open ? 'border-md-primary' : 'border-md-outline-variant'} ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-md-outline'}`}
            >
                <MapPin className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                <span
                    className={`flex-1 truncate ${value ? 'text-md-on-surface' : 'text-md-on-surface-variant/50'}`}
                >
                    {value ? selectedName : placeholder}
                </span>
                {value && !disabled ? (
                    <X
                        className="h-3.5 w-3.5 shrink-0 text-md-on-surface-variant hover:text-md-on-surface"
                        onClick={handleClear}
                    />
                ) : (
                    <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-md-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl bg-md-surface-container-low shadow-lg ring-1 shadow-black/10 ring-md-outline-variant/40">
                    {/* Search input */}
                    <div className="flex items-center gap-2 border-b border-md-outline-variant/30 px-3 py-2.5">
                        <Search className="h-3.5 w-3.5 shrink-0 text-md-on-surface-variant" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')}>
                                <X className="h-3.5 w-3.5 text-md-on-surface-variant hover:text-md-on-surface" />
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <ul
                        className="max-h-52 overflow-y-auto py-1"
                        role="listbox"
                    >
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 text-center text-xs text-md-on-surface-variant">
                                Không tìm thấy kết quả
                            </li>
                        ) : (
                            filtered.map((opt) => (
                                <li
                                    key={opt.code}
                                    role="option"
                                    aria-selected={opt.code === value}
                                    onClick={() => handleSelect(opt.code)}
                                    className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-md-surface-container ${opt.code === value ? 'bg-md-primary/10 font-semibold text-md-primary' : 'text-md-on-surface'}`}
                                >
                                    {opt.name}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-md-error">{error}</p>}
        </div>
    );
}

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

export default function Checkout() {
    const { cartItems, clearCart } = useShoppingStore();
    const { provinces, loading: loadingAddr } = useAddressStore();
    const [feesOpen, setFeesOpen] = useState(false);

    const { data, setData, post, processing, errors, transform } = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        notes: '',
        payment_method: 'cod',
        shipping_address: {
            address: '',
            province_code: '' as number | '',
            district_code: '' as number | '',
            ward_code: '' as number | '',
        },
        items: cartItems.map((i) => ({
            product_id: i.id,
            quantity: i.quantity,
        })),
    });

    transform((formData) => ({
        ...formData,
        items: cartItems.map((i) => ({
            product_id: i.id,
            quantity: i.quantity,
        })),
    }));

    const formErrors = errors as Record<string, string>;
    const districts = useMemo<District[]>(() => {
        if (!data.shipping_address.province_code) {
            return [];
        }

        return (
            provinces.find(
                (p) => p.code === Number(data.shipping_address.province_code),
            )?.districts ?? []
        );
    }, [provinces, data.shipping_address.province_code]);

    const wards = useMemo<Ward[]>(() => {
        if (!data.shipping_address.district_code) {
            return [];
        }

        return (
            districts.find(
                (d) => d.code === Number(data.shipping_address.district_code),
            )?.wards ?? []
        );
    }, [districts, data.shipping_address.district_code]);

    const handleProvinceChange = (code: number | '') => {
        setData('shipping_address', {
            ...data.shipping_address,
            province_code: code,
            district_code: '',
            ward_code: '',
        });
    };

    const handleDistrictChange = (code: number | '') => {
        setData('shipping_address', {
            ...data.shipping_address,
            district_code: code,
            ward_code: '',
        });
    };

    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(checkout.submit.url(), {
            onSuccess: () => clearCart(),
        });
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-md-on-surface-variant">
                <ShoppingBag className="h-16 w-16 opacity-20" />
                <p className="text-sm">Giỏ hàng của bạn đang trống.</p>
                <button
                    onClick={() => router.visit(shopping().url)}
                    className="rounded-2xl bg-md-primary px-6 py-2.5 text-sm font-semibold text-md-on-primary"
                >
                    Tiếp tục mua hàng
                </button>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.visit(shopping().url)}
                    className="mb-4 inline-flex items-center gap-1 text-sm text-md-on-surface-variant transition-colors hover:text-md-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại mua hàng
                </button>
                <h1 className="text-2xl font-black text-md-on-surface sm:text-3xl">
                    Đặt hàng
                </h1>
                <p className="mt-1 text-sm text-md-on-surface-variant">
                    Điền thông tin để hoàn tất đơn hàng
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    {/* ── Left: form fields ── */}
                    <div className="space-y-6">
                        {/* 1. Customer info */}
                        <section className="rounded-3xl bg-md-surface-container-lowest p-6 ring-1 ring-md-outline-variant/40">
                            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-md-on-surface">
                                <StepBadge n={1} />
                                Thông tin người nhận
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <InputField
                                        label="Họ và tên"
                                        icon={User}
                                        required
                                        placeholder="Nguyễn Văn A"
                                        autoComplete="name"
                                        value={data.customer_name}
                                        onChange={(e) =>
                                            setData(
                                                'customer_name',
                                                e.target.value,
                                            )
                                        }
                                        error={errors.customer_name}
                                    />
                                </div>
                                <InputField
                                    label="Số điện thoại"
                                    icon={Phone}
                                    required
                                    type="tel"
                                    placeholder="0912 345 678"
                                    autoComplete="tel"
                                    value={data.customer_phone}
                                    onChange={(e) =>
                                        setData(
                                            'customer_phone',
                                            e.target.value,
                                        )
                                    }
                                    error={errors.customer_phone}
                                />
                                <InputField
                                    label="Email"
                                    icon={Mail}
                                    type="email"
                                    placeholder="example@email.com"
                                    autoComplete="email"
                                    value={data.customer_email}
                                    onChange={(e) =>
                                        setData(
                                            'customer_email',
                                            e.target.value,
                                        )
                                    }
                                    error={errors.customer_email}
                                />
                            </div>
                        </section>

                        {/* 2. Shipping address */}
                        <section className="rounded-3xl bg-md-surface-container-lowest p-6 ring-1 ring-md-outline-variant/40">
                            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-md-on-surface">
                                <StepBadge n={2} />
                                Địa chỉ giao hàng
                            </h2>

                            {loadingAddr ? (
                                <div className="flex items-center gap-2 text-sm text-md-on-surface-variant">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang tải địa chỉ...
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <SearchableSelect
                                        label="Tỉnh / Thành phố"
                                        placeholder="Chọn tỉnh / thành phố"
                                        required
                                        value={
                                            data.shipping_address.province_code
                                        }
                                        onChange={handleProvinceChange}
                                        options={provinces}
                                        error={
                                            errors[
                                                'shipping_address.province_code' as keyof typeof errors
                                            ]
                                        }
                                    />

                                    <SearchableSelect
                                        label="Quận / Huyện"
                                        placeholder="Chọn quận / huyện"
                                        required
                                        disabled={
                                            !data.shipping_address.province_code
                                        }
                                        value={
                                            data.shipping_address.district_code
                                        }
                                        onChange={handleDistrictChange}
                                        options={districts}
                                        error={
                                            errors[
                                                'shipping_address.district_code' as keyof typeof errors
                                            ]
                                        }
                                    />

                                    <SearchableSelect
                                        label="Phường / Xã"
                                        placeholder="Chọn phường / xã"
                                        required
                                        disabled={
                                            !data.shipping_address.district_code
                                        }
                                        value={data.shipping_address.ward_code}
                                        onChange={(code) =>
                                            setData('shipping_address', {
                                                ...data.shipping_address,
                                                ward_code: code,
                                            })
                                        }
                                        options={wards}
                                        error={
                                            errors[
                                                'shipping_address.ward_code' as keyof typeof errors
                                            ]
                                        }
                                    />

                                    <div className="sm:col-span-2">
                                        <InputField
                                            label="Số nhà, tên đường"
                                            icon={MapPin}
                                            required
                                            placeholder="123 Đường Láng"
                                            autoComplete="address-line1"
                                            value={
                                                data.shipping_address.address
                                            }
                                            onChange={(e) =>
                                                setData('shipping_address', {
                                                    ...data.shipping_address,
                                                    address: e.target.value,
                                                })
                                            }
                                            error={
                                                errors[
                                                    'shipping_address.address' as keyof typeof errors
                                                ]
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 3. Notes */}
                        <section className="rounded-3xl bg-md-surface-container-lowest p-6 ring-1 ring-md-outline-variant/40">
                            <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-md-on-surface">
                                <StepBadge n={3} />
                                Ghi chú
                            </h2>
                            <div
                                className={`flex gap-3 rounded-2xl border-2 bg-md-surface-container-lowest px-4 py-3 transition-colors focus-within:border-md-primary ${
                                    errors.notes
                                        ? 'border-md-error'
                                        : 'border-md-outline-variant'
                                }`}
                            >
                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-md-on-surface-variant" />
                                <textarea
                                    rows={3}
                                    placeholder="Ghi chú cho đơn hàng (tuỳ chọn)..."
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    className="flex-1 resize-none bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                                />
                            </div>
                        </section>
                    </div>

                    {/* ── Right: order summary ── */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <section className="rounded-3xl bg-md-surface-container-lowest p-6 ring-1 ring-md-outline-variant/40">
                            <h2 className="mb-5 text-base font-bold text-md-on-surface">
                                Đơn hàng
                            </h2>

                            {/* Cart items */}
                            <div className="space-y-3">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="relative h-14 w-14 shrink-0 rounded-xl bg-md-surface-container">
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="h-full w-full overflow-hidden object-contain p-1"
                                            />
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-md-primary text-[9px] font-bold text-md-on-primary">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-xs leading-snug font-medium text-md-on-surface">
                                                {item.name}
                                            </p>
                                        </div>
                                        <p className="shrink-0 text-sm font-bold text-md-primary">
                                            {formatVND(
                                                item.price * item.quantity,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="my-4 h-px bg-md-outline-variant" />

                            {/* Subtotal + fees dropdown */}
                            <button
                                type="button"
                                onClick={() => setFeesOpen((o) => !o)}
                                className="flex w-full items-center justify-between text-sm text-md-on-surface-variant transition-colors hover:text-md-on-surface"
                            >
                                <span>Tạm tính</span>
                                <div className="flex items-center gap-1.5">
                                    <span>{formatVND(subtotal)}</span>
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 transition-transform duration-200 ${feesOpen ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </button>

                            {feesOpen && (
                                <div className="mt-2 space-y-1.5 rounded-xl bg-md-surface-container px-3 py-2.5">
                                    <div className="flex justify-between text-xs text-md-on-surface-variant">
                                        <span>Phí vận chuyển</span>
                                        <span className="font-medium text-md-primary">
                                            {shipping > 0
                                                ? formatVND(shipping)
                                                : 'Miễn phí'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-md-on-surface-variant">
                                        <span>Thuế</span>
                                        <span>
                                            {tax > 0 ? formatVND(tax) : '—'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="my-4 h-px bg-md-outline-variant" />

                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-semibold text-md-on-surface">
                                    Tổng cộng
                                </span>
                                <span className="text-2xl font-black text-md-primary">
                                    {formatVND(total)}
                                </span>
                            </div>

                            {/* Global error */}
                            {formErrors.order && (
                                <p className="mt-3 rounded-xl bg-md-error-container px-3 py-2 text-xs text-md-on-error-container">
                                    {formErrors.order}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-md-primary py-4 text-sm font-bold text-md-on-primary shadow-lg shadow-md-primary/25 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận đặt hàng'
                                )}
                            </button>

                            <p className="mt-3 text-center text-xs text-md-on-surface-variant">
                                Thanh toán khi nhận hàng (COD)
                            </p>
                        </section>
                    </div>
                </div>
            </form>
        </main>
    );
}

function StepBadge({ n }: { n: number }) {
    return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-md-primary text-xs font-black text-md-on-primary">
            {n}
        </span>
    );
}
