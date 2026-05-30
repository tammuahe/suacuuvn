import { Link, useForm, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import {
    Package,
    Plus,
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    X,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import ProductFormSlideOver from '@/components/ProductFormSlideOver';
import DashboardLayout from '@/layouts/DashboardLayout';
import { products as productsRoute } from '@/routes/dashboard';

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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedProducts {
    data: DashboardProduct[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
}

interface ProductsProps {
    products: PaginatedProducts;
    status: string | null;
    search: string | null;
    sort: string;
    direction: string;
}

const STATUSES: { key: string; label: string }[] = [
    { key: '', label: 'Tất cả' },
    { key: 'active', label: 'Đang bán' },
    { key: 'inactive', label: 'Ngừng bán' },
];

function vi(n: number) {
    return n.toLocaleString('vi-VN');
}

export default function Products() {
    const { products, status, search, sort, direction } = usePage<{
        props: ProductsProps;
    }>().props as unknown as ProductsProps;

    const [formOpen, setFormOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<DashboardProduct | null>(
        null,
    );
    const [searchInput, setSearchInput] = useState(search ?? '');

    const deleteForm = useForm({});

    const buildQuery = (overrides: Record<string, string | undefined>) => {
        const params = new URLSearchParams();
        const current: Record<string, string> = {
            status: status ?? '',
            search: search ?? '',
            ...Object.fromEntries(
                Object.entries(overrides).map(([k, v]) => [k, v ?? '']),
            ),
        };
        Object.entries(current).forEach(([k, v]) => {
            if (v) {
                params.set(k, v);
            }
        });

        return `?${params.toString()}`;
    };

    const handleSearch = () => {
        const params = new URLSearchParams();

        if (status) {
            params.set('status', status);
        }

        if (searchInput.trim()) {
            params.set('search', searchInput.trim());
        }

        const qs = params.toString();

        router.visit(productsRoute.url() + (qs ? `?${qs}` : ''));
    };

    const handleSort = (column: string) => {
        const newDir = sort === column && direction === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams();

        if (status) {
            params.set('status', status);
        }

        if (search) {
            params.set('search', search);
        }

        params.set('sort', column);
        params.set('direction', newDir);
        window.location.href = `${productsRoute.url()}?${params.toString()}`;
    };

    const handleEdit = (product: DashboardProduct) => {
        setEditProduct(product);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setEditProduct(null);
        setFormOpen(true);
    };

    const handleDelete = (product: DashboardProduct) => {
        if (confirm(`Xoá sản phẩm "${product.name}"?`)) {
            deleteForm.delete(productsRoute.url() + `/${product.id}`);
        }
    };

    const hasFilters = !!(status || search);

    return (
        <div className="space-y-6">
            {/* Actions bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {STATUSES.map((s) => {
                        const isActive =
                            (s.key === '' && !status) || s.key === status;
                        const href =
                            s.key === ''
                                ? buildQuery({ status: undefined })
                                : buildQuery({ status: s.key });

                        return (
                            <Link
                                key={s.key}
                                href={`${productsRoute.url()}${href}`}
                                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-md-primary text-md-on-primary'
                                        : 'bg-md-surface-container text-md-on-surface-variant hover:bg-md-surface-container-high'
                                }`}
                            >
                                {s.label}
                            </Link>
                        );
                    })}
                </div>

                <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-md-primary px-3 py-2 text-xs font-semibold text-md-on-primary transition-opacity hover:opacity-90"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm sản phẩm
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        placeholder="Tìm theo tên sản phẩm, SKU..."
                        className="w-full rounded-xl border border-md-outline-variant/50 bg-md-surface-container-lowest py-2 pr-4 pl-9 text-sm outline-none placeholder:text-md-on-surface-variant/60 focus:border-md-primary"
                    />
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-md-on-surface-variant" />
                </div>
                {hasFilters && (
                    <Link
                        href={productsRoute.url()}
                        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-md-error transition-colors hover:bg-md-error-container"
                    >
                        <X className="h-3.5 w-3.5" />
                        Xoá lọc
                    </Link>
                )}
            </div>

            {/* Products table */}
            <div className="overflow-hidden rounded-2xl border border-md-outline-variant/40 bg-md-surface-container-lowest shadow-sm">
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16">
                        <Package className="h-12 w-12 text-md-outline-variant/40" />
                        <p className="mt-4 text-sm font-medium text-md-on-surface">
                            {hasFilters
                                ? 'Không tìm thấy sản phẩm nào'
                                : 'Chưa có sản phẩm nào'}
                        </p>
                        <p className="mt-1 text-xs text-md-on-surface-variant">
                            {hasFilters
                                ? 'Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm'
                                : 'Sản phẩm sẽ xuất hiện tại đây sau khi được tạo'}
                        </p>
                        {!hasFilters && (
                            <button
                                onClick={handleCreate}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-md-primary px-4 py-2 text-sm font-semibold text-md-on-primary hover:opacity-90"
                            >
                                <Plus className="h-4 w-4" />
                                Tạo sản phẩm đầu tiên
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-md-outline-variant/30 bg-md-surface-container/50">
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('name')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Tên sản phẩm
                                                {sort === 'name' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                            SKU
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('price')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Giá
                                                {sort === 'price' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                            Giảm giá
                                        </th>
                                        <th className="px-5 py-3">
                                            <button
                                                onClick={() =>
                                                    handleSort('stock_quantity')
                                                }
                                                className="flex items-center gap-1 text-xs font-semibold text-md-on-surface-variant hover:text-md-on-surface"
                                            >
                                                Tồn kho
                                                {sort === 'stock_quantity' && (
                                                    <ArrowUpDown className="h-3 w-3 text-md-primary" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-5 py-3 text-xs font-semibold text-md-on-surface-variant">
                                            Trạng thái
                                        </th>
                                        <th className="w-10 px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-md-outline-variant/20">
                                    {products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="cursor-pointer transition-colors hover:bg-md-surface-container/40"
                                            onClick={() => handleEdit(product)}
                                        >
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-medium text-md-on-surface">
                                                    {product.name}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-mono text-xs text-md-on-surface-variant">
                                                    {product.sku || '—'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-semibold text-md-on-surface">
                                                    {Number(
                                                        product.price,
                                                    ).toLocaleString(
                                                        'vi-VN',
                                                    )}{' '}
                                                    ₫
                                                </p>
                                                {Number(product.discount) > 0 &&
                                                    Number(
                                                        product.discounted_price,
                                                    ) <
                                                        Number(
                                                            product.price,
                                                        ) && (
                                                        <p className="text-xs text-md-primary">
                                                            {Number(
                                                                product.discounted_price,
                                                            ).toLocaleString(
                                                                'vi-VN',
                                                            )}{' '}
                                                            ₫
                                                        </p>
                                                    )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {Number(product.discount) >
                                                0 ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                        -
                                                        {(
                                                            Number(
                                                                product.discount,
                                                            ) * 100
                                                        ).toFixed(0)}
                                                        %
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-md-on-surface-variant">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        Number(
                                                            product.stock_quantity,
                                                        ) === 0
                                                            ? 'text-md-error'
                                                            : Number(
                                                                    product.stock_quantity,
                                                                ) < 10
                                                              ? 'text-amber-600'
                                                              : 'text-md-on-surface'
                                                    }`}
                                                >
                                                    {Number(
                                                        product.stock_quantity,
                                                    ).toLocaleString('vi-VN')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        product.is_active
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-md-surface-container-high text-md-on-surface-variant'
                                                    }`}
                                                >
                                                    {product.is_active
                                                        ? 'Đang bán'
                                                        : 'Ngừng bán'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(product);
                                                        }}
                                                        className="rounded-lg p-1.5 text-md-on-surface-variant transition-colors hover:bg-md-surface-container hover:text-md-primary"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(
                                                                product,
                                                            );
                                                        }}
                                                        className="rounded-lg p-1.5 text-md-on-surface-variant transition-colors hover:bg-md-error-container hover:text-md-error"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="divide-y divide-md-outline-variant/20 md:hidden">
                            {products.data.map((product) => (
                                <div
                                    key={product.id}
                                    className="cursor-pointer px-4 py-4 transition-colors hover:bg-md-surface-container/40"
                                    onClick={() => handleEdit(product)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-md-on-surface">
                                                {product.name}
                                            </p>
                                            {product.sku && (
                                                <p className="mt-0.5 font-mono text-xs text-md-on-surface-variant">
                                                    {product.sku}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <p className="text-sm font-semibold text-md-on-surface">
                                                {Number(
                                                    product.price,
                                                ).toLocaleString('vi-VN')}{' '}
                                                ₫
                                            </p>
                                            {Number(product.discount) > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                    -
                                                    {(
                                                        Number(
                                                            product.discount,
                                                        ) * 100
                                                    ).toFixed(0)}
                                                    %
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                product.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-md-surface-container-high text-md-on-surface-variant'
                                            }`}
                                        >
                                            {product.is_active
                                                ? 'Đang bán'
                                                : 'Ngừng bán'}
                                        </span>
                                        <span className="text-xs text-md-on-surface-variant">
                                            Tồn:{' '}
                                            {Number(
                                                product.stock_quantity,
                                            ).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(product);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-md-on-surface-variant transition-colors hover:bg-md-surface-container"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(product);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-md-error transition-colors hover:bg-md-error-container"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Xoá
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {products.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-md-on-surface-variant">
                        Hiển thị {products.from}–{products.to} trong tổng{' '}
                        {vi(products.total)} sản phẩm
                    </p>
                    <div className="flex items-center gap-1">
                        {products.links.map((link, i) => {
                            if (link.url === null) {
                                return null;
                            }

                            const isPrev = link.label.includes('Previous');
                            const isNext = link.label.includes('Next');

                            if (isPrev || isNext) {
                                return (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-md-on-surface-variant transition-colors hover:bg-md-surface-container"
                                    >
                                        {isPrev && (
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        )}
                                        {isPrev ? 'Trước' : 'Sau'}
                                        {isNext && (
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        )}
                                    </Link>
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-md-primary text-md-on-primary'
                                            : 'text-md-on-surface-variant hover:bg-md-surface-container'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Slide-over */}
            <ProductFormSlideOver
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    setEditProduct(null);
                }}
                product={editProduct}
            />
        </div>
    );
}

Products.layout = (page: ReactNode) => (
    <DashboardLayout title="Sản phẩm">{page}</DashboardLayout>
);
