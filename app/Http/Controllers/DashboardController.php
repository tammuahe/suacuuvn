<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function showMetrics()
    {
        $today = now();
        $thirtyDaysAgo = $today->copy()->subDays(29)->startOfDay();
        $oneYearAgo = $today->copy()->subYear()->startOfDay();

        $driver = DB::connection()->getDriverName();
        $avgFulfillHoursQuery = $driver === 'sqlite'
            ? 'COALESCE(AVG(CASE WHEN paid_at IS NOT NULL THEN (julianday(paid_at) - julianday(created_at)) * 24 END), 0)'
            : 'COALESCE(AVG(CASE WHEN paid_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, created_at, paid_at) END), 0)';

        // ── 1. KPIs tổng quan ─────────────────────────────────────────────────
        $kpis = Order::selectRaw('
            COUNT(*)                                                          AS total_orders,
            COALESCE(SUM(total), 0)                                           AS total_revenue,
            COALESCE(SUM(total - tax - shipping), 0)                          AS net_revenue,
            COALESCE(SUM(CASE WHEN paid_at IS NOT NULL THEN total  ELSE 0 END), 0) AS paid_revenue,
            COALESCE(SUM(CASE WHEN paid_at IS NULL     THEN total  ELSE 0 END), 0) AS unpaid_revenue,
            COALESCE(AVG(total), 0)                                           AS aov,
            COALESCE(SUM(discount), 0)                                        AS total_discount,
            COALESCE(SUM(tax), 0)                                             AS total_tax,
            COALESCE(SUM(shipping), 0)                                        AS total_shipping,
            COUNT(CASE WHEN paid_at IS NOT NULL THEN 1 END)                   AS paid_orders,
            COUNT(CASE WHEN paid_at IS NULL     THEN 1 END)                   AS unpaid_orders,
            COUNT(CASE WHEN status = \'cancelled\'  THEN 1 END)                  AS canceled_orders,
            COUNT(CASE WHEN status = \'processing\' THEN 1 END)                 AS processing_orders,
            '.$avgFulfillHoursQuery.'                                     AS avg_fulfill_hours,
            COUNT(CASE WHEN customer_email IS NOT NULL THEN 1 END)            AS with_email,
            COUNT(CASE WHEN customer_phone IS NOT NULL THEN 1 END)            AS with_phone,
            COUNT(CASE WHEN shipping_address IS NOT NULL THEN 1 END)          AS with_address
        ')->first();

        // Derived ratios
        $kpis->discount_rate = $kpis->total_revenue > 0
            ? round(($kpis->total_discount / $kpis->total_revenue) * 100, 2)
            : 0;
        $kpis->payment_success_rate = $kpis->total_orders > 0
            ? round(($kpis->paid_orders / $kpis->total_orders) * 100, 2)
            : 0;
        $kpis->cancellation_rate = $kpis->total_orders > 0
            ? round(($kpis->canceled_orders / $kpis->total_orders) * 100, 2)
            : 0;
        $kpis->email_rate = $kpis->total_orders > 0
            ? round(($kpis->with_email / $kpis->total_orders) * 100, 2)
            : 0;
        $kpis->phone_rate = $kpis->total_orders > 0
            ? round(($kpis->with_phone / $kpis->total_orders) * 100, 2)
            : 0;
        $kpis->address_rate = $kpis->total_orders > 0
            ? round(($kpis->with_address / $kpis->total_orders) * 100, 2)
            : 0;

        $byStatus = Order::selectRaw('status, COUNT(*) AS count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $dateSpine = collect();
        for ($i = 29; $i >= 0; $i--) {
            $dateSpine->push($today->copy()->subDays($i)->toDateString());
        }

        $rawDaily = Order::selectRaw('DATE(created_at) AS date, SUM(total) AS revenue, COUNT(*) AS orders')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $revenueByDay = $dateSpine->map(fn ($d) => [
            'date' => $d,
            'revenue' => (float) ($rawDaily[$d]->revenue ?? 0),
            'orders' => (int) ($rawDaily[$d]->orders ?? 0),
        ])->values();

        $monthFormatQuery = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $revenueByMonth = Order::selectRaw("$monthFormatQuery AS month, SUM(total) AS revenue")
            ->where('created_at', '>=', $oneYearAgo)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'revenue' => (float) $r->revenue]);

        $byPaymentMethod = Order::selectRaw("
                COALESCE(payment_method, 'Không rõ') AS payment_method,
                COUNT(*) AS count
            ")
            ->groupBy('payment_method')
            ->pluck('count', 'payment_method');

        // ── 6. Địa lý (tỉnh/thành từ shipping_address JSON) ──────────────────
        // Build province code → name lookup from addresses.json
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

        $byProvince = Order::selectRaw("
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

        // ── 7. Sản phẩm bán chạy ──────────────────────────────────────────────

        $topByQty = OrderItem::query()
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(8)
            ->with('product:id,name')
            ->get()
            ->map(fn ($r) => [
                'product_id' => $r->product_id,
                'product_name' => $r->product?->name, // from relation
                'total_qty' => (int) $r->total_qty,
            ]);
        $topByRevenue = OrderItem::query()
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

        $avgItemsPerOrder = OrderItem::selectRaw(
            'SUM(quantity) / NULLIF(COUNT(DISTINCT order_id), 0) AS avg'
        )->value('avg') ?? 0;

        $uniqueCustomers = Order::selectRaw(
            'COUNT(DISTINCT COALESCE(customer_email, customer_phone)) AS unique_customers'
        )->value('unique_customers') ?? 0;

        $repeatCustomers = DB::table(
            Order::selectRaw('COALESCE(customer_email, customer_phone) AS identifier, COUNT(*) AS cnt')
                ->whereRaw('COALESCE(customer_email, customer_phone) IS NOT NULL')
                ->groupBy('identifier')
                ->havingRaw('cnt > 1')
                ->getQuery(),
            'sub'
        )->count();

        $avgCLV = $uniqueCustomers > 0
            ? round($kpis->total_revenue / $uniqueCustomers, 2)
            : 0;

        $ordersPerCustomer = $uniqueCustomers > 0
            ? round($kpis->total_orders / $uniqueCustomers, 2)
            : 0;

        $customerMetrics = [
            'unique_customers' => (int) $uniqueCustomers,
            'repeat_customers' => (int) $repeatCustomers,
            'repeat_rate' => $uniqueCustomers > 0
                                        ? round(($repeatCustomers / $uniqueCustomers) * 100, 2)
                                        : 0,
            'avg_clv' => (float) $avgCLV,
            'orders_per_customer' => (float) $ordersPerCustomer,
        ];

        $softDeletedCount = Order::onlyTrashed()->count();

        return Inertia::render('dashboard/Metrics', [
            'kpis' => $kpis,
            'by_status' => $byStatus,
            'revenue_by_day' => $revenueByDay,
            'revenue_by_month' => $revenueByMonth,
            'by_payment_method' => $byPaymentMethod,
            'by_province' => $byProvince,
            'top_by_qty' => $topByQty,
            'top_by_revenue' => $topByRevenue,
            'avg_items_per_order' => round((float) $avgItemsPerOrder, 2),
            'customer_metrics' => $customerMetrics,
            'soft_deleted_count' => $softDeletedCount,
        ]);
    }
}
