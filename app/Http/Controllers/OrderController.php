<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        // TODO: add exception handling
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:100'],
            'customer_phone' => ['required', 'string', 'regex:/^[0-9\s\+\-]{9,15}$/'],
            'customer_email' => ['nullable', 'email', 'max:150'],
            'notes' => ['nullable', 'string', 'max:500'],
            'shipping_address.address' => ['required', 'string', 'max:200'],
            'shipping_address.province_code' => ['required', 'integer'],
            'shipping_address.district_code' => ['required', 'integer'],
            'shipping_address.ward_code' => ['required', 'integer'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $productIds = collect($validated['items'])->pluck('product_id');
        $products = Product::active()
            ->inStock()
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        if ($products->count() !== $productIds->unique()->count()) {
            return back()->withErrors(['order' => 'Một số sản phẩm không còn khả dụng.']);
        }

        $order = DB::transaction(function () use ($validated, $products) {
            $addr = $validated['shipping_address'];
            $total = 0;
            $lines = [];

            foreach ($validated['items'] as $line) {
                $product = $products[$line['product_id']];
                $discounted_price = $product->price * (1 - $product->discount);
                $subtotal = $discounted_price * $line['quantity'];
                $total += $subtotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'unit_price' => $discounted_price,
                    'quantity' => $line['quantity'],
                    'subtotal' => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $order = Order::create([
                // Order discount not implemented, default to 0
                // paid_at default to null
                'reference' => 'ORD-'.strtoupper(uniqid()),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'] ?? null,
                'customer_phone' => $validated['customer_phone'],
                'notes' => $validated['notes'] ?? null,
                'shipping_address' => [
                    'address' => $addr['address'],
                    'province_code' => $addr['province_code'],
                    'district_code' => $addr['district_code'],
                    'ward_code' => $addr['ward_code'],
                ],
                'paid_at' => null,
                'total' => $total,
                'status' => 'pending',
            ]);
            $lines = array_map(fn ($l) => ['order_id' => $order->id, ...$l], $lines);
            $order->items()->insert($lines);

            return $order;
        });

        $order->update([
            'status' => 'processing',
        ]);

        return redirect()->route('checkout.success')
            ->with('order_reference', $order->reference);
    }

    public function lookup(Request $request): Response
    {
        $orderRef = $request->query('orderRef');
        $tel = $request->query('tel');
        $orders = [];
        if (! $orderRef && ! $tel) {
            $orders = collect();
        } else {
            $orders = Order::query()
                ->select([
                    'reference',
                    'status',
                    'shipping_address',
                    'customer_name',
                    'customer_phone',
                    'customer_email',
                ])
                ->when($orderRef, fn ($q) => $q->where('reference', $orderRef))
                ->when(! $orderRef && $tel, fn ($q) => $q->where('customer_phone', $tel))
                ->get()
                ->map(function ($order) {
                    $ref = $order->reference;
                    if ($ref && str_contains($ref, '-')) {
                        [$prefix, $suffix] = explode('-', $ref, 2);

                        $len = strlen($suffix);
                        if ($len <= 5) {
                            $maskedSuffix = str_repeat('*', $len);
                        } else {
                            $maskedSuffix = str_repeat('*', $len - 5).substr($suffix, -5);
                        }

                        $ref = $prefix.'-'.$maskedSuffix;
                    }
                    $phone = null;
                    if ($order->customer_phone) {
                        $len = strlen($order->customer_phone);

                        if ($len <= 6) {
                            $phone = str_repeat('*', $len);
                        } else {
                            $phone = substr($order->customer_phone, 0, 3)
                                .str_repeat('*', $len - 6)
                                .substr($order->customer_phone, -3);
                        }
                    }
                    $email = null;
                    if ($order->customer_email && str_contains($order->customer_email, '@')) {
                        [$name, $domain] = explode('@', $order->customer_email);
                        $email = substr($name, 0, 2).'***@'.$domain;
                    }

                    $shipping = null;
                    if ($order->shipping_address) {
                        if (\is_array($shipping)) {
                            unset($shipping['address']);
                        }
                    }

                    return [
                        'reference' => $ref,
                        'status' => $order->status,
                        'shipping_address' => $order->shipping_address,
                        'customer_name' => $order->customer_name,
                        'customer_phone' => $phone,
                        'customer_email' => $email,
                    ];
                });
        }

        return Inertia::render('order/OrderLookup', ['orderRef' => $orderRef, 'tel' => $tel, 'orders' => $orders]);
    }
}
