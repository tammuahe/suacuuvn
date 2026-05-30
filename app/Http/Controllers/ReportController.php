<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $dateFrom = $request->query('date_from', today()->subDays(29)->toDateString());
        $dateTo = $request->query('date_to', today()->toDateString());
        $oneYearAgo = today()->subYear()->startOfDay();

        $driver = DB::connection()->getDriverName();

        $avgFulfillHoursQuery = $driver === 'sqlite'
            ? 'COALESCE(AVG(CASE WHEN paid_at IS NOT NULL THEN (julianday(paid_at) - julianday(created_at)) * 24 END), 0)'
            : 'COALESCE(AVG(CASE WHEN paid_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, created_at, paid_at) END), 0)';

        $scopedQuery = Order::query()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']);

        // Payment breakdown
        $byPaymentMethod = (clone $scopedQuery)
            ->selectRaw("COALESCE(payment_method, 'Không rõ') AS payment_method, COUNT(*) AS count")
            ->groupBy('payment_method')
            ->pluck('count', 'payment_method');

        $paidRevenue = (float) (clone $scopedQuery)->whereNotNull('paid_at')->sum('total');
        $unpaidRevenue = (float) (clone $scopedQuery)->whereNull('paid_at')->sum('total');

        $paymentSuccessRate = $scopedQuery->count() > 0
            ? round((clone $scopedQuery)->whereNotNull('paid_at')->count() / $scopedQuery->count() * 100, 2)
            : 0;

        // Products
        $topByQty = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']))
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(8)
            ->with('product:id,name')
            ->get()
            ->map(fn ($r) => [
                'product_id' => $r->product_id,
                'product_name' => $r->product?->name,
                'total_qty' => (int) $r->total_qty,
            ]);

        $topByRevenue = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']))
            ->select('product_id', DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->limit(8)
            ->with('product:id,name')
            ->get()
            ->map(fn ($r) => [
                'product_id' => $r->product_id,
                'product_name' => $r->product?->name,
                'total_revenue' => (float) $r->total_revenue,
            ]);

        $avgItemsPerOrder = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']))
            ->selectRaw('SUM(quantity) / NULLIF(COUNT(DISTINCT order_id), 0) AS avg')
            ->value('avg') ?? 0;

        // Pricing & Cost
        $totalRevenue = (float) (clone $scopedQuery)->sum('total');
        $netRevenue = (float) (clone $scopedQuery)->sum(DB::raw('total - tax - shipping'));
        $totalDiscount = (float) (clone $scopedQuery)->sum('discount');
        $totalTax = (float) (clone $scopedQuery)->sum('tax');
        $totalShipping = (float) (clone $scopedQuery)->sum('shipping');

        $discountRate = $totalRevenue > 0
            ? round(($totalDiscount / $totalRevenue) * 100, 2)
            : 0;

        $revenueBreakdown = [
            'net_revenue' => $netRevenue,
            'discount' => $totalDiscount,
            'tax' => $totalTax,
            'shipping' => $totalShipping,
        ];

        // Geography
        $provinceMap = [];
        $addressPath = public_path('addresses.json');
        if (file_exists($addressPath)) {
            $addressData = json_decode(file_get_contents($addressPath), true);
            if (is_array($addressData)) {
                foreach ($addressData as $p) {
                    $provinceMap[(int) ($p['code'] ?? 0)] = $p['name'] ?? null;
                }
            }
        }

        $provinceCodeExtract = $driver === 'sqlite'
            ? "json_extract(shipping_address, '$.province_code')"
            : "JSON_UNQUOTE(JSON_EXTRACT(shipping_address, '$.province_code'))";

        $byProvince = (clone $scopedQuery)
            ->selectRaw("
                $provinceCodeExtract AS province_code,
                COUNT(*)    AS orders,
                SUM(total)  AS revenue
            ")
            ->whereRaw("$provinceCodeExtract IS NOT NULL")
            ->whereRaw("$provinceCodeExtract NOT IN ('null', '', 'undefined', '0')")
            ->groupBy('province_code')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get()
            ->map(function ($r) use ($provinceMap) {
                $code = (int) $r->province_code;

                return [
                    'province' => $provinceMap[$code] ?? "Tỉnh #{$code}",
                    'orders' => (int) $r->orders,
                    'revenue' => (float) $r->revenue,
                ];
            });

        // Operations
        $avgFulfillHours = (float) (clone $scopedQuery)->selectRaw($avgFulfillHoursQuery.' AS val')->value('val');

        $cancellationRate = $scopedQuery->count() > 0
            ? round((clone $scopedQuery)->where('status', 'cancelled')->count() / $scopedQuery->count() * 100, 2)
            : 0;

        $processingOrders = (clone $scopedQuery)->where('status', 'processing')->count();

        $softDeletedCount = Order::onlyTrashed()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->count();

        // Monthly revenue (last 12 months, not scoped by date range)
        $monthFormatQuery = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $revenueByMonth = Order::query()
            ->selectRaw("$monthFormatQuery AS month, SUM(total) AS revenue")
            ->where('created_at', '>=', $oneYearAgo)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'revenue' => (float) $r->revenue]);

        return Inertia::render('dashboard/Reports', [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'by_payment_method' => $byPaymentMethod,
            'paid_revenue' => $paidRevenue,
            'unpaid_revenue' => $unpaidRevenue,
            'payment_success_rate' => $paymentSuccessRate,
            'top_by_qty' => $topByQty,
            'top_by_revenue' => $topByRevenue,
            'avg_items_per_order' => round((float) $avgItemsPerOrder, 2),
            'revenue_breakdown' => $revenueBreakdown,
            'total_discount' => $totalDiscount,
            'discount_rate' => $discountRate,
            'total_tax' => $totalTax,
            'total_shipping' => $totalShipping,
            'total_revenue' => $totalRevenue,
            'net_revenue' => $netRevenue,
            'by_province' => $byProvince,
            'avg_fulfill_hours' => $avgFulfillHours,
            'cancellation_rate' => $cancellationRate,
            'processing_orders' => $processingOrders,
            'soft_deleted_count' => $softDeletedCount,
            'revenue_by_month' => $revenueByMonth,
        ]);
    }

    public function export(string $section, Request $request): StreamedResponse
    {
        $dateFrom = $request->query('date_from', today()->subDays(29)->toDateString());
        $dateTo = $request->query('date_to', today()->toDateString());

        $data = match ($section) {
            'top-products' => OrderItem::query()
                ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']))
                ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
                ->groupBy('product_id')
                ->orderByDesc('total_revenue')
                ->with('product:id,name')
                ->get()
                ->map(fn ($r) => [
                    'Sản phẩm' => $r->product?->name ?? 'N/A',
                    'Số lượng bán' => (int) $r->total_qty,
                    'Doanh thu' => (float) $r->total_revenue,
                ]),
            'by-province' => $this->getProvinceDataForExport($dateFrom, $dateTo),
            'by-payment' => Order::query()
                ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
                ->selectRaw("COALESCE(payment_method, 'Không rõ') AS method, COUNT(*) AS count, SUM(total) AS revenue")
                ->groupBy('payment_method')
                ->get()
                ->map(fn ($r) => [
                    'Phương thức' => $r->method,
                    'Số đơn' => (int) $r->count,
                    'Doanh thu' => (float) $r->revenue,
                ]),
            default => abort(404, 'Section not found'),
        };

        return response()->streamDownload(function () use ($data) {
            $fp = fopen('php://output', 'w');
            fprintf($fp, chr(0xEF).chr(0xBB).chr(0xBF));

            if ($data->isNotEmpty()) {
                fputcsv($fp, array_keys($data->first()));
                foreach ($data as $row) {
                    fputcsv($fp, $row);
                }
            }

            fclose($fp);
        }, "{$section}-export.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function getProvinceDataForExport(string $dateFrom, string $dateTo): \Illuminate\Support\Collection
    {
        $driver = DB::connection()->getDriverName();

        $provinceMap = [];
        $addressPath = public_path('addresses.json');
        if (file_exists($addressPath)) {
            $addressData = json_decode(file_get_contents($addressPath), true);
            if (is_array($addressData)) {
                foreach ($addressData as $p) {
                    $provinceMap[(int) ($p['code'] ?? 0)] = $p['name'] ?? null;
                }
            }
        }

        $provinceCodeExtract = $driver === 'sqlite'
            ? "json_extract(shipping_address, '$.province_code')"
            : "JSON_UNQUOTE(JSON_EXTRACT(shipping_address, '$.province_code'))";

        return Order::query()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->selectRaw("
                $provinceCodeExtract AS province_code,
                COUNT(*)    AS orders,
                SUM(total)  AS revenue
            ")
            ->whereRaw("$provinceCodeExtract IS NOT NULL")
            ->whereRaw("$provinceCodeExtract NOT IN ('null', '', 'undefined', '0')")
            ->groupBy('province_code')
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($r) use ($provinceMap) {
                $code = (int) $r->province_code;

                return [
                    'Tỉnh/Thành' => $provinceMap[$code] ?? "Tỉnh #{$code}",
                    'Số đơn' => (int) $r->orders,
                    'Doanh thu' => (float) $r->revenue,
                ];
            });
    }
}
