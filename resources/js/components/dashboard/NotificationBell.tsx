import { usePage } from '@inertiajs/react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { notifications as notifRoute } from '@/routes/dashboard';

interface NotifData {
    order_id: number;
    reference: string;
    type: string;
    message: string;
}

interface NotifItem {
    id: string;
    data: NotifData;
    read: boolean;
    created_at: string;
}

const TYPE_ICON: Record<string, { bg: string; text: string }> = {
    new_order: { bg: 'bg-blue-50', text: 'text-blue-600' },
    status_change: { bg: 'bg-amber-50', text: 'text-amber-600' },
    payment: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    uncancel: { bg: 'bg-violet-50', text: 'text-violet-600' },
    new_customer: { bg: 'bg-sky-50', text: 'text-sky-600' },
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
        return 'Vừa xong';
    }

    if (minutes < 60) {
        return `${minutes} phút trước`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} giờ trước`;
    }

    const days = Math.floor(hours / 24);

    return `${days} ngày trước`;
}

export default function NotificationBell() {
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotifItem[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const fetchId = useRef(0);

    const fetchAll = useCallback(async () => {
        const id = ++fetchId.current;

        setLoading(true);

        try {
            const res = await fetch(notifRoute.url());

            if (id !== fetchId.current) {
                return;
            }

            const data = await res.json();

            setItems(data.notifications);
            setUnread(data.unread);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll, url]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('click', handleClick);
        }

        return () => document.removeEventListener('click', handleClick);
    }, [open]);

    const markRead = async (id: string) => {
        await fetch(notifRoute.url() + `/${id}/read`, { method: 'POST' });
        setItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        setUnread((c) => Math.max(0, c - 1));
    };

    const markAll = async () => {
        await fetch(notifRoute.url() + '/read-all', { method: 'POST' });
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnread(0);
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => {
                    setOpen((o) => !o);

                    if (!open) {
                        fetchAll();
                    }
                }}
                className="relative rounded-xl p-2 text-md-on-surface-variant hover:bg-md-surface-container"
            >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-md-error px-1 text-[10px] font-bold text-md-on-error">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute top-full right-0 z-50 mt-2 w-80 rounded-2xl border border-md-outline-variant/30 bg-md-surface-container-lowest shadow-xl">
                    <div className="flex items-center justify-between border-b border-md-outline-variant/20 px-4 py-3">
                        <h3 className="text-xs font-bold text-md-on-surface">
                            Thông báo
                        </h3>
                        {unread > 0 && (
                            <button
                                onClick={markAll}
                                className="flex items-center gap-1 text-xs text-md-primary hover:underline"
                            >
                                <Check className="h-3 w-3" />
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading && items.length === 0 && (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-md-on-surface-variant" />
                            </div>
                        )}

                        {!loading && items.length === 0 && (
                            <div className="py-8 text-center text-xs text-md-on-surface-variant">
                                Chưa có thông báo
                            </div>
                        )}

                        {items.map((n) => {
                            const style = TYPE_ICON[n.data.type] ?? {
                                bg: 'bg-md-surface-container',
                                text: 'text-md-on-surface-variant',
                            };

                            return (
                                <button
                                    key={n.id}
                                    onClick={() => markRead(n.id)}
                                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-md-surface-container/50 ${!n.read ? 'bg-md-primary/5' : ''}`}
                                >
                                    <div
                                        className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-md-primary'}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`text-xs ${n.read ? 'text-md-on-surface-variant' : 'font-medium text-md-on-surface'}`}
                                        >
                                            {n.data.message}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-2">
                                            <span className="text-[10px] text-md-on-surface-variant/70">
                                                {timeAgo(n.created_at)}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}
                                            >
                                                {n.data.reference}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
