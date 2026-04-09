<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class OrderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],

            'shipping_address' => ['required', 'array'],
            'shipping_address.address' => ['required', 'string'],
            'shipping_address.province_code' => ['required', 'exists:provinces,code'],
            'shipping_address.district_code' => [
                'required',
                Rule::exists('districts', 'code')
                    ->where('province_code', $request->input('shipping_address.province_code')),
            ],
            'shipping_address.ward_code' => [
                'required',
                Rule::exists('wards', 'code')
                    ->where('district_code', $request->input('shipping_address.district_code')),
            ],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $productIds = collect($data['items'])->pluck('product_id');
        $products = Product::active()->whereIn('id', $productIds)->get()->keyBy('id');

        if ($products->count() !== $productIds->unique()->count()) {
            return back()->withErrors([
                'items' => 'Một hoặc nhiều sản phẩm không còn tồn tại. Vui lòng kiểm tra lại giỏ hàng.',
            ]);
        }

        try {
            $order = DB::transaction(function () use ($data, $products) {

                $items = [];
                $subtotal = 0;

                foreach ($data['items'] as $line) {
                    $product = $products[$line['product_id']];
                    $price = (float) $product->discounted_price;
                    $lineTotal = $price * $line['quantity'];
                    $subtotal += $lineTotal;

                    $items[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_sku' => $product->sku,
                        'unit_price' => $price,
                        'quantity' => $line['quantity'],
                        'subtotal' => $lineTotal,
                    ];
                }

                $order = Order::create([
                    'reference' => Order::generateReference(),
                    'status' => 'pending',
                    'subtotal' => $subtotal,
                    'tax' => 0,
                    'shipping' => 0,
                    'discount' => 0,
                    'total' => $subtotal,

                    'customer_name' => $data['customer_name'],
                    'customer_email' => $data['customer_email'],
                    'customer_phone' => $data['customer_phone'] ?? null,

                    'shipping_address' => [
                        'address' => $data['shipping_address']['address'],
                        'province_code' => $data['shipping_address']['province_code'],
                        'district_code' => $data['shipping_address']['district_code'],
                        'ward_code' => $data['shipping_address']['ward_code'],
                    ],

                    'notes' => $data['notes'] ?? null,
                ]);

                $order->items()->createMany($items);

                return $order;
            });
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors([
                'order' => 'Không thể tạo đơn hàng. Vui lòng thử lại.',
            ]);
        }

        return redirect()->route('orders.confirmation', $order->reference);
    }

    public function confirmation(string $reference): Response
    {
        $order = Order::with('items')
            ->where('reference', $reference)
            ->firstOrFail();

        return Inertia::render('shopping/OrderConfirmation', [
            'order' => [
                'reference' => $order->reference,
                'status' => $order->status,
                'total' => $order->total,
                'subtotal' => $order->subtotal,
                'shipping' => $order->shipping,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'notes' => $order->notes,
                'created_at' => $order->created_at,
                'items' => $order->items->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                ]),
            ],
        ]);
    }

    public function lookup(Request $request): Response
    {
        $data = $request->validate([
            'reference' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $order = Order::with('items')
            ->where('reference', $data['reference'])
            ->where('customer_email', $data['email'])
            ->first();

        return Inertia::render('order/OrderLookup', [
            'order' => $order ? [
                'reference' => $order->reference,
                'status' => $order->status,
                'total' => $order->total,
                'created_at' => $order->created_at,
                'items' => $order->items->map(fn ($item) => [
                    'product_name' => $item->product_name,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                ]),
            ] : null,
        ]);
    }
}
