import { router } from '@inertiajs/react';
import { X, ShoppingCart } from 'lucide-react';
import QuantityStepper from '@/components/QuantityStepper';
import { useShoppingStore } from '@/stores/shoppingStore';
import type { CartItem } from '@/stores/shoppingStore';

function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

export default function CartDrawer() {
    const { cartItems, cartOpen, setCartOpen, setQuantity, removeItem } =
        useShoppingStore();

    const handleCheckout = () => {
        setCartOpen(false);
        router.visit('/checkout');
    };

    const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => setCartOpen(false)}
                className={`fixed inset-0 z-40 bg-md-scrim/40 transition-opacity duration-300 ${
                    cartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            />

            {/* Drawer panel */}
            <aside
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-md-surface shadow-2xl transition-transform duration-300 ease-in-out ${
                    cartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-md-outline-variant px-5 py-4">
                    <h2 className="text-lg font-semibold text-md-on-surface">Giỏ hàng</h2>
                    <button
                        onClick={() => setCartOpen(false)}
                        className="rounded-full p-2 text-md-on-surface-variant hover:bg-md-surface-container transition-colors"
                        aria-label="Đóng giỏ hàng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-md-on-surface-variant">
                            <ShoppingCart className="h-16 w-16 opacity-20" />
                            <p className="text-sm">Giỏ hàng trống</p>
                        </div>
                    ) : (
                        cartItems.map((item : CartItem) => (
                            <div
                                key={item.id}
                                className="flex gap-3 rounded-2xl bg-md-surface-container p-3"
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="h-16 w-16 shrink-0 rounded-xl object-contain bg-md-surface-container-low"
                                />
                                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                                    <p className="text-xs font-medium text-md-on-surface line-clamp-2 leading-snug">
                                        {item.name}
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                        <p className="text-sm font-bold text-md-primary">
                                            {formatVND(item.price * item.quantity)}
                                        </p>
                                        {item.quantity > 1 && (
                                            <p className="text-xs text-md-on-surface-variant">
                                                ({formatVND(item.price)} × {item.quantity})
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-auto">
                                        <QuantityStepper
                                            quantity={item.quantity}
                                            onChangeQuantity={(q : number) =>
                                                setQuantity({ id: item.id } as any, q)
                                            }
                                            onRemove={() => removeItem(item.id)}
                                            size="drawer"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-md-outline-variant px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-md-on-surface-variant">Tổng cộng</span>
                            <span className="text-xl font-bold text-md-on-surface">
                                {formatVND(total)}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="w-full rounded-2xl bg-md-primary py-3 text-sm font-semibold text-md-on-primary hover:opacity-90 transition-opacity active:scale-95"
                        >
                            Đặt hàng
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
