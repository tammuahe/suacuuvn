<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Database\Factories\OrderItemFactory;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);

    // Ensure products exist for the OrderItemFactory (which queries Product::all())
    Product::factory()->count(5)->create();

    // Reset static cache on OrderItemFactory after DB refresh
    $reflection = new ReflectionClass(OrderItemFactory::class);
    $property = $reflection->getProperty('products');
    $property->setAccessible(true);
    $property->setValue(null, null);
});

// ─── Index / Listing ──────────────────────────────────────────────────────────

test('guests are redirected from orders page', function () {
    $this->get(route('dashboard.orders'))
        ->assertRedirect(route('login'));
});

test('authenticated admin can view orders page', function () {
    $this->actingAs($this->admin)
        ->get(route('dashboard.orders'))
        ->assertOk();
});

test('orders page shows paginated data', function () {
    Order::factory()->count(25)->create();

    $this->actingAs($this->admin)
        ->get(route('dashboard.orders'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('orders.data', 20)
            ->has('kpis')
        );
});

test('orders can be filtered by status', function () {
    Order::factory()->count(3)->create(['status' => 'pending']);
    Order::factory()->count(2)->create(['status' => 'delivered']);

    $this->actingAs($this->admin)
        ->get(route('dashboard.orders', ['status' => 'pending']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('orders.data', 3)
        );
});

test('orders can be searched by reference', function () {
    Order::factory()->create(['reference' => 'ORD-FINDME-0001', 'customer_name' => 'Alice']);
    Order::factory()->create(['reference' => 'ORD-OTHER-0002', 'customer_name' => 'Bob']);

    $this->actingAs($this->admin)
        ->get(route('dashboard.orders', ['search' => 'FINDME']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('orders.data', 1)
        );
});

// ─── Show / Detail ────────────────────────────────────────────────────────────

test('show returns order detail with items', function () {
    $order = Order::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('dashboard.orders.show', $order))
        ->assertOk()
        ->assertJsonPath('order.reference', $order->reference)
        ->assertJsonPath('order.id', $order->id);
});

// ─── Store / Create ───────────────────────────────────────────────────────────

test('admin can create an order', function () {
    $product = Product::first();

    $this->actingAs($this->admin)
        ->post(route('dashboard.orders.store'), [
            'customer_name' => 'Trần Văn B',
            'customer_phone' => '0987654321',
            'customer_email' => 'b@example.com',
            'notes' => 'Giao giờ hành chính',
            'shipping_address' => [
                'address' => 'Số 10 Nguyễn Huệ',
                'province_code' => 1,
                'district_code' => 1,
                'ward_code' => 1,
            ],
            'payment_method' => 'COD',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])
        ->assertRedirect(route('dashboard.orders'));

    $order = Order::first();
    expect($order->customer_name)->toBe('Trần Văn B');
    expect($order->items)->toHaveCount(1);
    expect((float) $order->total)->toBeGreaterThan(0);
});

test('order creation requires customer name', function () {
    $this->actingAs($this->admin)
        ->post(route('dashboard.orders.store'), [
            'customer_name' => '',
            'customer_phone' => '0987654321',
            'items' => [],
        ])
        ->assertSessionHasErrors('customer_name');
});

test('order creation requires at least one item', function () {
    $this->actingAs($this->admin)
        ->post(route('dashboard.orders.store'), [
            'customer_name' => 'Test',
            'customer_phone' => '0987654321',
            'items' => [],
        ])
        ->assertSessionHasErrors('items');
});

// ─── Status Update ────────────────────────────────────────────────────────────

test('admin can update order status', function () {
    $order = Order::factory()->create(['status' => 'pending']);

    $this->actingAs($this->admin)
        ->patch(route('dashboard.orders.update-status', $order), [
            'status' => 'processing',
        ])
        ->assertRedirect(route('dashboard.orders'));

    expect($order->fresh()->status)->toBe('processing');
});

test('status update requires valid status', function () {
    $order = Order::factory()->create(['status' => 'pending']);

    $this->actingAs($this->admin)
        ->patch(route('dashboard.orders.update-status', $order), [
            'status' => 'invalid-status',
        ])
        ->assertSessionHasErrors('status');
});

// ─── Mark Paid ────────────────────────────────────────────────────────────────

test('admin can mark an order as paid', function () {
    $order = Order::factory()->create(['paid_at' => null]);

    $this->actingAs($this->admin)
        ->patch(route('dashboard.orders.mark-paid', $order), [
            'payment_reference' => 'TXN-12345',
        ])
        ->assertRedirect(route('dashboard.orders'));

    expect($order->fresh()->paid_at)->not->toBeNull();
    expect($order->fresh()->payment_reference)->toBe('TXN-12345');
});

// ─── Export ───────────────────────────────────────────────────────────────────

test('admin can export orders as xlsx', function () {
    Order::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('dashboard.orders.export'))
        ->assertOk()
        ->assertHeader('content-disposition');
});
