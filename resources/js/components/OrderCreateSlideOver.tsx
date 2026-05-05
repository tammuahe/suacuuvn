import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    X,
    User,
    MapPin,
    FileText,
    ShoppingBag,
    Trash2,
    Search,
    Loader2,
    CreditCard,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { store } from '@/routes/dashboard/orders';
import type { Product } from '@/stores/shoppingStore';

interface LineItem {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Props {
    products: Product[];
    open: boolean;
    onClose: () => void;
}

export default function OrderCreateSlideOver({
    products,
    open,
    onClose,
}: Props) {
    const [search, setSearch] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [lines, setLines] = useState<LineItem[]>([]);

    const form = useForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        shipping_address: {
            address: '',
            province_code: null as number | null,
            district_code: null as number | null,
            ward_code: null as number | null,
        },
        payment_method: '',
        notes: '',
        items: [] as { product_id: number; quantity: number }[],
    });

    const filteredProducts = useMemo(() => {
        if (!search.trim()) {
            return products.slice(0, 20);
        }

        const q = search.toLowerCase();

        return products
            .filter(
                (p) => p.name.toLowerCase().includes(q) || p.slug.includes(q),
            )
            .slice(0, 20);
    }, [products, search]);

    const addProduct = (product: Product) => {
        const existing = lines.find((l) => l.product_id === product.id);

        if (existing) {
            setLines(
                lines.map((l) =>
                    l.product_id === product.id
                        ? {
                              ...l,
                              quantity: l.quantity + 1,
                              subtotal:
                                  Number(product.discounted_price) *
                                  (l.quantity + 1),
                          }
                        : l,
                ),
            );
        } else {
            setLines([
                ...lines,
                {
                    product_id: product.id,
                    product_name: product.name,
                    quantity: 1,
                    unit_price: Number(product.discounted_price),
                    subtotal: Number(product.discounted_price),
                },
            ]);
        }

        setSearch('');
    };

    const removeLine = (index: number) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const updateLineQty = (index: number, quantity: number) => {
        if (quantity < 1) {
            return;
        }

        setLines(
            lines.map((l, i) =>
                i === index
                    ? { ...l, quantity, subtotal: l.unit_price * quantity }
                    : l,
            ),
        );
    };

    const total = lines.reduce((sum, l) => sum + l.subtotal, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (lines.length === 0) {
            return;
        }

        form.setData(
            'items',
            lines.map((l) => ({
                product_id: l.product_id,
                quantity: l.quantity,
            })),
        );

        form.post(store.url(), {
            onSuccess: () => {
                setLines([]);
                form.reset();
                onClose();
            },
        });
    };

    return (
        <AnimatePresence>
            {open && (
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
                                Tạo đơn hàng mới
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 text-md-on-surface-variant hover:bg-md-surface-container"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 overflow-y-auto"
                        >
                            <div className="space-y-6 p-6">
                                {/* Customer info */}
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Khách hàng
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-md-on-surface-variant">
                                                Tên khách hàng{' '}
                                                <span className="text-md-error">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.data.customer_name}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'customer_name',
                                                        e.target.value,
                                                    )
                                                }
                                                className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${
                                                    form.errors.customer_name
                                                        ? 'border-md-error'
                                                        : 'border-md-outline-variant/50 focus:border-md-primary'
                                                }`}
                                                placeholder="Nguyễn Văn A"
                                            />
                                            {form.errors.customer_name && (
                                                <p className="mt-1 text-xs text-md-error">
                                                    {form.errors.customer_name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-md-on-surface-variant">
                                                    Điện thoại{' '}
                                                    <span className="text-md-error">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        form.data.customer_phone
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'customer_phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${
                                                        form.errors
                                                            .customer_phone
                                                            ? 'border-md-error'
                                                            : 'border-md-outline-variant/50 focus:border-md-primary'
                                                    }`}
                                                    placeholder="09xxxxxxxx"
                                                />
                                                {form.errors.customer_phone && (
                                                    <p className="mt-1 text-xs text-md-error">
                                                        {
                                                            form.errors
                                                                .customer_phone
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-md-on-surface-variant">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={
                                                        form.data.customer_email
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'customer_email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${
                                                        form.errors
                                                            .customer_email
                                                            ? 'border-md-error'
                                                            : 'border-md-outline-variant/50 focus:border-md-primary'
                                                    }`}
                                                    placeholder="email@example.com"
                                                />
                                                {form.errors.customer_email && (
                                                    <p className="mt-1 text-xs text-md-error">
                                                        {
                                                            form.errors
                                                                .customer_email
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Products */}
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <ShoppingBag className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Sản phẩm{' '}
                                            <span className="text-md-error">
                                                *
                                            </span>
                                        </p>
                                    </div>

                                    {/* Product search */}
                                    <div className="relative mb-3">
                                        <div className="flex items-center rounded-xl border border-md-outline-variant/50 bg-md-surface-container px-3 py-2">
                                            <Search className="h-4 w-4 text-md-on-surface-variant" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setShowProductSearch(true);
                                                }}
                                                onFocus={() =>
                                                    setShowProductSearch(true)
                                                }
                                                placeholder="Tìm sản phẩm..."
                                                className="ml-2 flex-1 bg-transparent text-sm outline-none placeholder:text-md-on-surface-variant/60"
                                            />
                                        </div>
                                        {showProductSearch &&
                                            filteredProducts.length > 0 && (
                                                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-md-outline-variant/30 bg-md-surface-container-lowest shadow-lg">
                                                    {filteredProducts.map(
                                                        (product) => (
                                                            <button
                                                                key={product.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    addProduct(
                                                                        product,
                                                                    )
                                                                }
                                                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-md-surface-container"
                                                            >
                                                                <span className="text-md-on-surface">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-md-primary">
                                                                    {Number(
                                                                        product.discounted_price,
                                                                    ).toLocaleString(
                                                                        'vi-VN',
                                                                    )}{' '}
                                                                    ₫
                                                                </span>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </div>

                                    {/* Selected items */}
                                    {lines.length > 0 && (
                                        <div className="overflow-hidden rounded-xl border border-md-outline-variant/30">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="bg-md-surface-container">
                                                        <th className="px-3 py-2 font-medium text-md-on-surface-variant">
                                                            Sản phẩm
                                                        </th>
                                                        <th className="px-3 py-2 text-center font-medium text-md-on-surface-variant">
                                                            SL
                                                        </th>
                                                        <th className="px-3 py-2 text-right font-medium text-md-on-surface-variant">
                                                            Đơn giá
                                                        </th>
                                                        <th className="px-3 py-2 text-right font-medium text-md-on-surface-variant">
                                                            TT
                                                        </th>
                                                        <th className="w-10 px-3 py-2" />
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-md-outline-variant/20">
                                                    {lines.map((line, i) => (
                                                        <tr
                                                            key={
                                                                line.product_id
                                                            }
                                                        >
                                                            <td className="px-3 py-2 font-medium text-md-on-surface">
                                                                {
                                                                    line.product_name
                                                                }
                                                            </td>
                                                            <td className="px-3 py-2 text-center">
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        line.quantity
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateLineQty(
                                                                            i,
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                                10,
                                                                            ) ||
                                                                                1,
                                                                        )
                                                                    }
                                                                    className="w-14 rounded-lg border border-md-outline-variant/30 px-2 py-1 text-center text-xs outline-none focus:border-md-primary"
                                                                    min="1"
                                                                    max="99"
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-md-on-surface-variant">
                                                                {line.unit_price.toLocaleString(
                                                                    'vi-VN',
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-medium text-md-on-surface">
                                                                {line.subtotal.toLocaleString(
                                                                    'vi-VN',
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeLine(
                                                                            i,
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-1 text-md-on-surface-variant transition-colors hover:bg-md-error-container hover:text-md-error"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {form.errors.items && (
                                        <p className="mt-1 text-xs text-md-error">
                                            {form.errors.items}
                                        </p>
                                    )}
                                </section>

                                {/* Shipping */}
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Địa chỉ giao hàng
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        value={
                                            form.data.shipping_address.address
                                        }
                                        onChange={(e) =>
                                            form.setData('shipping_address', {
                                                ...form.data.shipping_address,
                                                address: e.target.value,
                                            })
                                        }
                                        className={`w-full rounded-xl border px-3 py-2 text-sm transition-colors outline-none ${
                                            form.errors[
                                                'shipping_address.address'
                                            ]
                                                ? 'border-md-error'
                                                : 'border-md-outline-variant/50 focus:border-md-primary'
                                        }`}
                                        placeholder="Số nhà, đường, phường..."
                                    />
                                    {form.errors[
                                        'shipping_address.address'
                                    ] && (
                                        <p className="mt-1 text-xs text-md-error">
                                            {
                                                form.errors[
                                                    'shipping_address.address'
                                                ]
                                            }
                                        </p>
                                    )}
                                </section>

                                {/* Payment method */}
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Phương thức thanh toán
                                        </p>
                                    </div>
                                    <select
                                        value={form.data.payment_method}
                                        onChange={(e) =>
                                            form.setData(
                                                'payment_method',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-md-primary"
                                    >
                                        <option value="">
                                            Chọn phương thức...
                                        </option>
                                        <option value="COD">
                                            COD (Thanh toán khi nhận hàng)
                                        </option>
                                        <option value="Bank Transfer">
                                            Chuyển khoản ngân hàng
                                        </option>
                                        <option value="Cash">Tiền mặt</option>
                                        <option value="Momo">Ví Momo</option>
                                    </select>
                                </section>

                                {/* Notes */}
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-md-primary" />
                                        <p className="text-xs font-semibold tracking-wide text-md-on-surface-variant uppercase">
                                            Ghi chú
                                        </p>
                                    </div>
                                    <textarea
                                        value={form.data.notes}
                                        onChange={(e) =>
                                            form.setData(
                                                'notes',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-xl border border-md-outline-variant/50 px-3 py-2 text-sm outline-none focus:border-md-primary"
                                        placeholder="Ghi chú đơn hàng..."
                                    />
                                </section>
                            </div>

                            {/* Footer with total and submit */}
                            <div className="sticky bottom-0 border-t border-md-outline-variant/30 bg-md-surface-container-lowest px-6 py-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm text-md-on-surface-variant">
                                        {lines.length} sản phẩm
                                    </span>
                                    <div className="text-right">
                                        <p className="text-xs text-md-on-surface-variant">
                                            Tổng cộng
                                        </p>
                                        <p className="text-lg font-bold text-md-primary">
                                            {total.toLocaleString('vi-VN')} ₫
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={
                                        form.processing || lines.length === 0
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-md-primary px-4 py-2.5 text-sm font-semibold text-md-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                                >
                                    {form.processing && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Tạo đơn hàng
                                </button>
                            </div>
                        </form>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
