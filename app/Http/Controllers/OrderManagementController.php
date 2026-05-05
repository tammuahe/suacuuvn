<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($dateFrom = $request->query('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $allowedSorts = ['created_at', 'total', 'reference', 'customer_name', 'status'];
        if (in_array($sort, $allowedSorts, true) && in_array($direction, ['asc', 'desc'], true)) {
            $query->orderBy($sort, $direction);
        }

        $orders = $query->paginate(20)->withQueryString();

        // KPI summary for the current filter
        $kpiQuery = Order::query();

        if ($status = $request->query('status')) {
            $kpiQuery->where('status', $status);
        }
        if ($search = $request->query('search')) {
            $kpiQuery->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }
        if ($dateFrom = $request->query('date_from')) {
            $kpiQuery->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->query('date_to')) {
            $kpiQuery->whereDate('created_at', '<=', $dateTo);
        }

        $kpis = $kpiQuery->selectRaw('
            COUNT(*)                                                      AS total_orders,
            COALESCE(SUM(total), 0)                                       AS total_revenue,
            COUNT(CASE WHEN status = \'pending\'   THEN 1 END)             AS pending_count,
            COUNT(CASE WHEN status = \'processing\' THEN 1 END)            AS processing_count
        ')->first();

        $products = Product::active()
            ->select(['id', 'name', 'slug', 'price', 'discount', 'image_url'])
            ->orderBy('name')
            ->get();

        return Inertia::render('dashboard/Orders', [
            'orders' => $orders,
            'status' => $status,
            'search' => $search,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'sort' => $sort,
            'direction' => $direction,
            'kpis' => $kpis,
            'products' => $products,
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['items.product' => fn ($q) => $q->withTrashed()]);

        return response()->json(['order' => $order]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:100'],
            'customer_phone' => ['required', 'string', 'regex:/^[0-9\s\+\-]{9,15}$/'],
            'customer_email' => ['nullable', 'email', 'max:150'],
            'notes' => ['nullable', 'string', 'max:500'],
            'shipping_address.address' => ['nullable', 'string', 'max:200'],
            'shipping_address.province_code' => ['nullable', 'integer'],
            'shipping_address.district_code' => ['nullable', 'integer'],
            'shipping_address.ward_code' => ['nullable', 'integer'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:pending,processing,shipped,delivered,cancelled'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $productIds = collect($validated['items'])->pluck('product_id');
        $products = Product::whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $missing = $productIds->unique()->diff($products->keys());
        if ($missing->isNotEmpty()) {
            return back()->withErrors(['items' => 'Một số sản phẩm không tồn tại.']);
        }

        $order = DB::transaction(function () use ($validated, $products) {
            $total = 0;
            $lines = [];

            foreach ($validated['items'] as $line) {
                $product = $products[$line['product_id']];
                $unitPrice = $product->discounted_price;
                $subtotal = $unitPrice * $line['quantity'];
                $total += $subtotal;

                $lines[] = [
                    'product_id' => $product->id,
                    'unit_price' => $unitPrice,
                    'quantity' => $line['quantity'],
                    'subtotal' => $subtotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $status = $validated['status'] ?? 'pending';

            $order = Order::create([
                'reference' => Order::generateReference(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'] ?? null,
                'customer_phone' => $validated['customer_phone'],
                'notes' => $validated['notes'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? [],
                'payment_method' => $validated['payment_method'] ?? null,
                'total' => $total,
                'status' => $status,
            ]);

            $order->items()->insert(array_map(
                fn ($l) => ['order_id' => $order->id, ...$l],
                $lines,
            ));

            return $order;
        });

        return redirect()->route('dashboard.orders')
            ->with('flash.success', 'Đã tạo đơn hàng '.$order->reference);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,shipped,delivered,cancelled'],
        ]);

        $order->update(['status' => $validated['status']]);

        return redirect()->route('dashboard.orders')
            ->with('flash.success', 'Đã cập nhật trạng thái đơn '.$order->reference);
    }

    public function markAsPaid(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:100'],
        ]);

        $order->update([
            'paid_at' => now(),
            'payment_reference' => $validated['payment_reference'] ?? $order->payment_reference,
        ]);

        return redirect()->route('dashboard.orders')
            ->with('flash.success', 'Đã đánh dấu thanh toán đơn '.$order->reference);
    }

    public function exportXlsx(Request $request): StreamedResponse
    {
        $query = Order::query()->with('items');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($dateFrom = $request->query('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->streamDownload(function () use ($orders) {
            $writer = new Writer;
            $writer->openToBrowser('orders.xlsx');

            $writer->addRow(Row::fromValues([
                'Mã đơn', 'Ngày tạo', 'Trạng thái', 'Khách hàng', 'Điện thoại',
                'Email', 'Địa chỉ', 'Thanh toán', 'Tổng tiền', 'Sản phẩm', 'Ghi chú',
            ]));

            foreach ($orders as $order) {
                $products = $order->items->map(fn ($item) => $item->product?->name ?? 'N/A')
                    ->implode(', ');

                $address = '';
                if ($order->shipping_address && is_array($order->shipping_address)) {
                    $address = $order->shipping_address['address'] ?? '';
                }

                $writer->addRow(Row::fromValues([
                    $order->reference,
                    $order->created_at->format('Y-m-d H:i'),
                    $order->status,
                    $order->customer_name,
                    $order->customer_phone,
                    $order->customer_email ?? '',
                    $address,
                    $order->paid_at ? 'Đã TT' : 'Chưa TT',
                    number_format((float) $order->total, 0, ',', '.'),
                    $products,
                    $order->notes ?? '',
                ]));
            }

            $writer->close();
        }, 'orders.xlsx');
    }
}
