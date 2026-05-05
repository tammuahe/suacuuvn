import { Link, usePage } from '@inertiajs/react';
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Clock,
    FileDown,
    Plus,
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import OrderCreateSlideOver from '@/components/OrderCreateSlideOver';
import OrderDetailSlideOver from '@/components/OrderDetailSlideOver';
import StatusBadge from '@/components/StatusBadge';
import DashboardLayout from '@/layouts/DashboardLayout';
import { orders as ordersRoute } from '@/routes/dashboard';
import { exportMethod as exportOrders } from '@/routes/dashboard/orders';
import type { Product } from '@/stores/shoppingStore';
import type { Order } from '@/types/Order';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
    total_orders: number;
    total_revenue: number;
    pending_count: number;
    processing_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
}

interface OrdersProps {
    orders: PaginatedOrders;
    status: string | null;
    search: string | null;
    date_from: string | null;
    date_to: string | null;
    sort: string;
    direction: string;
    kpis: Kpis;
    products: Product[];
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
    icon: Icon,
    color = 'primary',
}: {
    label: string;
    value: string;
    sub?: string;
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

// ─── Status tabs ─────────────────────────────────────────────────────────────

const STATUSES: { key: string; label: string }[] = [
    { key: '', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipped', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã huỷ' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Orders() {
    const {
        orders,
        status,
        search,
        date_from,
        date_to,
        sort,
        direction,
        kpis,
        products,
    } = usePage<{ props: OrdersProps }>().props as unknown as OrdersProps;

    const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(search ?? '');

    // Build filter query
    const buildQuery = (overrides: Record<string, string | undefined>) => {
        const params = new URLSearchParams();
        const current = {
            status: status ?? '',
            search: search ?? '',
            date_from: date_from ?? '',
            date_to: date_to ?? '',
            ...overrides,
        };
        Object.entries(current).forEach(([k, v]) => {
            if (v) {
                params.set(k, v);
            }
        });

        return `?${params.toString()}`;
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (status) {
            params.set('status', status);
        }

        if (searchInput.trim()) {
            params.set('search', searchInput.trim());
        }

        if (date_from) {
            params.set('date_from', date_from);
        }

        if (date_to) {
            params.set('date_to', date_to);
        }

        window.location.href = `${ordersRoute.url()}?${params.toString()}`;
    };

    const handleSort = (column: string) => {
        const newDir = sort === column && direction === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams();

        if (status) {
            params.set('status', status);
        }

        if (search) {
            params.set('search', search);
        }

        if (date_from) {
            params.set('date_from', date_from);
        }

        if (date_to) {
            params.set('date_to', date_to);
        }

        params.set('sort', column);
        params.set('direction', newDir);
        window.location.href = `${ordersRoute.url()}?${params.toString()}`;
    };

    const handleViewDetail = (order: Order) => {
        setDetailOrderId(order.id);
    };

    const handleExport = () => {
        const params = new URLSearchParams();

        if (status) {
            params.set('status', status);
        }

        if (search) {
            params.set('search', search);
        }

        if (date_from) {
            params.set('date_from', date_from);
        }

        if (date_to) {
            params.set('date_to', date_to);
        }

        window.location.href = `${exportOrders.url()}?${params.toString()}`;
    };

    const hasFilters = status || search || date_from || date_to;

    return (
        <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <KpiCard
                    label="Tổng đơn hàng"
                    value={vi(kpis.total_orders)}
                    icon={ShoppingBag}
                    color="primary"
                />
                <KpiCard
                    label="Tổng doanh thu"
                    value={fmt(kpis.total_revenue)}
                    icon={DollarSign}
                    color="green"
                />
                <KpiCard
                    label="Chờ xử lý"
                    value={vi(kpis.pending_count)}
                    icon={Clock}
                    color="amber"
                />
                <KpiCard
                    label="Đang xử lý"
                    value={vi(kpis.processing_count)}
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            {/* Actions bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {/* Status tabs */}
                    {STATUSES.map((s) => {
                        const isActive =
                            (s.key === '' && !status) || s.key === status;
                        const href =
                            s.key === ''
                                ? buildQuery({ status: undefined })
                                : buildQuery({ status: s.key });

                        return (
                            <Link
                                key={s.key}
                                href={`${ordersRoute.url()}${href}`}
                                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-md-primary text-md-on-primary'
                                        : 'bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high'
                                }`}
                            >
                                {s.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-md-outline-variant bg-md-surface-container-lowest px-3 py-2 text-xs font-medium text-md-on-surface-variant transition-colors hover:bg-md-surface-container"
                    >
                        <FileDown className="h-3.5 w-3.5" />
                        Xuất excel
                    </button>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-md-primary px-3 py-2 text-xs font-semibold text-md-on-primary transition-opacity hover:opacity-90"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Tạo đơn
                    </button>
                </div>
            </div>

            {/* Search & date filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
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
                        placeholder="Tìm theo mã đơn, tên khách, SĐT, email..."
                        className="w-full rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest py-2 pr-4 pl-9 text-sm outline-none placeholder:text-md-on-surface-variant/60 focus:border-md-primary"
                    />
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-md-on-surface-variant" />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        defaultValue={date_from ?? ''}
                        onChange={(e) => {
                            const params = new URLSearchParams(
                                window.location.search,
                            );

                            if (e.target.value) {
                                params.set('date_from', e.target.value);
                            } else {
                                params.delete('date_from');
                            }

                            window.location.href = `${ordersRoute.url()}?${params.toString()}`;
                        }}
                        className="rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest px-3 py-2 text-xs outline-none focus:border-md-primary"
                    />
                    <span className="text-xs text-md-on-surface-variant">
                        →
                    </span>
                    <input
                        type="date"
                        defaultValue={date_to ?? ''}
                        onChange={(e) => {
                            const params = new URLSearchParams(
                                window.location.search,
                            );

                            if (e.target.value) {
                                params.set('date_to', e.target.value);
                            } else {
                                params.delete('date_to');
                            }

                            window.location.href = `${ordersRoute.url()}?${params.toString()}`;
                        }}
                        className="rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest px-3 py-2 text-xs outline-none focus:border-md-primary"
                    />
                    <button
                        onClick={handleSearch}
                        className="rounded-xl bg-md-surface-container px-3 py-2 text-xs font-medium text-md-on-surface-variant hover:bg-md-surface-container-high sm:hidden"
                    >
                        Tìm
                    </button>
                </div>
                {hasFilters && (
                    <Link
                        href={ordersRoute.url()}
                        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-md-error transition-colors hover:bg-md-error-container"
                    >
                        <X className="h-3.5 w-3.5" />
                        Xoá lọc
                    </Link>
                )}
            </div>

            {/* Orders table */}
            <Card className="overflow-hidden !p-0">
                {orders.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16">
                        <ShoppingBag className="h-12 w-12 text-md-outline-variant/40" />
                        <p className="mt-4 text-sm font-medium text-md-on-surface">
                            {hasFilters
                                ? 'Không tìm thấy đơn hàng nào'
                                : 'Chưa có đơn hàng nào'}
                        </p>
                        <p className="mt-1 text-xs text-md-on-surface-variant">
                            {hasFilters
                                ? 'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm'
                                : 'Đơn hàng từ khách hàng sẽ xuất hiện tại đây'}
                        </p>
                        {!hasFilters && (
                            <button
                                onClick={() => setCreateOpen(true)}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-md-primary px-4 py-2 text-sm font-semibold text-md-on-primary hover:opacity-90"
                            >
                                <Plus className="h-4 w-4" />
                                Tạo đơn đầu tiên
                            </button>
                        )}
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
                                                    handleSort('reference')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Mã đơn
                                                {sort === 'reference' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('customer_name')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Khách hàng
                                                {sort === 'customer_name' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                            Điện thoại
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('created_at')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Ngày tạo
                                                {sort === 'created_at' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('total')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Tổng tiền
                                                {sort === 'total' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('status')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Trạng thái
                                                {sort === 'status' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                            Thanh toán
                                        </th>
                                        <th className="w-10 px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-md-outline-variant/20">
                                    {orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="cursor-pointer transition-colors hover:bg-md-surface-container/40"
                                            onClick={() =>
                                                handleViewDetail(order)
                                            }
                                        >
                                            <td className="px-5 py-3.5">
                                                <p className="font-mono text-xs font-semibold text-md-primary">
                                                    {order.reference}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-medium text-md-on-surface">
                                                    {order.customer_name}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-md-on-surface-variant">
                                                {order.customer_phone}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-md-on-surface-variant">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-semibold text-md-on-surface">
                                                    {Number(
                                                        order.total,
                                                    ).toLocaleString(
                                                        'vi-VN',
                                                    )}{' '}
                                                    ₫
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <StatusBadge
                                                    status={order.status}
                                                />
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {order.paid_at ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                        Đã TT
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                                                        Chưa TT
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetail(order);
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
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="cursor-pointer px-4 py-4 transition-colors hover:bg-md-surface-container/40"
                                    onClick={() => handleViewDetail(order)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs font-semibold text-md-primary">
                                                {order.reference}
                                            </p>
                                            <p className="mt-0.5 truncate text-sm font-medium text-md-on-surface">
                                                {order.customer_name}
                                            </p>
                                            {order.customer_phone && (
                                                <p className="mt-0.5 text-xs text-md-on-surface-variant">
                                                    {order.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <StatusBadge
                                                status={order.status}
                                            />
                                            <p className="mt-1.5 text-sm font-semibold text-md-on-surface">
                                                {Number(
                                                    order.total,
                                                ).toLocaleString('vi-VN')}{' '}
                                                ₫
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-xs text-md-on-surface-variant">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        {order.paid_at ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                Đã TT
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                                                Chưa TT
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Pagination */}
            {orders.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-md-on-surface-variant">
                        Hiển thị {orders.from}–{orders.to} trong tổng{' '}
                        {vi(orders.total)} đơn
                    </p>
                    <div className="flex items-center gap-1">
                        {orders.links.map((link, i) => {
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

            {/* Slide-overs */}
            <OrderDetailSlideOver
                orderId={detailOrderId}
                open={detailOrderId !== null}
                onClose={() => setDetailOrderId(null)}
            />

            <OrderCreateSlideOver
                products={products}
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
        </div>
    );
}

Orders.layout = (page: ReactNode) => (
    <DashboardLayout title="Đơn hàng">{page}</DashboardLayout>
);
