import { Link } from '@inertiajs/react';
import { ShoppingCart, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import CartDrawer from '@/components/CartDrawer';
import { formatVND } from '@/components/ProductCard';
import QuantityStepper from '@/components/QuantityStepper';
import { shopping } from '@/routes';
import { useShoppingStore } from '@/stores/shoppingStore';
import type { Product} from '@/stores/shoppingStore';

interface Props {
    product: Product & { description?: string };
}

export default function ProductDetail({ product }: Props) {
    const { cartItems, setQuantity, removeItem, setCartOpen } = useShoppingStore();
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
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {/* Breadcrumb */}
                <Link
                    href={shopping()}
                    className="inline-flex items-center gap-1 text-sm text-md-on-surface-variant hover:text-md-primary transition-colors mb-6"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại sản phẩm
                </Link>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Image */}
                    <div className="relative rounded-3xl bg-md-surface-container-low overflow-hidden aspect-square">
                        {discountPct > 0 && (
                            <span className="absolute top-4 left-4 z-10 rounded-full bg-md-error px-3 py-1 text-sm font-semibold text-md-on-error shadow-sm">
                                -{discountPct}%
                            </span>
                        )}
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain p-8"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-5">
                        <h1 className="text-2xl font-bold text-md-on-surface leading-snug">
                            {product.name}
                        </h1>

                        {/* Pricing block */}
                        <div className="rounded-2xl bg-md-surface-container p-4 space-y-1">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-md-primary">
                                    {formatVND(product.discounted_price)}
                                </span>
                                {discountPct > 0 && (
                                    <span className="text-base text-md-on-surface-variant line-through">
                                        {formatVND(product.price)}
                                    </span>
                                )}
                            </div>
                            {discountPct > 0 && (
                                <p className="text-sm text-md-secondary font-medium">
                                    Tiết kiệm {formatVND(savings)}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-sm text-md-on-surface-variant leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        {/* Cart action */}
                        {qty === 0 ? (
                            <button
                                onClick={handleAdd}
                                className={`flex items-center justify-center gap-2 rounded-2xl bg-md-primary px-6 py-3.5 text-base font-semibold text-md-on-primary transition-all duration-200 hover:opacity-90 active:scale-95 ${pressed ? 'scale-95' : ''}`}
                            >
                                <ShoppingCart className="h-5 w-5 shrink-0" />
                                Thêm vào giỏ hàng
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <QuantityStepper
                                    quantity={qty}
                                    onChangeQuantity={(q) => setQuantity(product, q)}
                                    onRemove={() => removeItem(product.id)}
                                    size="card"
                                />
                                <button
                                    onClick={() => setCartOpen(true)}
                                    className="w-full rounded-2xl border-2 border-md-primary px-6 py-3 text-sm font-semibold text-md-primary hover:bg-md-primary-container transition-colors"
                                >
                                    Xem giỏ hàng ({qty})
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <CartDrawer />
        </>
    );
}
