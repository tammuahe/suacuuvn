<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Service\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShoppingController extends Controller
{
    public function show()
    {
        $products = Product::active()
            ->inStock()
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'price', 'discount', 'image_url', 'discounted_price']);

        return Inertia::render('shopping/Shopping', [
            'products' => $products,
        ]);
    }

    public function success(Request $request)
    {
        if (! session()->has('order_reference')) {
            return redirect()->route('shopping');
        }
        $order = app(OrderService::class)->findByRef(session('order_reference'));

        return Inertia::render('checkout/Success', ['order' => $order]);
    }

    public function checkout()
    {
        return Inertia::render('checkout/Checkout');
    }
}
