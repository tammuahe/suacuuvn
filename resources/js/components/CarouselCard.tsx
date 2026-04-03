interface product {
    id: number,
    name: string,
    price: number,
    discount: number,
    img: string
}

type prop = {
    product: product
}

export function CarouselCard({ product }: prop) {
  const formatPrice = (v: number) =>
    v.toLocaleString("vi-VN") + " VND";

  const discountedPrice = Math.round(
    product.price * (1 - product.discount)
  );

  return (
    <div className="bg-md-surface rounded-2xl p-3 flex flex-col h-full transition hover:shadow-md hover:-translate-y-1 cursor-pointer border border-md-outline-variant">

      {/* Image */}
      <div className="relative bg-md-surface-container rounded-xl h-40 flex items-center justify-center overflow-hidden">
        <img
          src={product.img}
          className="h-full object-contain transition duration-300 hover:scale-105"
        />

        {/* Discount badge */}
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-semibold px-2 py-1 rounded-md">
          -{Math.round(product.discount * 100)}%
        </span>
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-col flex-1">

        {/* Title */}
        <h3 className="text-sm font-medium text-md-on-surface line-clamp-2 min-h-10">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="mt-2 flex items-end gap-2">
          <span className="text-red-600 font-semibold text-base">
            {formatPrice(discountedPrice)}
          </span>

          <span className="text-md-on-surface-variant line-through text-xs">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Button */}
        <button className="mt-3 text-xs border border-md-outline rounded-lg py-2 hover:bg-md-surface-container transition">
          Mua ngay
        </button>
      </div>
    </div>
  );
}
