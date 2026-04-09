<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Return a single product (e.g. for a product detail modal/page).
     */
    public function show(Product $product): Response
    {
        abort_if(! $product->is_active, 404);

        return Inertia::render('shopping/ProductDetail', [
            'product' => $product->only([
                'id', 'name', 'slug', 'description',
                'price', 'discount', 'image_url', 'discounted_price',
            ]),
        ]);
    }
}
