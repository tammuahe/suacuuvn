import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    Package,
    MapPin,
    Phone,
    Mail,
    User,
    ChevronRight,
    ShoppingBag,
    Clock,
} from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import { shopping } from '@/routes';
import orderRoute from '@/routes/order';

interface Product {
    sku:string;
    name: string;
    slug: string;
    image_url: string;
    discounted_price: string;
}

interface OrderItem {
    unit_price: string;
    quantity: number;
    subtotal: string;
    product: Product;
}

interface ShippingAddress {
    address: string;
    province_code: number;
    district_code: number;
    ward_code: number;
}

export interface Order {
    reference: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    tax: string;
    shipping: string;
    discount: string;
    total: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string;
    shipping_address: ShippingAddress;
    notes: string | null;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

function formatVND(amount: string | number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(Number(amount));
}

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

const STATUS_MAP: Record<
    Order['status'],
    { label: string; color: string; bg: string; dot: string }
> = {
    pending: {
        label: 'Chờ xác nhận',
        color: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        dot: 'bg-amber-500',
    },
    processing: {
        label: 'Đang xử lý',
        color: 'text-blue-700 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        dot: 'bg-blue-500',
    },
    shipped: {
        label: 'Đang giao hàng',
        color: 'text-purple-700 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-950/40',
        dot: 'bg-purple-500',
    },
    delivered: {
        label: 'Đã giao hàng',
        color: 'text-green-700 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950/40',
        dot: 'bg-green-500',
    },
    cancelled: {
        label: 'Đã huỷ',
        color: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/40',
        dot: 'bg-red-500',
    },
};

export default function Success({ order }: Props) {
    const status = STATUS_MAP[order.status] ?? STATUS_MAP.processing;

    const subtotal = order.items.reduce(
        (sum, item) => sum + Number(item.subtotal),
        0,
    );
    const tax = Number(order.tax);
    const shipping = Number(order.shipping);
    const discount = Number(order.discount);

    return (
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
            {/* ── Success hero ── */}
            <div className="mb-10 flex flex-col items-center text-center">
                {/* Animated check ring */}
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-md-primary opacity-10" />
                    <span className="absolute inset-0 rounded-full bg-md-primary/10 ring-4 ring-md-primary/20" />
                    <CheckCircle2
                        className="relative h-10 w-10 text-md-primary"
                        strokeWidth={1.75}
                    />
                </div>

                <h1 className="text-2xl font-black tracking-tight text-md-on-surface sm:text-3xl">
                    Đặt hàng thành công!
                </h1>
                <p className="mt-2 text-sm text-md-on-surface-variant">
                    Cảm ơn bạn đã tin tưởng AAi Pharma.<br/>Vui lòng ghi lại mã đơn hàng dưới đây để có thể tra cứu tình trạng đơn hàng và yêu cầu hỗ trợ nếu cần thiết.
                </p>

                {/* Reference + status row */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <span className="rounded-full bg-md-surface-container px-4 py-1.5 font-mono text-sm font-semibold tracking-widest text-md-on-surface">
                        {order.reference}
                    </span>
                    <span
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.bg} ${status.color}`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                    </span>
                </div>
            </div>

            {/* ── Cards ── */}
            <div className="space-y-4">
                {/* Order items */}
                <section className="overflow-hidden rounded-3xl bg-md-surface-container-lowest ring-1 ring-md-outline-variant/40">
                    <div className="flex items-center gap-2 border-b border-md-outline-variant/30 px-6 py-4">
                        <Package className="h-4 w-4 text-md-primary" />
                        <h2 className="text-sm font-bold text-md-on-surface">
                            Sản phẩm ({order.items.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-md-outline-variant/20">
                        {order.items.map((item) => (
                            <div
                                key={item.product.sku}
                                className="flex items-center gap-4 px-6 py-4"
                            >
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-md-surface-container p-1">
                                    <img
                                        src={item.product.image_url}
                                        alt={item.product.name}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm leading-snug font-medium text-md-on-surface">
                                        {item.product.name}
                                    </p>
                                    <p className="mt-1 text-xs text-md-on-surface-variant">
                                        {formatVND(item.unit_price)} x{' '}
                                        {item.quantity}
                                    </p>
                                </div>
                                <p className="shrink-0 text-sm font-bold text-md-primary">
                                    {formatVND(item.subtotal)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Price breakdown */}
                    <div className="space-y-2 border-t border-md-outline-variant/30 bg-md-surface-container/40 px-6 py-4">
                        {[
                            { label: 'Tạm tính', value: subtotal },
                            {
                                label: 'Phí vận chuyển',
                                value: shipping,
                                free: shipping === 0,
                            },
                            { label: 'Thuế', value: tax, dash: tax === 0 },
                            ...(discount > 0
                                ? [
                                      {
                                          label: 'Giảm giá',
                                          value: -discount,
                                          negative: true,
                                      },
                                  ]
                                : []),
                        ].map(({ label, value, free, dash, negative }) => (
                            <div
                                key={label}
                                className="flex justify-between text-xs text-md-on-surface-variant"
                            >
                                <span>{label}</span>
                                <span
                                    className={
                                        free
                                            ? 'font-semibold text-md-primary'
                                            : negative
                                              ? 'font-semibold text-green-600'
                                              : ''
                                    }
                                >
                                    {free
                                        ? 'Miễn phí'
                                        : dash
                                          ? '—'
                                          : formatVND(Math.abs(value))}
                                </span>
                            </div>
                        ))}

                        <div className="flex items-baseline justify-between border-t border-md-outline-variant/30 pt-2">
                            <span className="text-sm font-semibold text-md-on-surface">
                                Tổng cộng
                            </span>
                            <span className="text-xl font-black text-md-primary">
                                {formatVND(order.total)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Customer & shipping info */}
                <section className="rounded-3xl bg-md-surface-container-lowest ring-1 ring-md-outline-variant/40">
                    <div className="flex items-center gap-2 border-b border-md-outline-variant/30 px-6 py-4">
                        <MapPin className="h-4 w-4 text-md-primary" />
                        <h2 className="text-sm font-bold text-md-on-surface">
                            Thông tin giao hàng
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
                        <InfoRow
                            icon={User}
                            label="Họ và tên"
                            value={order.customer_name}
                        />
                        <InfoRow
                            icon={Phone}
                            label="Số điện thoại"
                            value={order.customer_phone}
                        />
                        {order.customer_email && (
                            <InfoRow
                                icon={Mail}
                                label="Email"
                                value={order.customer_email}
                            />
                        )}
                        <InfoRow
                            icon={MapPin}
                            label="Địa chỉ"
                            value={order.shipping_address.address}
                            className="sm:col-span-2"
                        />
                    </div>
                </section>

                {/* Meta row */}
                <div className="flex items-center justify-between rounded-2xl bg-md-surface-container/60 px-5 py-3.5 text-xs text-md-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Đặt lúc {formatDate(order.created_at)}
                    </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                        onClick={() => router.visit(shopping().url)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-md-primary py-3.5 text-sm font-bold text-md-on-primary shadow-lg shadow-md-primary/20 transition-all hover:opacity-90 active:scale-95"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Tiếp tục mua hàng
                    </button>
                    <button
                        onClick={() =>
                            router.get(orderRoute.lookup(),{
                                orderRef: order.reference
                            })
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-md-surface-container px-5 py-3.5 text-sm font-semibold text-md-on-surface ring-1 ring-md-outline-variant/60 transition-all hover:bg-md-surface-container-high active:scale-95"
                    >
                        Xem đơn hàng
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </main>
    );
}



