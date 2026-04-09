<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShoppingController extends Controller
{
    public function show(){
        $products = Product::active()
            ->inStock()
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'price', 'discount', 'image_url', 'discounted_price']);

        return Inertia::render('shopping/Shopping', [
            'products' => $products,
        ]);
    }
}
