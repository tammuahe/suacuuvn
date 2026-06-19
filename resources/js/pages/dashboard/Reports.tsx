import { Link, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    FileDown,
    Info,
    MapPin,
    Package,
    ShoppingBag,
    ShoppingCart,
    Tag,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import Tip from '@/components/dashboard/Tip';
import StatusBadge from '@/components/StatusBadge';
import DashboardLayout from '@/layouts/DashboardLayout';
import { reports as reportsRoute } from '@/routes/dashboard';
import { exportMethod as exportReport } from '@/routes/dashboard/reports';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthRevenue {
    month: string;
    revenue: number;
}

interface ProvinceData {
    province: string;
    orders: number;
    revenue: number;
}

interface ProductRow {
    product_id: number;
    product_name: string;
    total_qty: number;
    total_revenue: number;
}

interface StatusRow {
    status: string;
    count: number;
    revenue: number;
    aov: number;
}

interface PaymentMethod {
    method: string;
    count: number;
    revenue: number;
}

interface DailyRow {
    date: string;
    orders: number;
    revenue: number;
    paid_revenue: number;
    unpaid_revenue: number;
}

interface OrderRow {
    id: number;
    reference: string;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    total: number;
    status: string;
    payment_method: string | null;
    paid_at: string | null;
    created_at: string;
}

interface CustomerSummary {
    unique_customers: number;
    repeat_customers: number;
    repeat_rate: number;
    new_customers: number;
    avg_clv: number;
    orders_per_customer: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedOrders {
    data: OrderRow[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
}

interface ReportsProps {
    date_from: string;
    date_to: string;
    compared: {
        revenue: { current: number; previous: number; change: number };
        orders: { current: number; previous: number; change: number };
    };
    revenue_by_day: DailyRow[];
    orders: PaginatedOrders;
    by_status: StatusRow[];
    by_payment_method: PaymentMethod[];
    paid_revenue: number;
    unpaid_revenue: number;
    payment_success_rate: number;
    top_products: ProductRow[];
    avg_items_per_order: number;
    customer_summary: CustomerSummary;
    revenue_breakdown: {
        net_revenue: number;
        discount: number;
        tax: number;
        shipping: number;
    };
    total_discount: number;
    discount_rate: number;
    total_tax: number;
    total_shipping: number;
    total_revenue: number;
    net_revenue: number;
    by_province: ProvinceData[];
    avg_fulfill_hours: number;
    cancellation_rate: number;
    processing_orders: number;
    soft_deleted_count: number;
    revenue_by_month: MonthRevenue[];
}

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

function pct(n: number) {
    return `${n.toFixed(1)}%`;
}

function vi(n: number) {
    return n.toLocaleString('vi-VN');
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
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

function Card({
    children,
    className = '',
}: {
    children: React.ReactNode;
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

const STATUS_VI: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã huỷ',
};

function ChangeBadge({ value }: { value: number }) {
    if (value === 0) {
        return (
            <span className="text-xs text-md-on-surface-variant">—</span>
        );
    }

    const up = value > 0;

    return (
        <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-700'}`}
        >
            <TrendingUp className={`h-3 w-3 ${!up && 'rotate-180'}`} />
            {up ? '+' : ''}
            {value}%
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reports() {
    const props = usePage<{ props: ReportsProps }>()
        .props as unknown as ReportsProps;

    const {
        date_from,
        date_to,
        compared,
        revenue_by_day,
        orders,
        by_status,
        by_payment_method,
        paid_revenue,
        unpaid_revenue,
        payment_success_rate,
        top_products,
        avg_items_per_order,
        customer_summary,
        total_discount,
        discount_rate,
        total_tax,
        total_shipping,
        total_revenue,
        net_revenue,
        by_province,
        avg_fulfill_hours,
        cancellation_rate,
        processing_orders,
        soft_deleted_count,
        revenue_by_month,
    } = props;

    const buildExportUrl = (section: string) => {
        const params = new URLSearchParams();

        params.set('date_from', date_from);
        params.set('date_to', date_to);

        return `${exportReport.url(section)}?${params.toString()}`;
    };

    const EXPORT_BUTTONS = [
        { key: 'orders', label: 'Danh sách đơn hàng' },
        { key: 'daily', label: 'Doanh thu theo ngày' },
        { key: 'products', label: 'Sản phẩm' },
        { key: 'customers', label: 'Khách hàng' },
        { key: 'provinces', label: 'Tỉnh/Thành' },
        { key: 'payments', label: 'Phương thức TT' },
    ];

    return (
        <div className="space-y-8">
            {/* ─── Controls ───────────────────────────────────────────────── */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-3">
                    <div>
                        <p className="mb-1 text-xs font-medium text-md-on-surface-variant">
                            Từ ngày
                        </p>
                        <input
                            type="date"
                            defaultValue={date_from}
                            onChange={(e) => {
                                const params = new URLSearchParams(
                                    window.location.search,
                                );

                                if (e.target.value) {
                                    params.set('date_from', e.target.value);
                                } else {
                                    params.delete('date_from');
                                }

                                window.location.href = `${reportsRoute.url()}?${params.toString()}`;
                            }}
                            className="rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest px-3 py-2 text-xs outline-none focus:border-md-primary"
                        />
                    </div>
                    <span className="pb-2 text-xs text-md-on-surface-variant">
                        →
                    </span>
                    <div>
                        <p className="mb-1 text-xs font-medium text-md-on-surface-variant">
                            Đến ngày
                        </p>
                        <input
                            type="date"
                            defaultValue={date_to}
                            onChange={(e) => {
                                const params = new URLSearchParams(
                                    window.location.search,
                                );

                                if (e.target.value) {
                                    params.set('date_to', e.target.value);
                                } else {
                                    params.delete('date_to');
                                }

                                window.location.href = `${reportsRoute.url()}?${params.toString()}`;
                            }}
                            className="rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest px-3 py-2 text-xs outline-none focus:border-md-primary"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {EXPORT_BUTTONS.map((s) => (
                        <a
                            key={s.key}
                            href={buildExportUrl(s.key)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-md-outline-variant bg-md-surface-container-lowest px-3 py-2 text-xs font-medium text-md-on-surface-variant transition-colors hover:bg-md-surface-container"
                        >
                            <FileDown className="h-3.5 w-3.5" />
                            {s.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* ─── Period comparison ──────────────────────────────────────── */}

            <Section icon={TrendingUp} title="So sánh kỳ trước">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Doanh thu kỳ này
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                            {fmt(compared.revenue.current)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <p className="text-xs text-md-on-surface-variant">
                                Kỳ trước: {fmt(compared.revenue.previous)}
                            </p>
                            <ChangeBadge value={compared.revenue.change} />
                        </div>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Số đơn kỳ này
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                            {vi(compared.orders.current)}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <p className="text-xs text-md-on-surface-variant">
                                Kỳ trước: {vi(compared.orders.previous)}
                            </p>
                            <ChangeBadge value={compared.orders.change} />
                        </div>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Giá trị đơn hàng trung bình
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                            {fmt(
                                compared.orders.current > 0
                                    ? compared.revenue.current /
                                          compared.orders.current
                                    : 0,
                            )}
                        </p>
                        <p className="mt-1 text-xs text-md-on-surface-variant">
                            Tỉ lệ thanh toán: {pct(payment_success_rate)}
                        </p>
                    </Card>
                </div>
            </Section>

            {/* ─── Daily breakdown ────────────────────────────────────────── */}

            <Section icon={ShoppingBag} title="Phân tích theo ngày">
                <div className="overflow-hidden rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest shadow-sm">
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-md-outline-variant/30 bg-md-surface-container/50">
                                    <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                        Ngày
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                        Đơn hàng
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                        Doanh thu
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                        Đã thanh toán
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                        Chưa thanh toán
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-md-outline-variant/20">
                                {revenue_by_day.map((d) => (
                                    <tr
                                        key={d.date}
                                        className="transition-colors hover:bg-md-surface-container/40"
                                    >
                                        <td className="px-5 py-3 text-xs font-medium text-md-on-surface">
                                            {new Date(
                                                d.date,
                                            ).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm text-md-on-surface">
                                            {vi(d.orders)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm font-semibold text-md-on-surface">
                                            {fmt(d.revenue)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm text-emerald-600">
                                            {fmt(d.paid_revenue)}
                                        </td>
                                        <td className="px-5 py-3 text-right text-sm text-amber-600">
                                            {d.unpaid_revenue > 0
                                                ? fmt(d.unpaid_revenue)
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="divide-y divide-md-outline-variant/20 md:hidden">
                        {revenue_by_day.map((d) => (
                            <div key={d.date} className="px-4 py-4">
                                <div className="flex items-start justify-between">
                                    <p className="text-sm font-medium text-md-on-surface">
                                        {new Date(d.date).toLocaleDateString(
                                            'vi-VN',
                                        )}
                                    </p>
                                    <p className="text-sm font-semibold text-md-on-surface">
                                        {fmt(d.revenue)}
                                    </p>
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-md-on-surface-variant">
                                    <span>{vi(d.orders)} đơn</span>
                                    <span className="text-emerald-600">
                                        Đã TT: {fmt(d.paid_revenue)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ─── Status breakdown ──────────────────────────────────────── */}

            <Section icon={CreditCard} title="Phân tích trạng thái đơn hàng">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {by_status.map((s) => (
                        <Card key={s.status}>
                            <p className="text-xs text-md-on-surface-variant">
                                {STATUS_VI[s.status] ?? s.status}
                            </p>
                            <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                                {vi(s.count)}
                            </p>
                            <p className="mt-0.5 text-xs text-md-on-surface-variant">
                                {fmt(s.revenue)} — TB {fmt(s.aov)}/đơn
                            </p>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* ─── Order list ────────────────────────────────────────────── */}

            <Section icon={ShoppingBag} title="Danh sách đơn hàng">
                <div className="overflow-hidden rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest shadow-sm">
                    {orders.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16">
                            <ShoppingBag className="h-12 w-12 text-md-outline-variant/40" />
                            <p className="mt-4 text-sm font-medium text-md-on-surface">
                                Không có đơn hàng trong khoảng thời gian này
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-md-outline-variant/30 bg-md-surface-container/50">
                                            <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                                Mã đơn
                                            </th>
                                            <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                                Khách hàng
                                            </th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                                Tổng tiền
                                            </th>
                                            <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                                Trạng thái
                                            </th>
                                            <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                                Thanh toán
                                            </th>
                                            <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                                Ngày tạo
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-md-outline-variant/20">
                                        {orders.data.map((o) => (
                                            <tr
                                                key={o.id}
                                                className="transition-colors hover:bg-md-surface-container/40"
                                            >
                                                <td className="px-5 py-3.5 font-mono text-xs font-semibold text-md-primary">
                                                    {o.reference}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-md-on-surface">
                                                    {o.customer_name ?? '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-sm font-semibold text-md-on-surface">
                                                    {vi(o.total)} ₫
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge
                                                        status={o.status}
                                                    />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {o.paid_at ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                            Đã thanh toán
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                                                            Chưa thanh toán
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-md-on-surface-variant">
                                                    {new Date(
                                                        o.created_at,
                                                    ).toLocaleDateString(
                                                        'vi-VN',
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="divide-y divide-md-outline-variant/20 md:hidden">
                                {orders.data.map((o) => (
                                    <div key={o.id} className="px-4 py-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-mono text-xs font-semibold text-md-primary">
                                                    {o.reference}
                                                </p>
                                                <p className="mt-0.5 text-sm font-medium text-md-on-surface">
                                                    {o.customer_name ?? '—'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-md-on-surface">
                                                    {vi(o.total)} ₫
                                                </p>
                                                <StatusBadge
                                                    status={o.status}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

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
            </Section>

            {/* ─── Products ──────────────────────────────────────────────── */}

            <Section icon={Package} title="Hiệu suất sản phẩm">
                <div className="overflow-hidden rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest shadow-sm">
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-md-outline-variant/30 bg-md-surface-container/50">
                                    <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                        #
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                        Sản phẩm
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                        Số lượng bán
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                        Doanh thu
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                        % tổng DT
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-md-outline-variant/20">
                                {top_products.map((p, i) => (
                                    <tr
                                        key={p.product_id}
                                        className="transition-colors hover:bg-md-surface-container/40"
                                    >
                                        <td className="px-5 py-3.5 text-xs font-bold text-md-on-surface-variant">
                                            {i + 1}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-medium text-md-on-surface">
                                            {p.product_name}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm text-md-on-surface">
                                            {vi(p.total_qty)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm font-semibold text-md-on-surface">
                                            {fmt(p.total_revenue)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-xs text-md-on-surface-variant">
                                            {total_revenue > 0
                                                ? pct(
                                                      (p.total_revenue /
                                                          total_revenue) *
                                                          100,
                                                  )
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="divide-y divide-md-outline-variant/20 md:hidden">
                        {top_products.map((p, i) => (
                            <div
                                key={p.product_id}
                                className="flex items-center gap-3 px-4 py-4"
                            >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-md-primary/10 text-xs font-bold text-md-primary">
                                    {i + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-md-on-surface">
                                        {p.product_name}
                                    </p>
                                    <p className="text-xs text-md-on-surface-variant">
                                        {vi(p.total_qty)} đã bán —{' '}
                                        {fmt(p.total_revenue)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-md-on-surface-variant">
                                Số lượng sản phẩm trung bình / đơn
                            </p>
                            <p className="mt-1 text-3xl font-bold text-md-on-surface">
                                {avg_items_per_order.toFixed(2)}
                            </p>
                        </div>
                        <ShoppingCart className="h-10 w-10 text-md-primary/20" />
                    </div>
                </Card>
            </Section>

            {/* ─── Customer summary ──────────────────────────────────────── */}

            <Section icon={Users} title="Phân tích khách hàng">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tổng số khách hàng
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                            {vi(customer_summary.unique_customers)}
                        </p>
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            {vi(customer_summary.new_customers)} khách mới
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tỉ lệ quay lại
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-600">
                            {pct(customer_summary.repeat_rate)}
                        </p>
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            {vi(customer_summary.repeat_customers)} khách
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Số đơn trung bình / khách
                            <Tip label="Tổng số đơn hàng trên tổng số khách hàng">
                                <Info className="ml-0.5 inline h-3 w-3 align-text-top text-md-on-surface-variant/60" />
                            </Tip>
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                            {customer_summary.orders_per_customer.toFixed(1)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            CLV trung bình
                            <Tip label="CLV: Tổng doanh thu trên tổng số khách hàng">
                                <Info className="ml-0.5 inline h-3 w-3 align-text-top text-md-on-surface-variant/60" />
                            </Tip>
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                            {fmt(customer_summary.avg_clv)}
                        </p>
                    </Card>
                </div>
            </Section>

            {/* ─── Payment breakdown ─────────────────────────────────────── */}

            <Section icon={CreditCard} title="Phân tích thanh toán">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Doanh thu đã thanh toán
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-600">
                            {fmt(paid_revenue)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Doanh thu chưa thanh toán
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-amber-600">
                            {fmt(unpaid_revenue)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tỉ lệ thanh toán thành công
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-primary">
                            {pct(payment_success_rate)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tổng chiết khấu
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-red-700">
                            {fmt(total_discount)}
                        </p>
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            {pct(discount_rate)} doanh thu
                        </p>
                    </Card>
                </div>
                <div className="overflow-hidden rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-md-outline-variant/30 bg-md-surface-container/50">
                                <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                    Phương thức
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                    Số đơn
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                    Doanh thu
                                </th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                    % tổng đơn
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-md-outline-variant/20">
                            {by_payment_method.map((pm) => {
                                const totalCount = orders.total;

                                return (
                                    <tr
                                        key={pm.method}
                                        className="transition-colors hover:bg-md-surface-container/40"
                                    >
                                        <td className="px-5 py-3.5 text-sm font-medium text-md-on-surface">
                                            {pm.method}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-md-on-surface">
                                            {vi(pm.count)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm font-semibold text-md-on-surface">
                                            {fmt(pm.revenue)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-xs text-md-on-surface-variant">
                                            {totalCount > 0
                                                ? pct(
                                                      (pm.count / totalCount) *
                                                          100,
                                                  )
                                                : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Section>

            {/* ─── Geography ─────────────────────────────────────────────── */}

            <Section icon={MapPin} title="Phân tích địa lý">
                {by_province.length === 0 ? (
                    <Card>
                        <p className="py-4 text-center text-xs text-md-on-surface-variant">
                            Không có dữ liệu
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <div className="overflow-hidden rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-md-outline-variant/30 bg-md-surface-container/50">
                                            <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                                #
                                            </th>
                                            <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                                Tỉnh/Thành
                                            </th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                                Đơn hàng
                                            </th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                                Doanh thu
                                            </th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-md-on-surface-variant">
                                                % tổng DT
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-md-outline-variant/20">
                                        {by_province.map((p, i) => (
                                            <tr
                                                key={p.province}
                                                className="transition-colors hover:bg-md-surface-container/40"
                                            >
                                                <td className="px-5 py-3.5 text-xs font-bold text-md-on-surface-variant">
                                                    {i + 1}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-medium text-md-on-surface">
                                                    {p.province}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-md-on-surface">
                                                    {vi(p.orders)}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-sm font-semibold text-md-on-surface">
                                                    {fmt(p.revenue)}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-xs text-md-on-surface-variant">
                                                    {total_revenue > 0
                                                        ? pct(
                                                              (p.revenue /
                                                                  total_revenue) *
                                                                  100,
                                                          )
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {by_province.slice(0, 4).map((p, i) => (
                                <Card key={p.province}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-md-on-surface-variant">
                                                {p.province}
                                            </p>
                                            <p className="mt-1 text-lg font-bold text-md-on-surface">
                                                {vi(p.orders)} đơn
                                            </p>
                                            <p className="text-xs text-md-on-surface-variant">
                                                {fmt(p.revenue)}
                                            </p>
                                        </div>
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-md-primary/10 text-xs font-bold text-md-primary">
                                            {i + 1}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </Section>

            {/* ─── Pricing & Cost ─────────────────────────────────────────── */}

            <Section icon={Tag} title="Giá & Chi phí">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Doanh thu thuần
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface">
                            {fmt(net_revenue)}
                        </p>
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            Doanh thu sau chiết khấu
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tổng chiết khấu
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-red-700">
                            {fmt(total_discount)}
                        </p>
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            {pct(discount_rate)} doanh thu
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Thuế VAT
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-primary">
                            {fmt(total_tax)}
                        </p>
                        <p className="mt-0.5 text-xs text-md-on-surface-variant">
                            Thuế giá trị gia tăng
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Phí vận chuyển
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-teal-600">
                            {fmt(total_shipping)}
                        </p>
                    </Card>
                </div>
            </Section>

            {/* ─── Operations ────────────────────────────────────────────── */}

            <Section icon={Clock} title="Vận hành">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Thời gian xử lý trung bình
                            <Tip label="Thời gian trung bình từ khi tạo đơn đến khi khách hàng thanh toán">
                                <Info className="ml-0.5 inline h-3 w-3 align-text-top text-md-on-surface-variant/60" />
                            </Tip>
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-primary">
                            {avg_fulfill_hours.toFixed(1)}h
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tỉ lệ huỷ đơn
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-red-700">
                            {pct(cancellation_rate)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Đơn hàng đang xử lý
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-blue-600">
                            {vi(processing_orders)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Đơn hàng đã xoá
                        </p>
                        <p className="mt-1.5 text-2xl font-bold tracking-tight text-md-on-surface-variant">
                            {vi(soft_deleted_count)}
                        </p>
                    </Card>
                </div>
            </Section>

            {/* ─── Revenue by month ──────────────────────────────────────── */}

            {revenue_by_month.length > 0 && (
                <Section
                    icon={TrendingUp}
                    title="Doanh thu theo tháng (12 tháng)"
                >
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {revenue_by_month.map((m) => (
                            <Card key={m.month}>
                                <p className="text-xs font-semibold text-md-on-surface-variant">
                                    {m.month.slice(0, 7)}
                                </p>
                                <p className="mt-1 text-lg font-bold text-md-on-surface">
                                    {fmt(m.revenue)}
                                </p>
                            </Card>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}

Reports.layout = (page: ReactNode) => (
    <DashboardLayout title="Báo cáo">{page}</DashboardLayout>
);
