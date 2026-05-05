import { CiDeliveryTruck } from 'react-icons/ci';
import { GiSheep } from 'react-icons/gi';
import { RiCustomerService2Fill } from 'react-icons/ri';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/stores/shoppingStore';

interface Props {
    products: Product[];
}

const TRUST_ITEMS = [
    {
        icon: <GiSheep size={28} color="rgb(71 93 146)" />,
        title: 'Sữa cừu nhập khẩu',
        body: 'Dinh dưỡng vượt trội, hỗ trợ hệ tiêu hóa',
    },
    {
        icon: <CiDeliveryTruck size={28} color="rgb(71 93 146)" />,
        title: 'Giao hàng toàn quốc',
        body: 'Đóng gói kỹ lưỡng, giao nhanh 2-4 ngày',
    },
    {
        icon: <RiCustomerService2Fill size={28} color="rgb(71 93 146)" />,
        title: 'Hỗ trợ khách hàng',
        body: 'Tư vấn và hướng dẫn sử dụng tận tình',
    },
];

export default function Shopping({ products }: Props) {
    return (
        <>
            {/* ── Hero ── */}
            <div className="relative overflow-hidden bg-md-primary">
                <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10" />
                <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" />
                <div className="absolute top-1/2 right-1/3 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5" />

                <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-14">
                    <p className="mb-2 text-xs font-bold tracking-widest text-md-on-primary/50 uppercase">
                        AAI Pharma
                    </p>
                    <h1 className="text-3xl font-black text-md-on-primary sm:text-4xl">
                        Sữa Cừu Organic
                    </h1>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-md-on-primary/70">
                        Dòng sản phẩm dinh dưỡng cao cấp từ sữa cừu hữu cơ —
                        thuần khiết, an toàn, tốt cho sức khoẻ cả gia đình.
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                {/* Section header */}
                <div className="mb-6 flex items-center gap-4">
                    <h2 className="shrink-0 text-lg font-bold text-md-on-surface">
                        Sản phẩm
                    </h2>
                    <div className="h-px flex-1 bg-md-outline-variant" />
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Trust strip */}
                <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {TRUST_ITEMS.map(({ icon, title, body }) => (
                        <div
                            key={title}
                            className="flex items-center gap-4 rounded-2xl bg-md-surface-container-low p-4 ring-1 ring-md-outline-variant/40"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-md-primary-container">
                                {icon}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-md-on-surface">
                                    {title}
                                </p>
                                <p className="text-xs leading-relaxed text-md-on-surface-variant">
                                    {body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <CartDrawer />
        </>
    );
}
