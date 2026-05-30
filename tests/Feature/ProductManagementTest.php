<?php

use App\Models\Product;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
});

// ─── Index / Listing ──────────────────────────────────────────────────────────

test('guests are redirected from products page', function () {
    $this->get(route('dashboard.products'))
        ->assertRedirect(route('login'));
});

test('authenticated admin can view products page', function () {
    $this->actingAs($this->admin)
        ->get(route('dashboard.products'))
        ->assertOk();
});

test('products page shows paginated data', function () {
    Product::factory()->count(25)->create();

    $this->actingAs($this->admin)
        ->get(route('dashboard.products'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 20)
        );
});

test('products can be filtered by status', function () {
    Product::factory()->count(3)->create(['is_active' => true]);
    Product::factory()->count(2)->create(['is_active' => false]);

    $this->actingAs($this->admin)
        ->get(route('dashboard.products', ['status' => 'active']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 3)
        );
});

test('products can be searched by name', function () {
    Product::factory()->create(['name' => 'Sữa cừu tươi FINDME', 'slug' => 'sua-cuu-tuoi-findme']);
    Product::factory()->create(['name' => 'Sữa dê', 'slug' => 'sua-de']);

    $this->actingAs($this->admin)
        ->get(route('dashboard.products', ['search' => 'FINDME']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
        );
});

test('products can be searched by SKU', function () {
    Product::factory()->create(['sku' => 'SKU-FIND-001', 'name' => 'Alpha']);
    Product::factory()->create(['sku' => 'SKU-OTHER', 'name' => 'Beta']);

    $this->actingAs($this->admin)
        ->get(route('dashboard.products', ['search' => 'FIND']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
        );
});

// ─── Create ────────────────────────────────────────────────────────────────────

test('can create product', function () {
    $this->actingAs($this->admin)
        ->post(route('dashboard.products.store'), [
            'name' => 'Sữa cừu nguyên chất',
            'price' => 150000,
            'discount' => 0.1,
            'stock_quantity' => 50,
            'sku' => 'SCNC-001',
            'is_active' => true,
        ])
        ->assertRedirect(route('dashboard.products'))
        ->assertSessionHas('flash.success');

    $this->assertDatabaseHas('products', [
        'name' => 'Sữa cừu nguyên chất',
        'slug' => 'sua-cuu-nguyen-chat',
        'price' => 150000.00,
        'discount' => 0.10,
        'stock_quantity' => 50,
        'sku' => 'SCNC-001',
        'is_active' => true,
    ]);
});

test('cannot create product with invalid data', function () {
    $this->actingAs($this->admin)
        ->post(route('dashboard.products.store'), [
            'name' => '',
            'price' => -1,
        ])
        ->assertSessionHasErrors(['name', 'price']);
});

test('cannot create product with duplicate SKU', function () {
    Product::factory()->create(['sku' => 'DUPE-001']);

    $this->actingAs($this->admin)
        ->post(route('dashboard.products.store'), [
            'name' => 'Another',
            'price' => 100000,
            'sku' => 'DUPE-001',
        ])
        ->assertSessionHasErrors(['sku']);
});

// ─── Update ────────────────────────────────────────────────────────────────────

test('can update product', function () {
    $product = Product::factory()->create([
        'name' => 'Original Name',
        'price' => 100000,
    ]);

    $this->actingAs($this->admin)
        ->patch(route('dashboard.products.update', $product), [
            'name' => 'Updated Name',
            'price' => 200000,
            'is_active' => false,
        ])
        ->assertRedirect(route('dashboard.products'))
        ->assertSessionHas('flash.success');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Name',
        'price' => 200000.00,
        'slug' => 'updated-name',
        'is_active' => false,
    ]);
});

test('update preserves slug if provided', function () {
    $product = Product::factory()->create(['name' => 'Foo Bar', 'slug' => 'custom-slug']);

    $this->actingAs($this->admin)
        ->patch(route('dashboard.products.update', $product), [
            'name' => 'Foo Bar Updated',
            'price' => 100000,
            'slug' => 'keep-custom-slug',
        ]);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'slug' => 'keep-custom-slug',
    ]);
});

test('update generates new slug if name changed and slug empty', function () {
    $product = Product::factory()->create(['name' => 'Old Name', 'slug' => 'old-name']);

    $this->actingAs($this->admin)
        ->patch(route('dashboard.products.update', $product), [
            'name' => 'New Name Here',
            'price' => 100000,
            'slug' => null,
        ]);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'slug' => 'new-name-here',
    ]);
});

// ─── Delete ────────────────────────────────────────────────────────────────────

test('can delete product (soft delete)', function () {
    $product = Product::factory()->create();

    $this->actingAs($this->admin)
        ->delete(route('dashboard.products.destroy', $product))
        ->assertRedirect(route('dashboard.products'))
        ->assertSessionHas('flash.success');

    $this->assertSoftDeleted($product);
});

test('soft deleted product still visible in listing', function () {
    $active = Product::factory()->create(['name' => 'Active']);
    $deleted = Product::factory()->create(['name' => 'Deleted']);
    $deleted->delete();

    $this->actingAs($this->admin)
        ->get(route('dashboard.products'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('products.data', 2)
        );
});

// ─── Auth ──────────────────────────────────────────────────────────────────────

test('guests cannot create product', function () {
    $this->post(route('dashboard.products.store'), [
        'name' => 'Hack',
        'price' => 1000,
    ])->assertRedirect(route('login'));
});

test('guests cannot update product', function () {
    $product = Product::factory()->create();

    $this->patch(route('dashboard.products.update', $product), [
        'name' => 'Hack',
        'price' => 1000,
    ])->assertRedirect(route('login'));
});

test('guests cannot delete product', function () {
    $product = Product::factory()->create();

    $this->delete(route('dashboard.products.destroy', $product))
        ->assertRedirect(route('login'));
});
