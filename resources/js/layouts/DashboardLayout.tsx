// resources/js/layouts/AdminLayout.tsx
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    PackageSearch,
    ChevronDown,
    Menu,
    Package,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Bell,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    match: string;
    children?: { label: string; href: string; match: string }[];
}

const NAV: NavItem[] = [
    {
        label: 'Tổng quan',
        icon: LayoutDashboard,
        href: '/admin',
        match: '/admin',
    },
    {
        label: 'Đơn hàng',
        icon: ShoppingBag,
        href: '/admin/orders',
        match: '/admin/orders',
        children: [
            { label: 'Tất cả đơn', href: '/admin/orders', match: '/admin/orders' },
            { label: 'Chờ xử lý', href: '/admin/orders?status=pending', match: '/admin/orders?status=pending' },
            { label: 'Đang giao', href: '/admin/orders?status=shipped', match: '/admin/orders?status=shipped' },
        ],
    },
    {
        label: 'Sản phẩm',
        icon: Package,
        href: '/admin/products',
        match: '/admin/products',
    },
    {
        label: 'Khách hàng',
        icon: Users,
        href: '/admin/customers',
        match: '/admin/customers',
    },
    {
        label: 'Báo cáo',
        icon: BarChart3,
        href: '/admin/reports',
        match: '/admin/reports',
    },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
    const { url } = usePage();
    const isActive = url.startsWith(item.match);
    const [open, setOpen] = useState(isActive);
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
        return (
            <div>
                <button
                    onClick={() => setOpen((o) => !o)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                            ? 'bg-md-primary-container text-md-on-primary-container'
                            : 'text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface'
                    }`}
                >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                            />
                        </>
                    )}
                </button>
                {open && !collapsed && (
                    <div className="ml-8 mt-1 space-y-0.5 border-l border-md-outline-variant/40 pl-3">
                        {item.children!.map((child) => (
                            <Link
                                key={child.match}
                                href={child.href}
                                className={`block rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                                    url === child.match
                                        ? 'text-md-primary'
                                        : 'text-md-on-surface-variant hover:text-md-on-surface'
                                }`}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-md-primary-container text-md-on-primary-container'
                    : 'text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface'
            }`}
            title={collapsed ? item.label : undefined}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
        </Link>
    );
}

function Sidebar({ collapsed, mobile = false }: { collapsed: boolean; mobile?: boolean }) {
    return (
        <aside
            className={`flex h-full flex-col bg-md-surface-container-lowest ring-1 ring-md-outline-variant/30 transition-all duration-300 ${
                mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'
            }`}
        >
            {/* Logo */}
            <div
                className={`flex h-16 shrink-0 items-center border-b border-md-outline-variant/30 px-4 ${
                    collapsed && !mobile ? 'justify-center' : 'gap-3'
                }`}
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-md-primary">
                    <PackageSearch className="h-4 w-4 text-md-on-primary" />
                </div>
                {(!collapsed || mobile) && (
                    <span className="text-sm font-black text-md-on-surface">
                        Admin
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {NAV.map((item) => (
                    <NavLink
                        key={item.match}
                        item={item}
                        collapsed={collapsed && !mobile}
                    />
                ))}
            </nav>

            {/* Bottom */}
            <div className="shrink-0 space-y-1 border-t border-md-outline-variant/30 p-3">
                <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-md-on-surface-variant transition-colors hover:bg-md-surface-container hover:text-md-on-surface"
                >
                    <Settings className="h-5 w-5 shrink-0" />
                    {(!collapsed || mobile) && <span>Cài đặt</span>}
                </Link>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-md-on-surface-variant transition-colors hover:bg-md-error-container hover:text-md-on-error-container"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {(!collapsed || mobile) && <span>Đăng xuất</span>}
                </Link>
            </div>
        </aside>
    );
}

export default function DashboardLayout({
    children,
    title,
}: {
    children: React.ReactNode;
    title?: string;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-md-surface">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex">
                <Sidebar collapsed={collapsed} />
            </div>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-md-scrim/40"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full">
                        <Sidebar collapsed={false} mobile />
                    </div>
                </div>
            )}

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Topbar */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-md-outline-variant/30 bg-md-surface-container-lowest px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-xl p-2 text-md-on-surface-variant hover:bg-md-surface-container lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCollapsed((c) => !c)}
                            className="hidden rounded-xl p-2 text-md-on-surface-variant hover:bg-md-surface-container lg:block"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        {title && (
                            <h1 className="text-base font-bold text-md-on-surface">
                                {title}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="relative rounded-xl p-2 text-md-on-surface-variant hover:bg-md-surface-container">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-md-error" />
                        </button>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-md-primary text-xs font-bold text-md-on-primary">
                            A
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
