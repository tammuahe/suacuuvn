<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'discount',
        'stock_quantity',
        'image_url',
        'sku',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
    ];

    // Computed discounted price — available as $product->discounted_price
    protected $appends = ['discounted_price'];

    public function getDiscountedPriceAttribute(): string
    {
        return number_format($this->price * (1 - $this->discount), 2, '.', '');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    // Relations
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
