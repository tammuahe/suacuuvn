import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CreditCard,
    FileText,
    Mail,
    MapPin,
    Package,
    Phone,
    Receipt,
    User,
    X,
    Loader2,
    Ban,
    CheckCircle2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import {
    show as showRoute,
    updateStatus as updateStatusRoute,
    markPaid,
} from '@/routes/dashboard/orders';
import type { Order } from '@/types/Order';

const STATUS_LABELS: Record<Order['status'], string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã huỷ',
};

const NEXT_STATUS: Partial<Record<Order['status'], Order['status'][]>> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
};

interface Props {
    orderId: number | null;
    open: boolean;
    onClose: () => void;
}

export default function OrderDetailSlideOver({
    orderId,
    open,
    onClose,
}: Props) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [payLoading, setPayLoading] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(false);

    useEffect(() => {
        if (open && orderId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(true);
            fetch(showRoute.url(orderId))
                .then((r) => r.json())
                .then((data) => setOrder(data.order))
                .finally(() => setLoading(false));
        } else if (!open) {
            setOrder(null);
            setCancelConfirm(false);
        }
    }, [open, orderId]);

    if (!open) {
        return null;
    }

    const handleStatusChange = (newStatus: Order['status']) => {
        setStatusLoading(true);
        router.patch(
            updateStatusRoute.url(orderId!),
            {
                status: newStatus,
            },
            {
                onFinish: () => setStatusLoading(false),
            },
        );
    };

    const handleMarkPaid = () => {
        setPayLoading(true);
        router.patch(
            markPaid.url(orderId!),
            {},
            {
                onFinish: () => setPayLoading(false),
            },
        );
    };

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
                                <h2 className="text-base font-bold text-md-on-surface">
                                    Chi tiết đơn hàng
                                </h2>
                                {order && <StatusBadge status={order.status} />}
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

                        {!loading && !order && (
                            <div className="flex flex-1 items-center justify-center">
                                <p className="text-sm text-md-on-surface-variant">
                                    Không thể tải chi tiết đơn hàng
                                </p>
                            </div>
                        )}

                        {!loading && order && (
                            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                {/* Reference & dates */}
                                <div className="flex items-center justify-between rounded-2xl border border-md-outline-variant/30 bg-md-surface-container-lowest p-4">
                                    <div>
                                        <p className="text-xs text-md-on-surface-variant">
                                            Mã đơn
                                        </p>
                                        <p className="mt-0.5 text-sm font-semibold text-md-on-surface">
                                            {order.reference}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-md-on-surface-variant">
                                            Ngày tạo
                                        </p>
                                        <p className="mt-0.5 text-sm font-medium text-md-on-surface">
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                {/* Status actions */}
                                {order.status !== 'cancelled' &&
                                    order.status !== 'delivered' && (
                                        <div>
                                            <p className="mb-2 text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                                Cập nhật trạng thái
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {(
                                                    NEXT_STATUS[order.status] ??
                                                    []
                                                ).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                s,
                                                            )
                                                        }
                                                        disabled={statusLoading}
                                                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                                                            s === 'cancelled'
                                                                ? 'bg-md-error-container text-md-on-error-container hover:bg-md-error-container/80'
                                                                : 'bg-md-primary-container text-md-on-primary-container hover:bg-md-primary-container/80'
                                                        }`}
                                                    >
                                                        {statusLoading && (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        )}
                                                        {s === 'cancelled'
                                                            ? 'Huỷ đơn'
                                                            : STATUS_LABELS[s]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                {/* Customer info */}
                                <section>
                                    <div className="mb-2 flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Khách hàng
                                        </p>
                                    </div>
                                    <div className="space-y-2 rounded-2xl border border-md-outline-variant/30 bg-md-surface-container-low p-4">
                                        <p className="text-sm font-semibold text-md-on-surface">
                                            {order.customer_name}
                                        </p>
                                        {order.customer_phone && (
                                            <div className="flex items-center gap-1.5 text-xs text-md-on-surface-variant">
                                                <Phone className="h-3 w-3" />
                                                {order.customer_phone}
                                            </div>
                                        )}
                                        {order.customer_email && (
                                            <div className="flex items-center gap-1.5 text-xs text-md-on-surface-variant">
                                                <Mail className="h-3 w-3" />
                                                {order.customer_email}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Shipping */}
                                {order.shipping_address?.address && (
                                    <section>
                                        <div className="mb-2 flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-md-primary" />
                                            <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                                Địa chỉ giao hàng
                                            </p>
                                        </div>
                                        <p className="text-sm text-md-on-surface">
                                            {order.shipping_address.address}
                                        </p>
                                    </section>
                                )}

                                {/* Items */}
                                <section>
                                    <div className="mb-2 flex items-center gap-2">
                                        <Package className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Sản phẩm ({order.items?.length ?? 0}
                                            )
                                        </p>
                                    </div>
                                    <div className="overflow-hidden rounded-2xl border border-md-outline-variant/30">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="bg-md-surface-container">
                                                    <th className="px-3 py-2 font-medium text-md-on-surface-variant">
                                                        Sản phẩm
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-medium text-md-on-surface-variant">
                                                        SL
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-medium text-md-on-surface-variant">
                                                        Đơn giá
                                                    </th>
                                                    <th className="px-3 py-2 text-right font-medium text-md-on-surface-variant">
                                                        Thành tiền
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-md-outline-variant/20">
                                                {order.items?.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-3 py-2 font-medium text-md-on-surface">
                                                            {item.product
                                                                ?.name ??
                                                                `SP #${item.product_id}`}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-md-on-surface-variant">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-md-on-surface-variant">
                                                            {Number(
                                                                item.unit_price,
                                                            ).toLocaleString(
                                                                'vi-VN',
                                                            )}{' '}
                                                            ₫
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium text-md-on-surface">
                                                            {Number(
                                                                item.subtotal,
                                                            ).toLocaleString(
                                                                'vi-VN',
                                                            )}{' '}
                                                            ₫
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* Financial summary */}
                                <section>
                                    <div className="mb-2 flex items-center gap-2">
                                        <Receipt className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Tài chính
                                        </p>
                                    </div>
                                    <div className="space-y-1.5 rounded-2xl border border-md-outline-variant/30 bg-md-surface-container-low p-4">
                                        {Number(order.discount) > 0 && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-md-on-surface-variant">
                                                    Giảm giá
                                                </span>
                                                <span className="text-red-700">
                                                    -
                                                    {Number(
                                                        order.discount,
                                                    ).toLocaleString(
                                                        'vi-VN',
                                                    )}{' '}
                                                    ₫
                                                </span>
                                            </div>
                                        )}
                                        {Number(order.tax) > 0 && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-md-on-surface-variant">
                                                    Thuế VAT
                                                </span>
                                                <span className="text-md-on-surface-variant">
                                                    {Number(
                                                        order.tax,
                                                    ).toLocaleString(
                                                        'vi-VN',
                                                    )}{' '}
                                                    ₫
                                                </span>
                                            </div>
                                        )}
                                        {Number(order.shipping) > 0 && (
                                            <div className="flex justify-between text-xs">
                                                <span className="text-md-on-surface-variant">
                                                    Vận chuyển
                                                </span>
                                                <span className="text-md-on-surface-variant">
                                                    {Number(
                                                        order.shipping,
                                                    ).toLocaleString(
                                                        'vi-VN',
                                                    )}{' '}
                                                    ₫
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-md-outline-variant/30 pt-2 text-sm">
                                            <span className="font-semibold text-md-on-surface">
                                                Tổng cộng
                                            </span>
                                            <span className="font-bold text-md-primary">
                                                {Number(
                                                    order.total,
                                                ).toLocaleString('vi-VN')}{' '}
                                                ₫
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* Payment */}
                                <section>
                                    <div className="mb-2 flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Thanh toán
                                        </p>
                                    </div>
                                    <div className="space-y-2 rounded-2xl border border-md-outline-variant/30 bg-md-surface-container-low p-4">
                                        {order.payment_method && (
                                            <p className="text-sm text-md-on-surface">
                                                {order.payment_method}
                                            </p>
                                        )}
                                        {order.payment_reference && (
                                            <p className="font-mono text-xs text-md-on-surface-variant">
                                                Ref: {order.payment_reference}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            {order.paid_at ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Đã thanh toán{' '}
                                                    {new Date(
                                                        order.paid_at,
                                                    ).toLocaleDateString(
                                                        'vi-VN',
                                                    )}
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                                                        Chưa thanh toán
                                                    </span>
                                                    <button
                                                        onClick={handleMarkPaid}
                                                        disabled={payLoading}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-md-outline-variant bg-md-surface-container-lowest px-2 py-0.5 text-xs font-semibold text-md-primary transition-colors hover:bg-md-primary-container"
                                                    >
                                                        {payLoading && (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        )}
                                                        Đánh dấu đã TT
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Notes */}
                                {order.notes && (
                                    <section>
                                        <div className="mb-2 flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5 text-md-primary" />
                                            <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                                Ghi chú
                                            </p>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap text-md-on-surface-variant">
                                            {order.notes}
                                        </p>
                                    </section>
                                )}

                                {/* Cancel order button */}
                                {order.status !== 'cancelled' &&
                                    order.status !== 'delivered' && (
                                        <div className="border-t border-md-outline-variant/30 pt-4">
                                            {cancelConfirm ? (
                                                <div className="space-y-2 rounded-2xl bg-md-error-container p-3">
                                                    <p className="text-xs font-semibold text-md-on-error-container">
                                                        Xác nhận huỷ đơn hàng?
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    'cancelled',
                                                                )
                                                            }
                                                            className="rounded-xl bg-md-error px-3 py-1.5 text-xs font-semibold text-md-on-error hover:opacity-90"
                                                        >
                                                            Xác nhận huỷ
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setCancelConfirm(
                                                                    false,
                                                                )
                                                            }
                                                            className="rounded-xl border border-md-outline-variant px-3 py-1.5 text-xs font-semibold text-md-on-surface-variant"
                                                        >
                                                            Giữ lại
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setCancelConfirm(true)
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-md-error-container px-3 py-2 text-xs font-semibold text-md-on-error-container transition-colors hover:bg-md-error-container/80"
                                                >
                                                    <Ban className="h-3.5 w-3.5" />
                                                    Huỷ đơn hàng
                                                </button>
                                            )}
                                        </div>
                                    )}
                            </div>
                        )}
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
