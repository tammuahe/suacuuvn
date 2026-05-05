import { usePage } from '@inertiajs/react';
import ReactECharts from 'echarts-for-react';
import {
    TrendingUp,
    ShoppingCart,
    Users,
    DollarSign,
    Package,
    MapPin,
    Clock,
    CreditCard,
    BarChart2,
    Tag,
    CheckCircle2,
} from 'lucide-react';
import type { ReactNode } from 'react';

import DashboardLayout from '@/layouts/DashboardLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpis {
    total_orders: number;
    total_revenue: number;
    net_revenue: number;
    paid_revenue: number;
    unpaid_revenue: number;
    aov: number;
    total_discount: number;
    total_tax: number;
    total_shipping: number;
    paid_orders: number;
    unpaid_orders: number;
    canceled_orders: number;
    processing_orders: number;
    avg_fulfill_hours: number;
    with_email: number;
    with_phone: number;
    with_address: number;
    discount_rate: number;
    payment_success_rate: number;
    cancellation_rate: number;
    email_rate: number;
    phone_rate: number;
    address_rate: number;
}

interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface ProvinceData {
    province: string;
    orders: number;
    revenue: number;
}

interface ProductQty {
    product_name: string;
    total_qty: number;
}

interface ProductRevenue {
    product_name: string;
    total_revenue: number;
}

interface CustomerMetrics {
    unique_customers: number;
    repeat_customers: number;
    repeat_rate: number;
    avg_clv: number;
    orders_per_customer: number;
}

interface MetricsProps {
    kpis: Kpis;
    by_status: Record<string, number>;
    revenue_by_day: DailyRevenue[];
    revenue_by_month: MonthlyRevenue[];
    by_payment_method: Record<string, number>;
    by_province: ProvinceData[];
    top_by_qty: ProductQty[];
    top_by_revenue: ProductRevenue[];
    avg_items_per_order: number;
    customer_metrics: CustomerMetrics;
    soft_deleted_count: number;
}

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
    primary: '#475D92',
    secondary: '#735187',
    green: '#4CAF50',
    amber: '#F59E0B',
    red: '#BA1A1A',
    blue: '#2563EB',
    teal: '#0D9488',
    grid: 'rgba(73,69,78,0.08)',
    text: '#49454E',
    muted: '#7A757F',
    palette: [
        '#475D92', // primary
        '#735187', // secondary
        '#725572', // tertiary
        '#2563EB', // blue
        '#0D9488', // teal
        '#F59E0B', // amber
        '#4CAF50', // green
        '#BA1A1A', // error/red
    ],
};

const BASE = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'inherit', color: C.text },
    grid: { top: 36, right: 16, bottom: 36, left: 56, containLabel: true },
    tooltip: {
        backgroundColor: '#fff',
        borderColor: '#CBc4cf',
        borderWidth: 1,
        textStyle: { color: '#1C1B20', fontSize: 12 },
        extraCssText:
            'box-shadow:0 4px 16px rgba(0,0,0,.10);border-radius:12px;',
    },
};

const STATUS_VI: Record<string, string> = {
    completed: 'Hoàn thành',
    pending: 'Chờ xử lý',
    cancelled: 'Đã hủy',
    delivered: 'Đã giao hàng',
    processing: 'Đang xử lý',
    shipped: 'Đã giao cho đơn vị vận chuyển',
};

const STATUS_COLOR: Record<string, string> = {
    completed: C.green,
    pending: C.amber,
    cancelled: C.red,
    delivered: C.green,
    processing: C.blue,
    shipped: C.teal,
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

function KpiCard({
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
    icon: React.ElementType;
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

function ChartCard({
    title,
    children,
    className = '',
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={className}>
            <p className="mb-4 text-sm font-semibold text-md-on-surface">
                {title}
            </p>
            {children}
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Metrics() {
    const {
        kpis,
        by_status,
        revenue_by_day,
        revenue_by_month,
        by_payment_method,
        by_province,
        top_by_qty,
        top_by_revenue,
        avg_items_per_order,
        customer_metrics,
        soft_deleted_count,
    } = usePage<{ props: MetricsProps }>().props as unknown as MetricsProps;

    // ── Chart options ──────────────────────────────────────────────────────────

    const revenueLineOption = {
        ...BASE,
        tooltip: { ...BASE.tooltip, trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: revenue_by_day.map((d) => d.date.slice(5)),
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { color: C.muted, fontSize: 10, interval: 4 },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: C.muted,
                fontSize: 10,
                formatter: (v: number) => fmt(v),
            },
            splitLine: { lineStyle: { color: C.grid } },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        series: [
            {
                name: 'Doanh thu',
                type: 'line',
                data: revenue_by_day.map((d) => d.revenue),
                smooth: true,
                symbol: 'none',
                lineStyle: { color: C.primary, width: 2.5 },
                itemStyle: { color: C.primary },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(71,93,146,.22)' },
                            { offset: 1, color: 'rgba(71,93,146,0)' },
                        ],
                    },
                },
            },
        ],
    };

    const orderBarOption = {
        ...BASE,
        tooltip: { ...BASE.tooltip, trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: revenue_by_day.map((d) => d.date.slice(5)),
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { color: C.muted, fontSize: 10, interval: 4 },
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: C.muted, fontSize: 10 },
            splitLine: { lineStyle: { color: C.grid } },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        series: [
            {
                name: 'Đơn hàng',
                type: 'bar',
                data: revenue_by_day.map((d) => d.orders),
                barMaxWidth: 16,
                itemStyle: { color: C.blue, borderRadius: [4, 4, 0, 0] },
            },
        ],
    };

    const monthlyBarOption = {
        ...BASE,
        tooltip: {
            ...BASE.tooltip,
            trigger: 'axis',
            formatter: (p: { name: string; value: number }[]) =>
                `${p[0].name}: ${fmt(p[0].value)}`,
        },
        xAxis: {
            type: 'category',
            data: revenue_by_month.map(
                (d) => d.month.slice(5) + '/' + d.month.slice(0, 4),
            ),
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { color: C.muted, fontSize: 10 },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: C.muted,
                fontSize: 10,
                formatter: (v: number) => fmt(v),
            },
            splitLine: { lineStyle: { color: C.grid } },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        series: [
            {
                name: 'Doanh thu tháng',
                type: 'bar',
                data: revenue_by_month.map((d) => d.revenue),
                barMaxWidth: 32,
                itemStyle: {
                    borderRadius: [6, 6, 0, 0],
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: C.primary },
                            { offset: 1, color: 'rgba(71,93,146,.35)' },
                        ],
                    },
                },
            },
        ],
    };

    const statusDonutOption = {
        ...BASE,
        tooltip: {
            ...BASE.tooltip,
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'vertical',
            right: 0,
            top: 'center',
            textStyle: { fontSize: 11, color: C.text },
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
        },
        series: [
            {
                name: 'Trạng thái',
                type: 'pie',
                radius: ['48%', '72%'],
                center: ['38%', '50%'],
                label: { show: false },
                labelLine: { show: false },
                data: Object.entries(by_status).map(([s, c]) => ({
                    name: STATUS_VI[s] ?? s,
                    value: c,
                    itemStyle: { color: STATUS_COLOR[s] ?? C.primary },
                })),
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,.15)',
                    },
                },
            },
        ],
    };

    const paymentMethodOption = {
        ...BASE,
        tooltip: {
            ...BASE.tooltip,
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        series: [
            {
                name: 'Phương thức',
                type: 'pie',
                radius: ['40%', '68%'],
                center: ['50%', '52%'],
                data: Object.entries(by_payment_method)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, value], i) => ({
                        name,
                        value,
                        itemStyle: { color: C.palette[i] },
                    })),
                label: {
                    show: true,
                    formatter: '{b}\n{d}%',
                    fontSize: 10,
                    color: C.text,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,.15)',
                    },
                },
            },
        ],
    };

    const paidUnpaidOption = {
        ...BASE,
        tooltip: {
            ...BASE.tooltip,
            trigger: 'axis',
            formatter: (p: { name: string; value: number }[]) =>
                p.map((x) => `${x.name}: ${fmt(x.value)}`).join('<br/>'),
        },
        xAxis: {
            type: 'category',
            data: ['Doanh thu'],
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: C.muted,
                fontSize: 10,
                formatter: (v: number) => fmt(v),
            },
            splitLine: { lineStyle: { color: C.grid } },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        legend: {
            bottom: 0,
            textStyle: { fontSize: 11, color: C.text },
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
        },
        series: [
            {
                name: 'Đã thanh toán',
                type: 'bar',
                stack: 't',
                data: [kpis.paid_revenue],
                barWidth: 48,
                itemStyle: { color: C.green, borderRadius: [0, 0, 8, 8] },
            },
            {
                name: 'Chưa thanh toán',
                type: 'bar',
                stack: 't',
                data: [kpis.unpaid_revenue],
                barWidth: 48,
                // md-primary-container tinted
                itemStyle: { color: '#D9E2FF', borderRadius: [8, 8, 0, 0] },
            },
        ],
    };

    const topQtyOption = {
        ...BASE,
        grid: { top: 8, right: 60, bottom: 8, left: 8, containLabel: true },
        tooltip: {
            ...BASE.tooltip,
            trigger: 'axis',
            axisPointer: { type: 'none' },
        },
        xAxis: {
            type: 'value',
            axisLabel: { color: C.muted, fontSize: 10 },
            splitLine: { lineStyle: { color: C.grid } },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'category',
            data: [...top_by_qty].reverse().map((p) => p.product_name),
            axisLabel: {
                color: C.text,
                fontSize: 10,
                width: 120,
                overflow: 'break',
            },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        series: [
            {
                name: 'Số lượng',
                type: 'bar',
                data: [...top_by_qty].reverse().map((p) => p.total_qty),
                barMaxWidth: 20,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 1,
                        y2: 0,
                        colorStops: [
                            { offset: 0, color: 'rgba(71,93,146,.25)' },
                            { offset: 1, color: C.primary },
                        ],
                    },
                },
                label: {
                    show: true,
                    position: 'right',
                    color: C.muted,
                    fontSize: 10,
                },
            },
        ],
    };

    const topRevenueOption = {
        ...BASE,
        grid: { top: 8, right: 80, bottom: 8, left: 8, containLabel: true },
        tooltip: {
            ...BASE.tooltip,
            trigger: 'axis',
            axisPointer: { type: 'none' },
            formatter: (p: { name: string; value: number }[]) =>
                `${p[0].name}: ${fmt(p[0].value)}`,
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                color: C.muted,
                fontSize: 10,
                formatter: (v: number) => fmt(v),
            },
            splitLine: { lineStyle: { color: C.grid } },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'category',
            data: [...top_by_revenue].reverse().map((p) => p.product_name),
            axisLabel: {
                color: C.text,
                fontSize: 10,
                width: 120,
                overflow: 'break',
            },
            axisLine: { show: false },
            axisTick: { show: false },
        },
        series: [
            {
                name: 'Doanh thu',
                type: 'bar',
                data: [...top_by_revenue].reverse().map((p) => p.total_revenue),
                barMaxWidth: 20,
                itemStyle: {
                    borderRadius: [0, 6, 6, 0],
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 1,
                        y2: 0,
                        colorStops: [
                            { offset: 0, color: 'rgba(13,148,136,.2)' },
                            { offset: 1, color: C.teal },
                        ],
                    },
                },
                label: {
                    show: true,
                    position: 'right',
                    color: C.muted,
                    fontSize: 10,
                    formatter: (p: { value: number }) => fmt(p.value),
                },
            },
        ],
    };

    const provinceOption = {
        ...BASE,
        tooltip: { ...BASE.tooltip, trigger: 'axis' },
        legend: {
            top: 0,
            right: 0,
            textStyle: { fontSize: 11, color: C.text },
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
        },
        xAxis: {
            type: 'category',
            data: by_province.map((p) => p.province),
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { color: C.text, fontSize: 10 },
        },
        yAxis: [
            {
                type: 'value',
                name: 'Doanh thu',
                nameTextStyle: { color: C.muted, fontSize: 10 },
                axisLabel: {
                    color: C.muted,
                    fontSize: 10,
                    formatter: (v: number) => fmt(v),
                },
                splitLine: { lineStyle: { color: C.grid } },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            {
                type: 'value',
                name: 'Đơn',
                nameTextStyle: { color: C.muted, fontSize: 10 },
                axisLabel: { color: C.muted, fontSize: 10 },
                splitLine: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
            },
        ],
        series: [
            {
                name: 'Doanh thu',
                type: 'bar',
                data: by_province.map((p) => p.revenue),
                barMaxWidth: 36,
                yAxisIndex: 0,
                itemStyle: { color: C.primary, borderRadius: [6, 6, 0, 0] },
            },
            {
                name: 'Đơn hàng',
                type: 'line',
                data: by_province.map((p) => p.orders),
                smooth: true,
                yAxisIndex: 1,
                lineStyle: { color: C.amber, width: 2 },
                itemStyle: { color: C.amber },
                symbol: 'circle',
                symbolSize: 6,
            },
        ],
    };

    const costBreakdownOption = {
        ...BASE,
        tooltip: {
            ...BASE.tooltip,
            trigger: 'item',
            formatter: (p: { name: string; value: number; percent: number }) =>
                `${p.name}: ${fmt(p.value)} (${p.percent}%)`,
        },
        series: [
            {
                name: 'Cơ cấu',
                type: 'pie',
                radius: ['35%', '65%'],
                center: ['50%', '50%'],
                data: [
                    {
                        name: 'Doanh thu thuần',
                        value: kpis.net_revenue,
                        itemStyle: { color: C.primary },
                    },
                    {
                        name: 'Giảm giá',
                        value: kpis.total_discount,
                        itemStyle: { color: C.red },
                    },
                    {
                        name: 'Thuế VAT',
                        value: kpis.total_tax,
                        itemStyle: { color: C.amber },
                    },
                    {
                        name: 'Phí vận chuyển',
                        value: kpis.total_shipping,
                        itemStyle: { color: C.teal },
                    },
                ],
                label: {
                    show: true,
                    formatter: '{b}\n{d}%',
                    fontSize: 10,
                    color: C.text,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,.15)',
                    },
                },
            },
        ],
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-8">
            {/* Doanh thu & Đơn hàng */}
            <Section icon={DollarSign} title="Doanh thu & Đơn hàng">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <KpiCard
                        label="Tổng doanh thu"
                        value={fmt(kpis.total_revenue)}
                        sub={`${vi(kpis.total_orders)} đơn`}
                        icon={DollarSign}
                        color="primary"
                    />
                    <KpiCard
                        label="Doanh thu thuần"
                        value={fmt(kpis.net_revenue)}
                        sub="Sau giảm giá"
                        icon={TrendingUp}
                        color="green"
                    />
                    <KpiCard
                        label="Giá trị đơn TB (AOV)"
                        value={fmt(kpis.aov)}
                        sub="Trên mỗi đơn"
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <KpiCard
                        label="Tổng đơn hàng"
                        value={vi(kpis.total_orders)}
                        sub={`${vi(kpis.paid_orders)} đã thanh toán`}
                        icon={BarChart2}
                        color="amber"
                    />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ChartCard title="Doanh thu — 30 ngày gần nhất">
                        <ReactECharts
                            option={revenueLineOption}
                            style={{ height: 200 }}
                        />
                    </ChartCard>
                    <ChartCard title="Số đơn hàng — 30 ngày gần nhất">
                        <ReactECharts
                            option={orderBarOption}
                            style={{ height: 200 }}
                        />
                    </ChartCard>
                </div>
                <ChartCard title="Doanh thu theo tháng (12 tháng gần nhất)">
                    <ReactECharts
                        option={monthlyBarOption}
                        style={{ height: 220 }}
                    />
                </ChartCard>
            </Section>

            {/* Trạng thái đơn hàng */}
            <Section icon={CheckCircle2} title="Trạng thái đơn hàng">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <ChartCard
                        title="Phân bổ trạng thái đơn"
                        className="lg:col-span-2"
                    >
                        <ReactECharts
                            option={statusDonutOption}
                            style={{ height: 240 }}
                        />
                    </ChartCard>
                    <div className="grid grid-rows-3 gap-4">
                        <Card>
                            <p className="text-xs text-md-on-surface-variant">
                                Tỷ lệ chuyển đổi
                            </p>
                            <p className="mt-1 text-2xl font-bold text-emerald-600">
                                {pct(kpis.payment_success_rate)}
                            </p>
                            <p className="text-xs text-md-on-surface-variant">
                                Đã thanh toán / tổng đơn
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-md-on-surface-variant">
                                Tỷ lệ hủy đơn
                            </p>
                            <p className="mt-1 text-2xl font-bold text-red-700">
                                {pct(kpis.cancellation_rate)}
                            </p>
                            <p className="text-xs text-md-on-surface-variant">
                                {vi(kpis.canceled_orders)} đơn đã hủy
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-md-on-surface-variant">
                                Chưa thanh toán
                            </p>
                            <p className="mt-1 text-2xl font-bold text-amber-500">
                                {vi(kpis.unpaid_orders)}
                            </p>
                            <p className="text-xs text-md-on-surface-variant">
                                Không có paid_at
                            </p>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* Thanh toán */}
            <Section icon={CreditCard} title="Thanh toán">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <ChartCard
                        title="Phân bổ phương thức thanh toán"
                        className="lg:col-span-2"
                    >
                        <ReactECharts
                            option={paymentMethodOption}
                            style={{ height: 240 }}
                        />
                    </ChartCard>
                    <ChartCard title="Đã thu vs Chưa thu">
                        <ReactECharts
                            option={paidUnpaidOption}
                            style={{ height: 240 }}
                        />
                    </ChartCard>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Doanh thu đã thu
                        </p>
                        <p className="mt-1 text-xl font-bold text-emerald-600">
                            {fmt(kpis.paid_revenue)}
                        </p>
                        <p className="text-xs text-md-on-surface-variant">
                            {pct(
                                (kpis.paid_revenue / kpis.total_revenue) * 100,
                            )}{' '}
                            tổng doanh thu
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Doanh thu chưa thu
                        </p>
                        <p className="mt-1 text-xl font-bold text-red-700">
                            {fmt(kpis.unpaid_revenue)}
                        </p>
                        <p className="text-xs text-md-on-surface-variant">
                            Đang chờ thu tiền
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tỷ lệ thanh toán thành công
                        </p>
                        <p className="mt-1 text-xl font-bold text-md-primary">
                            {pct(kpis.payment_success_rate)}
                        </p>
                        <p className="text-xs text-md-on-surface-variant">
                            payment_reference + paid_at
                        </p>
                    </Card>
                </div>
            </Section>

            {/* Khách hàng */}
            <Section icon={Users} title="Khách hàng">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <KpiCard
                        label="Khách hàng duy nhất"
                        value={vi(customer_metrics.unique_customers)}
                        icon={Users}
                        color="primary"
                    />
                    <KpiCard
                        label="Tỷ lệ quay lại"
                        value={pct(customer_metrics.repeat_rate)}
                        sub={`${vi(customer_metrics.repeat_customers)} khách`}
                        icon={TrendingUp}
                        color="green"
                    />
                    <KpiCard
                        label="Đơn TB / khách"
                        value={customer_metrics.orders_per_customer.toFixed(2)}
                        icon={ShoppingCart}
                        color="blue"
                    />
                    <KpiCard
                        label="CLV trung bình"
                        value={fmt(customer_metrics.avg_clv)}
                        sub="Giá trị vòng đời"
                        icon={DollarSign}
                        color="amber"
                    />
                </div>
            </Section>

            {/* Sản phẩm */}
            <Section icon={Package} title="Sản phẩm & Hàng hóa">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ChartCard title="Top sản phẩm theo số lượng bán">
                        <ReactECharts
                            option={topQtyOption}
                            style={{ height: 300 }}
                        />
                    </ChartCard>
                    <ChartCard title="Top sản phẩm theo doanh thu">
                        <ReactECharts
                            option={topRevenueOption}
                            style={{ height: 300 }}
                        />
                    </ChartCard>
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
                        <Package className="h-10 w-10 text-md-primary/20" />
                    </div>
                </Card>
            </Section>

            {/* Giá & Chi phí */}
            <Section icon={Tag} title="Giá & Chi phí">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ChartCard title="Cơ cấu doanh thu">
                        <ReactECharts
                            option={costBreakdownOption}
                            style={{ height: 280 }}
                        />
                    </ChartCard>
                    <div className="grid grid-cols-2 content-start gap-4">
                        <Card>
                            <p className="text-xs text-md-on-surface-variant">
                                Tổng giảm giá đã cấp
                            </p>
                            <p className="mt-1 text-xl font-bold text-red-700">
                                {fmt(kpis.total_discount)}
                            </p>
                            <p className="text-xs text-md-on-surface-variant">
                                {pct(kpis.discount_rate)} doanh thu
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-md-on-surface-variant">
                                Tỷ lệ chiết khấu
                            </p>
                            <p className="mt-1 text-xl font-bold text-amber-500">
                                {pct(kpis.discount_rate)}
                            </p>
                            <p className="text-xs text-md-on-surface-variant">
                                Trung bình tất cả đơn
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-md-on-surface-variant">
                                Thuế VAT đã thu
                            </p>
                            <p className="mt-1 text-xl font-bold text-md-primary">
                                {fmt(kpis.total_tax)}
                            </p>
                            <p className="text-xs text-md-on-surface-variant">
                                10% VAT
                            </p>
                        </Card>
                        <Card>
                            <p className="text-xs text-md-on-surface-variant">
                                Phí vận chuyển thu được
                            </p>
                            <p className="mt-1 text-xl font-bold text-teal-600">
                                {fmt(kpis.total_shipping)}
                            </p>
                            <p className="text-xs text-md-on-surface-variant">
                                Thu từ khách hàng
                            </p>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* Địa lý */}
            <Section icon={MapPin} title="Địa lý">
                <ChartCard title="Đơn hàng & Doanh thu theo tỉnh/thành phố">
                    <ReactECharts
                        option={provinceOption}
                        style={{ height: 300 }}
                    />
                </ChartCard>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
            </Section>

            {/* Vận hành */}
            <Section icon={Clock} title="Vận hành">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Thời gian xử lý trung bình
                        </p>
                        <p className="mt-1 text-2xl font-bold text-md-primary">
                            {kpis.avg_fulfill_hours.toFixed(1)}h
                        </p>
                        <p className="text-xs text-md-on-surface-variant">
                            Từ tạo đơn đến thanh toán
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Tỷ lệ hủy đơn
                        </p>
                        <p className="mt-1 text-2xl font-bold text-red-700">
                            {pct(kpis.cancellation_rate)}
                        </p>
                        <p className="text-xs text-md-on-surface-variant">
                            {vi(kpis.canceled_orders)} đơn đã hủy
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Đơn đã xóa
                        </p>
                        <p className="mt-1 text-2xl font-bold text-md-on-surface-variant">
                            {vi(soft_deleted_count)}
                        </p>
                    </Card>
                    <Card>
                        <p className="text-xs text-md-on-surface-variant">
                            Đang xử lý
                        </p>
                        <p className="mt-1 text-2xl font-bold text-blue-600">
                            {vi(kpis.processing_orders)}
                        </p>
                    </Card>
                </div>
            </Section>
        </div>
    );
}

Metrics.layout = (page: ReactNode) => (
    <DashboardLayout title="Thống kê">{page}</DashboardLayout>
);
