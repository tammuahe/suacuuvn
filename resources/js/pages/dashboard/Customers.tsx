import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Users,
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    Phone,
    Mail,
    ShoppingBag,
    DollarSign,
    Repeat,
    UserCheck,
    Loader2,
    Info,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Tip from '@/components/dashboard/Tip';
import DashboardLayout from '@/layouts/DashboardLayout';
import { customers as customersRoute } from '@/routes/dashboard';
import { show as showRoute } from '@/routes/dashboard/customers';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Customer {
    identifier: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    shipping_address: string | null;
    order_count: number;
    total_spent: number;
    last_order_date: string;
    first_order_date: string;
}

interface Kpis {
    unique_customers: number;
    repeat_customers: number;
    repeat_rate: number;
    avg_clv: number;
    orders_per_customer: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedCustomers {
    data: Customer[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
}

interface CustomersProps {
    customers: PaginatedCustomers;
    kpis: Kpis;
    search: string | null;
    sort: string;
    direction: string;
}

interface CustomerDetail {
    identifier: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    shipping_address: string | null;
    order_count: number;
    total_spent: number;
    last_order_date: string;
    first_order_date: string;
    avg_order_value: number;
}

interface CustomerOrder {
    id: number;
    reference: string;
    total: string;
    status: string;
    paid_at: string | null;
    created_at: string;
}

// ─── Colour palette ───────────────────────────────────────────────────────────

const C = {
    primary: 'bg-md-primary/10 text-md-primary',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
    if (n >= 1_000_000_000) {
        return `${(n / 1_000_000_000).toFixed(1)} tỷ ₫`;
    }

    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1)} tr ₫`;
    }

    if (n >= 1_000) {
        return `${(n / 1_000).toFixed(0)}K ₫`;
    }

    return `${n.toFixed(0)} ₫`;
}

function vi(n: number) {
    return n.toLocaleString('vi-VN');
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest p-5 shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

function KpiCard({
    label,
    value,
    sub,
    tip,
    icon: Icon,
    color = 'primary',
}: {
    label: string;
    value: string;
    sub?: string;
    tip?: string;
    icon: React.ElementType;
    color?: 'primary' | 'green' | 'amber' | 'red' | 'blue';
}) {
    const cls = {
        primary: C.primary,
        green: C.green,
        amber: C.amber,
        red: C.red,
        blue: C.blue,
    }[color];

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p
                        className={`text-xs font-medium text-md-on-surface-variant ${tip ? 'truncate overflow-visible' : 'truncate'}`}
                    >
                        {label}
                        {tip && (
                            <Tip label={tip}>
                                <Info className="ml-0.5 inline h-3 w-3 shrink-0 align-text-top text-md-on-surface-variant/60" />
                            </Tip>
                        )}
                    </p>
                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                        {value}
                    </p>
                    {sub && (
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            {sub}
                        </p>
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

// ─── Customer Detail Slide-over ───────────────────────────────────────────────

function CustomerDetailSlideOver({
    identifier,
    open,
    onClose,
}: {
    identifier: string | null;
    open: boolean;
    onClose: () => void;
}) {
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && identifier) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(true);
            fetch(showRoute.url(identifier))
                .then((r) => r.json())
                .then((data) => {
                    setCustomer(data.customer);
                    setOrders(data.orders);
                })
                .finally(() => setLoading(false));
        } else if (!open) {
            setCustomer(null);
            setOrders([]);
        }
    }, [open, identifier]);

    if (!open) {
        return null;
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 z-50 bg-md-scrim/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.aside
                        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-lg flex-col bg-md-surface-container-lowest shadow-xl ring-1 ring-md-outline-variant/20"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-md-outline-variant/30 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-5 w-5 text-md-primary" />
                                <h2 className="text-base font-bold text-md-on-surface">
                                    Chi tiết khách hàng
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 text-md-on-surface-variant hover:bg-md-surface-container"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        {loading && (
                            <div className="flex flex-1 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-md-primary" />
                            </div>
                        )}

                        {!loading && !customer && (
                            <div className="flex flex-1 items-center justify-center">
                                <p className="text-sm text-md-on-surface-variant">
                                    Không thể tải thông tin khách hàng
                                </p>
                            </div>
                        )}

                        {!loading && customer && (
                            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                {/* Customer info */}
                                <div className="rounded-2xl border border-md-outline-variant/30 bg-md-surface-container-low p-4">
                                    <p className="text-base font-bold text-md-on-surface">
                                        {customer.customer_name ??
                                            'Khách vãng lai'}
                                    </p>
                                    {customer.customer_phone && (
                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-md-on-surface-variant">
                                            <Phone className="h-3 w-3" />
                                            {customer.customer_phone}
                                        </div>
                                    )}
                                    {customer.customer_email && (
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-md-on-surface-variant">
                                            <Mail className="h-3 w-3" />
                                            {customer.customer_email}
                                        </div>
                                    )}
                                    {customer.customer_phone && (
                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-md-on-surface-variant">
                                            <Users className="h-3 w-3" />
                                            Mã KH: {customer.identifier}
                                        </div>
                                    )}
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-md-outline-variant/30 bg-md-surface-container-low p-3">
                                        <p className="text-xs text-md-on-surface-variant">
                                            Số đơn
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-md-on-surface">
                                            {vi(customer.order_count)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-md-outline-variant/30 bg-md-surface-container-low p-3">
                                        <p className="text-xs text-md-on-surface-variant">
                                            Tổng chi tiêu
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-md-on-surface">
                                            {fmt(customer.total_spent)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-md-outline-variant/30 bg-md-surface-container-low p-3">
                                        <p className="text-xs text-md-on-surface-variant">
                                            Giá trị trung bình / đơn
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-md-on-surface">
                                            {fmt(customer.avg_order_value)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-md-outline-variant/30 bg-md-surface-container-low p-3">
                                        <p className="text-xs text-md-on-surface-variant">
                                            Lần đầu mua
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-md-on-surface">
                                            {new Date(
                                                customer.first_order_date,
                                            ).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                {/* Orders table */}
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <ShoppingBag className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Lịch sử đơn hàng ({orders.length})
                                        </p>
                                    </div>
                                    <div className="overflow-hidden rounded-2xl border border-md-outline-variant/30">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="bg-md-surface-container">
                                                    <th className="px-3 py-2 font-medium text-md-on-surface-variant">
                                                        Mã đơn
                                                    </th>
                                                    <th className="px-3 py-2 font-medium text-md-on-surface-variant">
                                                        Ngày
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-medium text-md-on-surface-variant">
                                                        Tổng
                                                    </th>
                                                    <th className="px-3 py-2 font-medium text-md-on-surface-variant">
                                                        Thanh toán
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-md-outline-variant/20">
                                                {orders.map((o) => (
                                                    <tr key={o.id}>
                                                        <td className="px-3 py-2 font-mono font-semibold text-md-primary">
                                                            {o.reference}
                                                        </td>
                                                        <td className="px-3 py-2 text-md-on-surface-variant">
                                                            {new Date(
                                                                o.created_at,
                                                            ).toLocaleDateString(
                                                                'vi-VN',
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-semibold text-md-on-surface">
                                                            {Number(
                                                                o.total,
                                                            ).toLocaleString(
                                                                'vi-VN',
                                                            )}{' '}
                                                            ₫
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {o.paid_at ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                                    Đã thanh
                                                                    toán
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                                                                    Chưa thanh
                                                                    toán
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {orders.length === 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={4}
                                                            className="px-3 py-8 text-center text-md-on-surface-variant"
                                                        >
                                                            Chưa có đơn hàng
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Customers() {
    const { customers, kpis, search, sort, direction } = usePage<{
        props: CustomersProps;
    }>().props as unknown as CustomersProps;

    const [detailIdentifier, setDetailIdentifier] = useState<string | null>(
        null,
    );
    const [searchInput, setSearchInput] = useState(search ?? '');

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (searchInput.trim()) {
            params.set('search', searchInput.trim());
        }

        const qs = params.toString();

        window.location.href = customersRoute.url() + (qs ? `?${qs}` : '');
    };

    const handleSort = (column: string) => {
        const newDir = sort === column && direction === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams();

        if (search) {
            params.set('search', search);
        }

        params.set('sort', column);
        params.set('direction', newDir);
        window.location.href = `${customersRoute.url()}?${params.toString()}`;
    };

    const hasFilters = !!search;

    return (
        <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <KpiCard
                    label="Tổng số khách hàng"
                    value={vi(kpis.unique_customers)}
                    icon={Users}
                    color="primary"
                />
                <KpiCard
                    label="Tỉ lệ quay lại"
                    value={`${kpis.repeat_rate}%`}
                    sub={`${vi(kpis.repeat_customers)} khách`}
                    icon={Repeat}
                    color="green"
                />
                <KpiCard
                    label="CLV trung bình"
                    value={fmt(kpis.avg_clv)}
                    tip="CLV (Customer Lifetime Value): Tổng doanh thu trên tổng số khách hàng"
                    icon={DollarSign}
                    color="blue"
                />
                <KpiCard
                    label="Số đơn trung bình"
                    value={kpis.orders_per_customer.toFixed(1)}
                    tip="Tổng số đơn hàng trên tổng số khách hàng"
                    icon={ShoppingBag}
                    color="amber"
                />
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        placeholder="Tìm theo tên, email, SĐT..."
                        className="w-full rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest py-2 pr-4 pl-9 text-sm outline-none placeholder:text-md-on-surface-variant/60 focus:border-md-primary"
                    />
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-md-on-surface-variant" />
                </div>
                {hasFilters && (
                    <Link
                        href={customersRoute.url()}
                        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-md-error transition-colors hover:bg-md-error-container"
                    >
                        <X className="h-3.5 w-3.5" />
                        Xoá lọc
                    </Link>
                )}
            </div>

            {/* Customers table */}
            <div className="overflow-hidden rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest shadow-sm">
                {customers.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16">
                        <Users className="h-12 w-12 text-md-outline-variant/40" />
                        <p className="mt-4 text-sm font-medium text-md-on-surface">
                            {hasFilters
                                ? 'Không tìm thấy khách hàng nào'
                                : 'Chưa có khách hàng nào'}
                        </p>
                        <p className="mt-1 text-xs text-md-on-surface-variant">
                            {hasFilters
                                ? 'Thử thay đổi từ khoá tìm kiếm'
                                : 'Khách hàng sẽ xuất hiện tại đây sau khi có đơn hàng'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-md-outline-variant/30 bg-md-surface-container/50">
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('customer_name')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Tên khách hàng
                                                {sort === 'customer_name' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                            Liên hệ
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('order_count')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Số đơn
                                                {sort === 'order_count' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('total_spent')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Tổng chi tiêu
                                                {sort === 'total_spent' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort(
                                                        'last_order_date',
                                                    )
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Lần mua gần nhất
                                                {sort === 'last_order_date' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="w-10 px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-md-outline-variant/20">
                                    {customers.data.map((c) => (
                                        <tr
                                            key={c.identifier}
                                            className="cursor-pointer transition-colors hover:bg-md-surface-container/40"
                                            onClick={() =>
                                                setDetailIdentifier(
                                                    c.identifier,
                                                )
                                            }
                                        >
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-medium text-md-on-surface">
                                                    {c.customer_name ??
                                                        'Khách vãng lai'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    {c.customer_email && (
                                                        <div className="flex items-center gap-1 text-xs text-md-on-surface-variant">
                                                            <Mail className="h-3 w-3" />
                                                            {c.customer_email}
                                                        </div>
                                                    )}
                                                    {c.customer_phone && (
                                                        <div className="flex items-center gap-1 text-xs text-md-on-surface-variant">
                                                            <Phone className="h-3 w-3" />
                                                            {c.customer_phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm font-semibold text-md-on-surface">
                                                    {vi(c.order_count)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-semibold text-md-on-surface">
                                                    {fmt(c.total_spent)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-md-on-surface-variant">
                                                {new Date(
                                                    c.last_order_date,
                                                ).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailIdentifier(
                                                            c.identifier,
                                                        );
                                                    }}
                                                    className="rounded-lg p-1.5 text-md-on-surface-variant transition-colors hover:bg-md-surface-container hover:text-md-primary"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="divide-y divide-md-outline-variant/20 md:hidden">
                            {customers.data.map((c) => (
                                <div
                                    key={c.identifier}
                                    className="cursor-pointer px-4 py-4 transition-colors hover:bg-md-surface-container/40"
                                    onClick={() =>
                                        setDetailIdentifier(c.identifier)
                                    }
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-md-on-surface">
                                                {c.customer_name ??
                                                    'Khách vãng lai'}
                                            </p>
                                            {c.customer_email && (
                                                <p className="mt-0.5 truncate text-xs text-md-on-surface-variant">
                                                    {c.customer_email}
                                                </p>
                                            )}
                                            {c.customer_phone && (
                                                <p className="text-xs text-md-on-surface-variant">
                                                    {c.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <p className="text-sm font-semibold text-md-on-surface">
                                                {fmt(c.total_spent)}
                                            </p>
                                            <p className="mt-0.5 text-xs text-md-on-surface-variant">
                                                {vi(c.order_count)} đơn
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {customers.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-md-on-surface-variant">
                        Hiển thị {customers.from}–{customers.to} trong tổng{' '}
                        {vi(customers.total)} khách
                    </p>
                    <div className="flex items-center gap-1">
                        {customers.links.map((link, i) => {
                            if (link.url === null) {
                                return null;
                            }

                            const isPrev = link.label.includes('Previous');
                            const isNext = link.label.includes('Next');

                            if (isPrev || isNext) {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-md-on-surface-variant transition-colors hover:bg-md-surface-container"
                                    >
                                        {isPrev && (
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        )}
                                        {isPrev ? 'Trước' : 'Sau'}
                                        {isNext && (
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        )}
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-md-primary text-md-on-primary'
                                            : 'text-md-on-surface-variant hover:bg-md-surface-container'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Customer detail slide-over */}
            <CustomerDetailSlideOver
                identifier={detailIdentifier}
                open={detailIdentifier !== null}
                onClose={() => setDetailIdentifier(null)}
            />
        </div>
    );
}

Customers.layout = (page: ReactNode) => (
    <DashboardLayout title="Khách hàng">{page}</DashboardLayout>
);
