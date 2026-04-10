import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    discount: number;
    image_url: string;
    quantity: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    discount: string;
    image_url: string;
    discounted_price: string;
}

interface CartState {
    cartItems: CartItem[];
    cartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    setQuantity: (product: Product, newQuantity: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
}

export const useShoppingStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            cartOpen: false,

            setCartOpen: (open) => set({ cartOpen: open }),

            setQuantity: (product, newQuantity) => {
                const items = get().cartItems;
                const existing = items.find((i) => i.id === product.id);

                if (existing) {
                    if (newQuantity <= 0) {
                        set({ cartItems: items.filter((i) => i.id !== product.id) });

                        return;
                    }

                    set({
                        cartItems: items.map((i) =>
                            i.id === product.id ? { ...i, quantity: newQuantity } : i,
                        ),
                    });
                } else {
                    if (newQuantity <= 0) {
return;
}

                    set({
                        cartItems: [
                            ...items,
                            {
                                id: product.id,
                                name: product.name,
                                price: Number(product.discounted_price || product.price),
                                discount: Number(product.discount),
                                image_url: product.image_url,
                                quantity: newQuantity,
                            },
                        ],
                    });
                }
            },

            removeItem: (id) =>
                set({ cartItems: get().cartItems.filter((i) => i.id !== id) }),

            clearCart: () => set({ cartItems: [] }),

        }),
        {
            name: 'cart',
            partialize: (state) => ({ cartItems: state.cartItems }),
        },
    ),
);
