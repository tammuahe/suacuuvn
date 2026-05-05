import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import QuantityStepper from '@/components/QuantityStepper';
import { product as productRoute } from '@/routes/shopping';
import type { Product } from '@/stores/shoppingStore';
import { useShoppingStore } from '@/stores/shoppingStore';

export function formatVND(amount: number | string): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(Number(amount));
}

interface Props {
    product: Product;
}

export default function ProductCard({ product }: Props) {
    const { cartItems, setQuantity, removeItem } = useShoppingStore();
    const [pressed, setPressed] = useState(false);

    const cartItem = cartItems.find((i) => i.id === product.id);
    const qty = cartItem?.quantity ?? 0;
    const discountPct = Math.round(Number(product.discount) * 100);

    const handleAdd = () => {
        setPressed(true);
        setQuantity(product, qty + 1);
        setTimeout(() => setPressed(false), 250);
    };

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-md-surface-container-lowest shadow-sm ring-1 ring-md-outline-variant/40 transition-shadow duration-300 hover:shadow-lg">
            {/* Discount badge */}
            {discountPct > 0 && (
                <span className="absolute top-3 left-3 z-10 rounded-full bg-md-error px-2.5 py-0.5 text-xs font-semibold tracking-wide text-md-on-error shadow-sm">
                    -{discountPct}%
                </span>
            )}

            {/* Image — links to detail page */}
            <Link
                href={productRoute(product.id)}
                className="relative block aspect-square overflow-hidden bg-md-surface-container-low"
            >
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
            </Link>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 p-4">
                <Link href={productRoute(product.id)}>
                    <h3 className="line-clamp-3 text-sm leading-snug font-medium text-md-on-surface transition-colors hover:text-md-primary">
                        {product.name}
                    </h3>
                </Link>

                {/* Pricing */}
                <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-lg font-bold text-md-primary">
                        {formatVND(product.discounted_price)}
                    </span>
                    {discountPct > 0 && (
                        <span className="text-sm text-md-on-surface-variant line-through">
                            {formatVND(product.price)}
                        </span>
                    )}
                </div>

                {/* Add to cart / stepper */}
                {qty === 0 ? (
                    <button
                        onClick={handleAdd}
                        className={`mt-auto flex items-center justify-center gap-2 rounded-2xl bg-md-primary px-4 py-2.5 text-sm font-semibold text-md-on-primary transition-all duration-200 hover:opacity-90 active:scale-95 ${pressed ? 'scale-95' : ''}`}
                    >
                        <ShoppingCart className="h-4 w-4 shrink-0" />
                        Thêm vào giỏ
                    </button>
                ) : (
                    <div className="mt-auto">
                        <QuantityStepper
                            quantity={qty}
                            onChangeQuantity={(q: number) =>
                                setQuantity(product, q)
                            }
                            onRemove={() => removeItem(product.id)}
                            size="card"
                        />
                    </div>
                )}
            </div>
        </article>
    );
}
