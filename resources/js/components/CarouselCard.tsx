import { router } from '@inertiajs/react';
import { shopping } from '@/routes';

interface product {
    id: number;
    name: string;
    price: number;
    discount: number;
    img: string;
}

type prop = {
    product: product;
};

export function CarouselCard({ product }: prop) {
    const formatPrice = (v: number) => v.toLocaleString('vi-VN') + ' VND';

    const discountedPrice = Math.round(product.price * (1 - product.discount));

    return (
        <div className="flex h-full cursor-pointer flex-col rounded-2xl border border-md-outline-variant bg-md-surface p-3 transition hover:-translate-y-1 hover:shadow-md">
            {/* Image */}
            <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-md-surface-container">
                <img
                    src={product.img}
                    className="h-full object-contain transition duration-300 hover:scale-105"
                />

                {/* Discount badge */}
                <span className="absolute top-2 left-2 rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white">
                    -{Math.round(product.discount * 100)}%
                </span>
            </div>

            {/* Content */}
            <div className="mt-3 flex flex-1 flex-col">
                {/* Title */}
                <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-md-on-surface">
                    {product.name}
                </h3>

                {/* Prices */}
                <div className="mt-2 flex items-end gap-2">
                    <span className="text-base font-semibold text-red-600">
                        {formatPrice(discountedPrice)}
                    </span>

                    <span className="text-xs text-md-on-surface-variant line-through">
                        {formatPrice(product.price)}
                    </span>
                </div>

                {/* Button */}
                <button
                    onClick={() => {
                        router.get(shopping());
                    }}
                    className="mt-3 rounded-lg border border-md-outline py-2 text-xs transition hover:bg-md-surface-container"
                >
                    Mua ngay
                </button>
            </div>
        </div>
    );
}
