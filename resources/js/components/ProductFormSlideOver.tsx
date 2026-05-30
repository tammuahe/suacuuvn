import { router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Loader2, Trash2 } from 'lucide-react';
import { store, update } from '@/routes/dashboard/products';

interface DashboardProduct {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    discount: string;
    discounted_price: string;
    stock_quantity: number;
    image_url: string;
    sku: string | null;
    is_active: boolean;
    created_at: string;
    deleted_at: string | null;
}

interface Props {
    open: boolean;
    onClose: () => void;
    product: DashboardProduct | null;
}

function slugify(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function initialFormData(product: DashboardProduct | null) {
    return {
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        discount: product ? String(Number(product.discount) * 100) : '0',
        stock_quantity: product ? String(product.stock_quantity ?? 0) : '0',
        image_url: product?.image_url ?? '',
        sku: product?.sku ?? '',
        is_active: product ? product.is_active : true,
    };
}

function ProductForm({
    product,
    onClose,
}: {
    product: DashboardProduct | null;
    onClose: () => void;
}) {
    const { data, setData, post, patch, processing, errors, transform } =
        useForm(initialFormData(product));

    transform((formData) => ({
        ...formData,
        price: Number(formData.price) || 0,
        discount: (Number(formData.discount) || 0) / 100,
        stock_quantity: Number(formData.stock_quantity) || 0,
    }));

    const isEdit = product !== null;

    const handleNameChange = (name: string) => {
        setData('name', name);

        if (
            !isEdit ||
            data.slug === '' ||
            data.slug === slugify(product?.name ?? '')
        ) {
            setData('slug', slugify(name));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && product) {
            patch(update.url(product.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(store.url(), {
                onSuccess: () => onClose(),
            });
        }
    };

    const handleDelete = () => {
        if (!product) {
            return;
        }

        if (confirm(`Xoá sản phẩm "${data.name}"?`)) {
            router.delete(`/dashboard/products/${product.id}`, {
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <>
            <motion.div
                className="fixed inset-0 z-50 bg-md-scrim/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            <motion.aside
                className="fixed top-0 right-0 z-50 flex h-full w-full max-w-lg flex-col bg-md-surface-container-lowest shadow-xl ring-1 ring-md-outline-variant/20"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{
                    type: 'spring',
                    damping: 30,
                    stiffness: 300,
                }}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-md-outline-variant/30 px-6 py-4">
                    <h2 className="text-base font-bold text-md-on-surface">
                        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <div className="flex items-center gap-1">
                        {isEdit && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="rounded-xl p-2 text-md-error transition-colors hover:bg-md-error-container"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="rounded-xl p-2 text-md-on-surface-variant hover:bg-md-surface-container"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col overflow-hidden"
                >
                    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                        {/* Name */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                Tên sản phẩm{' '}
                                <span className="text-md-error">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${errors.name ? 'border-md-error' : 'border-md-outline-variant/50 focus:border-md-primary'}`}
                                placeholder="Nhập tên sản phẩm..."
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-md-error">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) =>
                                    setData('slug', e.target.value)
                                }
                                className={`w-full rounded-xl border px-3 py-2 font-mono text-sm transition-colors outline-none ${errors.slug ? 'border-md-error' : 'border-md-outline-variant/50 focus:border-md-primary'}`}
                                placeholder="tu-dong-tao-tu-ten"
                            />
                            {errors.slug && (
                                <p className="mt-1 text-xs text-md-error">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                Mô tả
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                rows={3}
                                className="w-full resize-none rounded-xl border border-md-outline-variant/50 px-3 py-2 text-sm outline-none focus:border-md-primary"
                                placeholder="Mô tả ngắn về sản phẩm..."
                            />
                        </div>

                        {/* Price + Discount row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                    Giá (₫){' '}
                                    <span className="text-md-error">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="1000"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${errors.price ? 'border-md-error' : 'border-md-outline-variant/50 focus:border-md-primary'}`}
                                    placeholder="0"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-xs text-md-error">
                                        {errors.price}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                    Giảm giá (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.discount}
                                    onChange={(e) =>
                                        setData('discount', e.target.value)
                                    }
                                    className="w-full rounded-xl border border-md-outline-variant/50 px-3 py-2 text-sm outline-none focus:border-md-primary"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Stock + SKU row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                    Tồn kho
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.stock_quantity}
                                    onChange={(e) =>
                                        setData(
                                            'stock_quantity',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-md-outline-variant/50 px-3 py-2 text-sm outline-none focus:border-md-primary"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                    Mã SKU
                                </label>
                                <input
                                    type="text"
                                    value={data.sku}
                                    onChange={(e) =>
                                        setData('sku', e.target.value)
                                    }
                                    className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${errors.sku ? 'border-md-error' : 'border-md-outline-variant/50 focus:border-md-primary'}`}
                                    placeholder="SP001"
                                />
                                {errors.sku && (
                                    <p className="mt-1 text-xs text-md-error">
                                        {errors.sku}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                Hình ảnh URL
                            </label>
                            <input
                                type="url"
                                value={data.image_url}
                                onChange={(e) =>
                                    setData('image_url', e.target.value)
                                }
                                className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${errors.image_url ? 'border-md-error' : 'border-md-outline-variant/50 focus:border-md-primary'}`}
                                placeholder="https://..."
                            />
                            {errors.image_url && (
                                <p className="mt-1 text-xs text-md-error">
                                    {errors.image_url}
                                </p>
                            )}
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center justify-between rounded-xl border border-md-outline-variant/50 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-md-on-surface">
                                    Đang bán
                                </p>
                                <p className="text-xs text-md-on-surface-variant">
                                    Sản phẩm hiển thị trên cửa hàng
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setData('is_active', !data.is_active)
                                }
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${data.is_active ? 'bg-md-primary' : 'bg-md-surface-container-high'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${data.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 border-t border-md-outline-variant/30 bg-md-surface-container-lowest px-6 py-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-md-primary px-4 py-2.5 text-sm font-semibold text-md-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {processing && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                        </button>
                    </div>
                </form>
            </motion.aside>
        </>
    );
}

export default function ProductFormSlideOver({
    open,
    onClose,
    product,
}: Props) {
    return (
        <AnimatePresence>
            {open && (
                <ProductForm
                    key={product?.id ?? 'new'}
                    product={product}
                    onClose={onClose}
                />
            )}
        </AnimatePresence>
    );
}
