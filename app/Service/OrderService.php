<?php

namespace App\Service;

use App\Models\Order;

class OrderService
{
    public function findByRef(string $reference)
    {
        return Order::select([
            'id',
            'reference',
            'status',
            'tax',
            'shipping',
            'discount',
            'total',
            'customer_name',
            'customer_email',
            'customer_phone',
            'shipping_address',
            'notes',
            'created_at',
        ])
            ->with([
                'items:order_id,product_id,unit_price,quantity,subtotal',
                'items.product:id,name,slug,image_url,sku',
            ])
            ->where('reference', $reference)
            ->firstOrFail();
    }
}
