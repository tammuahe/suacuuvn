import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import { Product } from '@/stores/shoppingStore';

interface Props {
    products: Product[];
}

export default function Shopping({ products }: Props) {
    return (
        <>
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-md-on-surface">Sản phẩm</h1>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </main>
            <CartDrawer />
        </>
    );
}
