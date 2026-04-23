import { router, usePage } from '@inertiajs/react';
import {
    Search,
    PackageSearch,
    Hash,
    Phone,
    Package,
    MapPin,
    User,
    Mail,
} from 'lucide-react';
import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import order from '@/routes/order';
import { useAddressStore } from '@/stores/addressStore';
import type { Province } from '@/stores/addressStore';
import type { Order, ShippingAddress } from '@/types/Order';

interface PageProps extends Record<string, unknown> {
    orderRef?: string;
    tel?: string;
    orders: Order[];
}



function resolveAddress(
    addr: ShippingAddress,
    provinces: Province[],
): string {
    const province = provinces.find((p) => p.code === addr.province_code);
    const district = province?.districts.find((d) => d.code === addr.district_code);
    const ward = district?.wards.find((w) => w.code === addr.ward_code);

    return [ward?.name, district?.name, province?.name]
        .filter(Boolean)
        .join(', ');
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-md-on-surface-variant" />
            <div className="flex flex-1 flex-wrap items-baseline gap-x-2">
                <span className="text-xs text-md-on-surface-variant">
                    {label}
                </span>
                <span className="text-sm font-medium text-md-on-surface">
                    {value}
                </span>
            </div>
        </div>
    );
}

function OrderCard({
    order,
    searchedRef,
    searchedTel,
    address
}: {
    order: Order;
    searchedRef?: string;
    searchedTel?: string;
    address: string
}) {
    const displayPhone =
        searchedTel && !searchedRef ? searchedTel : order.customer_phone;
    const displayRef = searchedRef && searchedRef !== 'ORD-'
        ? searchedRef
        : order.reference;  

    return (
        <div className="overflow-hidden rounded-3xl bg-md-surface-container-lowest ring-1 ring-md-outline-variant/40">
            <div className="flex items-center justify-between gap-3 border-b border-md-outline-variant/40 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-md-primary-container">
                        <Package className="h-4 w-4 text-md-on-primary-container" />
                    </div>
                    <p className="font-mono text-sm font-bold text-md-on-surface">
                        {displayRef}
                    </p>
                </div>
                <StatusBadge status={order.status} />
            </div>

            <div className="space-y-3 px-5 py-4">
                <InfoRow
                    icon={User}
                    label="Người nhận"
                    value={order.customer_name}
                />
                {displayPhone && (
                    <InfoRow
                        icon={Phone}
                        label="Điện thoại"
                        value={displayPhone}
                    />
                )}
                {order.customer_email && (
                    <InfoRow
                        icon={Mail}
                        label="Email"
                        value={order.customer_email}
                    />
                )}
                {address && (
                    <InfoRow icon={MapPin} label="Địa chỉ" value={address} />
                )}
            </div>
        </div>
    );
}

export default function OrderLookup() {
    const {
        orderRef: initOrderRef,
        tel: initTel,
        orders,
    } = usePage<PageProps>().props;

    const [orderRef, setOrderRef] = useState(initOrderRef ?? '');
    const [tel, setTel] = useState(initTel ?? '');

    const hasSearched = initOrderRef !== undefined || initTel !== undefined;

    const handleSearch = (e: React.SubmitEvent) => {
        e.preventDefault();
        const refValue = orderRef.trim();
        router.get(
            order.lookup(),
            {
                orderRef: refValue && refValue !== 'ORD-' ? refValue : undefined,
                tel: tel.trim() || undefined,
            },
            { preserveState: true },
        );
    };

    const { provinces } = useAddressStore();

    return (
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-md-primary-container">
                    <PackageSearch className="h-7 w-7 text-md-on-primary-container" />
                </div>
                <h1 className="text-2xl font-black text-md-on-surface sm:text-3xl">
                    Tra cứu đơn hàng
                </h1>
                <p className="mt-1.5 text-sm text-md-on-surface-variant">
                    Nhập mã đơn hàng hoặc số điện thoại để xem trạng thái
                </p>
            </div>

            {/* Search form */}
            <section className="rounded-3xl bg-md-surface-container-lowest p-6 ring-1 ring-md-outline-variant/40">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl border-2 border-md-outline-variant bg-md-surface-container-lowest px-4 py-3 transition-colors focus-within:border-md-primary">
                        <Hash className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                        <span className="text-sm font-medium text-md-on-surface-variant">
                            ORD-
                        </span>
                        <input
                            type="text"
                            name="order_ref"
                            placeholder="20240001"
                            value={
                                orderRef.startsWith('ORD-')
                                    ? orderRef.slice(4)
                                    : orderRef
                            }
                            onChange={(e) =>
                                setOrderRef(
                                    'ORD-' +
                                        e.target.value.replace(/^ORD-/, ''),
                                )
                            }
                            className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-md-on-surface-variant">
                        <div className="h-px flex-1 bg-md-outline-variant" />
                        <span>hoặc</span>
                        <div className="h-px flex-1 bg-md-outline-variant" />
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border-2 border-md-outline-variant bg-md-surface-container-lowest px-4 py-3 transition-colors focus-within:border-md-primary">
                        <Phone className="h-4 w-4 shrink-0 text-md-on-surface-variant" />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Số điện thoại đặt hàng"
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!orderRef.trim() && !tel.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-md-primary py-3.5 text-sm font-bold text-md-on-primary shadow-md shadow-md-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                    >
                        <Search className="h-4 w-4" />
                        Tra cứu
                    </button>
                </form>
            </section>

            {/* Results */}
            {hasSearched && (
                <div className="mt-6">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-3xl bg-md-surface-container-lowest py-12 text-center ring-1 ring-md-outline-variant/40">
                            <Package className="h-12 w-12 text-md-on-surface-variant opacity-20" />
                            <p className="text-sm font-medium text-md-on-surface-variant">
                                Không tìm thấy đơn hàng nào
                            </p>
                            <p className="text-xs text-md-on-surface-variant/60">
                                Kiểm tra lại mã đơn hoặc số điện thoại
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="px-1 text-xs text-md-on-surface-variant">
                                Tìm thấy {orders.length} đơn hàng
                            </p>
                            {orders.map((order) => (
                                <OrderCard
                                    key={order.reference}
                                    order={order}
                                    searchedRef={orderRef}
                                    searchedTel={tel}
                                    address={resolveAddress(order.shipping_address, provinces)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
