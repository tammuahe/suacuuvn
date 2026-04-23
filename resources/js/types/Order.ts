export interface ShippingAddress {
    province_code?: number;
    district_code?: number;
    ward_code?: number;
}

export interface Order {
    reference: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address: ShippingAddress;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
}
