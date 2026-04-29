<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'reference',
        'status',
        'subtotal',
        'tax',
        'shipping',
        'discount',
        'total',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'payment_reference',
        'payment_method',
        'notes',
        'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'shipping_address' => 'array',
        'paid_at' => 'datetime',
    ];

    // Scopes
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    // Relations
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // Helpers
    public function isPaid(): bool
    {
        return $this->paid_at !== null;
    }

    public function isCancellable(): bool
    {
        return \in_array($this->status, ['pending', 'processing']);
    }

    public static function generateReference(): string
    {
        $date = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->withTrashed()->count() + 1;

        return \sprintf('ORD-%s-%04d', $date, $count);
    }
}
