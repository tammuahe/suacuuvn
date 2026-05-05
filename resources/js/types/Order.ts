export interface ShippingAddress {
    address?: string;
    province_code?: number;
    district_code?: number;
    ward_code?: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number | null;
    unit_price: string;
    quantity: number;
    subtotal: string;
    product?: {
        id: number;
        name: string;
        sku: string | null;
        image_url: string | null;
    } | null;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: number;
    reference: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    tax: string;
    shipping: string;
    discount: string;
    total: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    shipping_address: ShippingAddress;
    payment_reference: string | null;
    payment_method: string | null;
    notes: string | null;
    paid_at: string | null;
    items?: OrderItem[];
    created_at: string;
    updated_at: string;
}
