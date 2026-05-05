import type { Order } from '@/types/Order';

const STATUS_CONFIG: Record<
    Order['status'],
    {
        label: string;
        containerClass: string;
        textClass: string;
        dotClass: string;
    }
> = {
    pending: {
        label: 'Chờ xử lý',
        containerClass: 'bg-md-surface-container',
        textClass: 'text-md-on-surface-variant',
        dotClass: 'bg-md-outline',
    },
    processing: {
        label: 'Đang xử lý',
        containerClass: 'bg-md-primary-container',
        textClass: 'text-md-on-primary-container',
        dotClass: 'bg-md-primary',
    },
    shipped: {
        label: 'Đang giao',
        containerClass: 'bg-md-secondary-container',
        textClass: 'text-md-on-secondary-container',
        dotClass: 'bg-md-secondary',
    },
    delivered: {
        label: 'Đã giao',
        containerClass: 'bg-[rgb(200_245_220)]',
        textClass: 'text-[rgb(20_100_50)]',
        dotClass: 'bg-[rgb(30_140_70)]',
    },
    cancelled: {
        label: 'Đã huỷ',
        containerClass: 'bg-md-error-container',
        textClass: 'text-md-on-error-container',
        dotClass: 'bg-md-error',
    },
};

export default function StatusBadge({ status }: { status: Order['status'] }) {
    const cfg = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.containerClass} ${cfg.textClass}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
            {cfg.label}
        </span>
    );
}
