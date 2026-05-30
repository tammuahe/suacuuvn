<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ProductManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()->withTrashed();

        if (($status = $request->query('status')) !== null && $status !== '') {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $allowedSorts = ['created_at', 'name', 'price', 'stock_quantity'];

        if (in_array($sort, $allowedSorts, true) && in_array($direction, ['asc', 'desc'], true)) {
            $query->orderBy($sort, $direction);
        }

        $products = $query->paginate(20)->withQueryString();

        return Inertia::render('dashboard/Products', [
            'products' => $products,
            'status' => $request->query('status'),
            'search' => $request->query('search'),
            'sort' => $sort,
            'direction' => $direction,
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'] ?? null)) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        try {
            Product::create($validated);
        } catch (Throwable $e) {
            return back()->withErrors(['name' => 'Không thể tạo sản phẩm. Vui lòng thử lại.']);
        }

        return redirect()->route('dashboard.products')
            ->with('flash.success', 'Đã tạo sản phẩm "'.$validated['name'].'"');
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'] ?? null)) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        try {
            $product->update($validated);
        } catch (Throwable $e) {
            return back()->withErrors(['name' => 'Không thể cập nhật sản phẩm. Vui lòng thử lại.']);
        }

        return redirect()->route('dashboard.products')
            ->with('flash.success', 'Đã cập nhật sản phẩm "'.$product->name.'"');
    }

    public function destroy(Product $product): RedirectResponse
    {
        try {
            $product->delete();
        } catch (Throwable $e) {
            return back()->withErrors(['name' => 'Không thể xoá sản phẩm. Vui lòng thử lại.']);
        }

        return redirect()->route('dashboard.products')
            ->with('flash.success', 'Đã xoá sản phẩm "'.$product->name.'"');
    }
}
