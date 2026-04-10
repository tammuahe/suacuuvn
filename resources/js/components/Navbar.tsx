import { Link, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { shopping, welcome } from '@/routes';
import { useShoppingStore } from '@/stores/shoppingStore';

export default function Navbar() {
    const { cartItems, setCartOpen } = useShoppingStore();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, []);
    const totalItems = cartItems.length;
    const count = mounted ? totalItems : 0;
    const { url } = usePage();
    const showingRoutes = ['/products', '/checkout', '/product'];

    const showCart = showingRoutes.some(
        (path) => url === path || url.startsWith(path + '/'),
    );

    return (
        <nav className="sticky top-0 z-50 flex h-16 items-center border-b-2 border-md-outline bg-md-background font-semibold">
            <div className="mx-4 my-2 inline">
                <a href={welcome().url}>
                    <img src="/logo_cropped.png" className="w-8" alt="Logo" />
                </a>
            </div>
            <div className="self-stretch border-l-2 border-md-outline" />

            <div className="mx-8 space-x-12">
                <Link href={welcome()} className="text-md-on-primary-container">
                    Trang chủ
                </Link>
                <Link
                    href={`${welcome().url}#about`}
                    className="text-md-on-primary-container"
                >
                    Về chúng tôi
                </Link>
                <Link
                    href={shopping()}
                    className="text-md-on-primary-container"
                >
                    Mua hàng
                </Link>
            </div>

            {/* Cart icon with badge */}
            {showCart && (
                <button
                    onClick={() => setCartOpen(true)}
                    className="relative mr-8 ml-auto rounded-full p-2 transition-colors hover:bg-md-surface-container"
                    aria-label="Mở giỏ hàng"
                >
                    <ShoppingCart className="h-5 w-5" color="#001A41" />
                    {count > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-md-error text-[10px] font-bold text-md-on-error">
                            {count > 99 ? '99+' : count}
                        </span>
                    )}
                </button>
            )}
        </nav>
    );
}
