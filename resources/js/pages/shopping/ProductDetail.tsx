import { Link } from '@inertiajs/react';
import { ShoppingCart, ChevronLeft, ShieldCheck, Truck } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from '@/components/CartDrawer';
import { formatVND } from '@/components/ProductCard';
import QuantityStepper from '@/components/QuantityStepper';
import { shopping } from '@/routes';
import { useShoppingStore } from '@/stores/shoppingStore';
import type { Product } from '@/stores/shoppingStore';

interface Props {
    product: Product & { description?: string; detailed_description?: string };
}

const TRUST_BADGES = [
    { icon: ShieldCheck, label: 'Chính hãng 100%' },
    { icon: Truck, label: 'Giao hàng toàn quốc' },
];

export default function ProductDetail({ product }: Props) {
    const { cartItems, setQuantity, removeItem, setCartOpen } =
        useShoppingStore();
    const [pressed, setPressed] = useState(false);

    const cartItem = cartItems.find((i) => i.id === product.id);
    const qty = cartItem?.quantity ?? 0;
    const discountPct = Math.round(Number(product.discount) * 100);
    const savings = Number(product.price) - Number(product.discounted_price);

    const handleAdd = () => {
        setPressed(true);
        setQuantity(product, qty + 1);
        setTimeout(() => setPressed(false), 250);
    };

    return (
        <>
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                {/* Breadcrumb */}
                <Link
                    href={shopping()}
                    className="mb-8 inline-flex items-center gap-1 text-sm text-md-on-surface-variant transition-colors hover:text-md-primary"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại sản phẩm
                </Link>

                {/* Hero grid */}
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                    {/* Image */}
                    <div className="relative">
                        <div className="absolute inset-6 rounded-full bg-md-primary-container/60 blur-3xl" />
                        <div className="relative aspect-square overflow-hidden rounded-3xl bg-md-surface-container-low ring-1 ring-md-outline-variant/30">
                            {discountPct > 0 && (
                                <div className="absolute top-4 left-4 z-10 flex flex-col items-center rounded-2xl bg-md-error px-3 py-2 shadow-lg">
                                    <span className="text-lg leading-none font-black text-md-on-error">
                                        -{discountPct}%
                                    </span>
                                    <span className="text-[10px] font-semibold tracking-wider text-md-on-error/80 uppercase"></span>
                                </div>
                            )}
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-contain p-10 transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-6">
                        <h1 className="text-2xl leading-snug font-bold text-md-on-surface sm:text-3xl">
                            {product.name}
                        </h1>

                        {product.description && (
                            <p className="text-sm leading-relaxed text-md-on-surface-variant">
                                {product.description}
                            </p>
                        )}

                        {/* Pricing card */}
                        <div className="relative overflow-hidden rounded-3xl bg-md-primary p-5 shadow-lg shadow-md-primary/20">
                            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
                            <div className="absolute -right-2 -bottom-10 h-24 w-24 rounded-full bg-white/5" />
                            <div className="relative mt-1 flex items-baseline gap-3">
                                <span className="text-4xl font-black text-md-on-primary">
                                    {formatVND(product.discounted_price)}
                                </span>
                                {discountPct > 0 && (
                                    <span className="text-base text-md-on-primary/50 line-through">
                                        {formatVND(product.price)}
                                    </span>
                                )}
                            </div>
                            {discountPct > 0 && (
                                <div className="relative mt-2 inline-flex items-center rounded-full bg-md-on-primary/10 px-3 py-1">
                                    <span className="text-xs font-semibold text-md-on-primary">
                                        Tiết kiệm {formatVND(savings)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Cart action */}
                        {qty === 0 ? (
                            <button
                                onClick={handleAdd}
                                className={`flex items-center justify-center gap-3 rounded-2xl bg-md-primary-container px-6 py-4 text-base font-bold text-md-on-primary-container shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-95 active:scale-95 ${pressed ? 'scale-95' : ''}`}
                            >
                                <ShoppingCart className="h-5 w-5 shrink-0" />
                                Thêm vào giỏ hàng
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <QuantityStepper
                                    quantity={qty}
                                    onChangeQuantity={(q) =>
                                        setQuantity(product, q)
                                    }
                                    onRemove={() => removeItem(product.id)}
                                    size="detail"
                                />
                                <button
                                    onClick={() => setCartOpen(true)}
                                    className="w-full rounded-2xl bg-md-primary py-3.5 text-sm font-bold text-md-on-primary shadow-md shadow-md-primary/25 transition-all hover:opacity-90 active:scale-95"
                                >
                                    Đặt hàng ngay →
                                </button>
                            </div>
                        )}

                        {/* Trust badges */}
                        <div
                            className={`grid grid-cols-${TRUST_BADGES.length} between gap-2`}
                        >
                            {TRUST_BADGES.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-md-surface-container-low p-3 text-center ring-1 ring-md-outline-variant/40"
                                >
                                    <Icon className="h-5 w-5 text-md-primary" />
                                    <span className="text-[11px] leading-tight font-medium text-md-on-surface-variant">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed description */}
                {product.detailed_description && (
                    <section className="mt-12">
                        <div className="mb-8 flex items-center gap-4">
                            <h2 className="text-xl font-bold text-md-on-surface">
                                Mô tả chi tiết
                            </h2>
                            <div className="h-px flex-1 bg-md-outline-variant" />
                        </div>
                        <div className="rounded-3xl bg-md-surface-container-lowest p-6 ring-1 ring-md-outline-variant/40 sm:p-8">
                            <div className="space-y-4">
                                {product.detailed_description
                                    .split('\n')
                                    .filter(Boolean)
                                    .map((para, i) => (
                                        <p
                                            key={i}
                                            className="text-sm leading-7 text-md-on-surface-variant"
                                        >
                                            {para}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <CartDrawer />
        </>
    );
}
