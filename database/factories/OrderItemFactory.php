<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected static $products;

    public function definition(): array
    {
        if (! self::$products) {
            self::$products = Product::all();
        }

        $product = $this->faker->randomElement(self::$products);

        $qty = $this->faker->numberBetween(1, 3);

        $unitPrice = $product->price * (1 - ($product->discount ?? 0));

        return [
            'product_id' => $product->id,
            'unit_price' => $unitPrice,
            'quantity' => $qty,
            'subtotal' => $unitPrice * $qty,
        ];
    }
}
