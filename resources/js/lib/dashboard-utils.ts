export const C = {
    primary: '#475D92',
    secondary: '#735187',
    green: '#4CAF50',
    amber: '#F59E0B',
    red: '#BA1A1A',
    blue: '#2563EB',
    teal: '#0D9488',
    grid: 'rgba(73,69,78,0.08)',
    text: '#49454E',
    muted: '#7A757F',
    palette: [
        '#475D92',
        '#735187',
        '#725572',
        '#2563EB',
        '#0D9488',
        '#F59E0B',
        '#4CAF50',
        '#BA1A1A',
    ],
};

export const BASE = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'inherit', color: C.text },
    grid: { top: 36, right: 16, bottom: 36, left: 56, containLabel: true },
    tooltip: {
        backgroundColor: '#fff',
        borderColor: '#CBc4cf',
        borderWidth: 1,
        textStyle: { color: '#1C1B20', fontSize: 12 },
        extraCssText:
            'box-shadow:0 4px 16px rgba(0,0,0,.10);border-radius:12px;',
    },
};

export const STATUS_VI: Record<string, string> = {
    completed: 'Hoàn thành',
    pending: 'Chờ xử lý',
    cancelled: 'Đã hủy',
    delivered: 'Đã giao hàng',
    processing: 'Đang xử lý',
    shipped: 'Đã giao cho đơn vị vận chuyển',
};

export const STATUS_COLOR: Record<string, string> = {
    completed: C.green,
    pending: C.amber,
    cancelled: C.red,
    delivered: C.green,
    processing: C.blue,
    shipped: C.teal,
};

export function fmt(n: number) {
    if (n >= 1_000_000_000) {
        return `${(n / 1_000_000_000).toFixed(1)} tỷ ₫`;
    }

    if (n >= 1_000_000) {
        return `${(n / 1_000_000).toFixed(1)} tr ₫`;
    }

    if (n >= 1_000) {
        return `${(n / 1_000).toFixed(0)}K ₫`;
    }

    return `${n.toFixed(0)} ₫`;
}

export function pct(n: number) {
    return `${n.toFixed(1)}%`;
}

export function vi(n: number) {
    return n.toLocaleString('vi-VN');
}
