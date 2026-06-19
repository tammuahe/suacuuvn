<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $dateFrom = $request->query('date_from', today()->subDays(29)->toDateString());
        $dateTo = $request->query('date_to', today()->toDateString());
        $oneYearAgo = today()->subYear()->startOfDay();

        $days = (int) (new \DateTime($dateFrom))->diff(new \DateTime($dateTo))->days + 1;
        $prevDateFrom = (new \DateTime($dateFrom))->modify("-{$days} days")->format('Y-m-d');
        $prevDateTo = (new \DateTime($dateFrom))->modify('-1 day')->format('Y-m-d');

        $driver = DB::connection()->getDriverName();

        $dateFormatQuery = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m-%d')";

        $avgFulfillHoursQuery = $driver === 'sqlite'
            ? 'COALESCE(AVG(CASE WHEN paid_at IS NOT NULL THEN (julianday(paid_at) - julianday(created_at)) * 24 END), 0)'
            : 'COALESCE(AVG(CASE WHEN paid_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, created_at, paid_at) END), 0)';

        $scopedQuery = Order::query()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']);

        $prevQuery = Order::query()
            ->whereBetween('created_at', [$prevDateFrom.' 00:00:00', $prevDateTo.' 23:59:59']);

        // ─── Period comparison ─────────────────────────────────────────────────

        $currentRevenue = (float) (clone $scopedQuery)->sum('total');
        $prevRevenue = (float) (clone $prevQuery)->sum('total');
        $currentOrders = (clone $scopedQuery)->count();
        $prevOrders = (clone $prevQuery)->count();
        $currentPaidOrders = (clone $scopedQuery)->whereNotNull('paid_at')->count();

        $compared = [
            'revenue' => [
                'current' => $currentRevenue,
                'previous' => $prevRevenue,
                'change' => $prevRevenue > 0 ? round(($currentRevenue - $prevRevenue) / $prevRevenue * 100, 1) : 0,
            ],
            'orders' => [
                'current' => $currentOrders,
                'previous' => $prevOrders,
                'change' => $prevOrders > 0 ? round(($currentOrders - $prevOrders) / $prevOrders * 100, 1) : 0,
            ],
        ];

        // ─── Daily breakdown ────────────────────────────────────────────────────

        $revenueByDay = (clone $scopedQuery)
            ->selectRaw("
                {$dateFormatQuery} AS date,
                COUNT(*)     AS orders,
                SUM(total)   AS revenue,
                COALESCE(SUM(CASE WHEN paid_at IS NOT NULL THEN total END), 0) AS paid_revenue,
                COALESCE(SUM(CASE WHEN paid_at IS NULL THEN total END), 0) AS unpaid_revenue
            ")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date' => $r->date,
                'orders' => (int) $r->orders,
                'revenue' => (float) $r->revenue,
                'paid_revenue' => (float) $r->paid_revenue,
                'unpaid_revenue' => (float) $r->unpaid_revenue,
            ]);

        // ─── Order list (paginated) ────────────────────────────────────────────

        $orders = (clone $scopedQuery)
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($o) => [
                'id' => $o->id,
                'reference' => $o->reference,
                'customer_name' => $o->customer_name,
                'customer_email' => $o->customer_email,
                'customer_phone' => $o->customer_phone,
                'total' => (float) $o->total,
                'status' => $o->status,
                'payment_method' => $o->payment_method,
                'paid_at' => $o->paid_at,
                'created_at' => $o->created_at,
            ]);

        // ─── Status breakdown ───────────────────────────────────────────────────

        $byStatus = (clone $scopedQuery)
            ->selectRaw('status, COUNT(*) AS count, SUM(total) AS revenue, COALESCE(AVG(total), 0) AS aov')
            ->groupBy('status')
            ->get()
            ->map(fn ($r) => [
                'status' => $r->status,
                'count' => (int) $r->count,
                'revenue' => (float) $r->revenue,
                'aov' => round((float) $r->aov, 2),
            ]);

        // ─── Payment breakdown ──────────────────────────────────────────────────

        $byPaymentMethod = (clone $scopedQuery)
            ->selectRaw("COALESCE(payment_method, 'Không rõ') AS payment_method, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue")
            ->groupBy('payment_method')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'method' => $r->payment_method,
                'count' => (int) $r->count,
                'revenue' => (float) $r->revenue,
            ]);

        $paidRevenue = (float) (clone $scopedQuery)->whereNotNull('paid_at')->sum('total');
        $unpaidRevenue = (float) (clone $scopedQuery)->whereNull('paid_at')->sum('total');

        $paymentSuccessRate = $scopedQuery->count() > 0
            ? round((clone $scopedQuery)->whereNotNull('paid_at')->count() / $scopedQuery->count() * 100, 2)
            : 0;

        // ─── Products ───────────────────────────────────────────────────────────

        $topByQty = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']))
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->with('product:id,name')
            ->get()
            ->map(fn ($r) => [
                'product_id' => $r->product_id,
                'product_name' => $r->product?->name ?? 'Đã xoá',
                'total_qty' => (int) $r->total_qty,
                'total_revenue' => (float) $r->total_revenue,
            ]);

        $avgItemsPerOrder = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']))
            ->selectRaw('SUM(quantity) / NULLIF(COUNT(DISTINCT order_id), 0) AS avg')
            ->value('avg') ?? 0;

        // ─── Customer summary ───────────────────────────────────────────────────

        $customerBase = Order::query()
            ->whereNull('deleted_at')
            ->where(function ($q) {
                $q->whereNotNull('customer_email')->orWhereNotNull('customer_phone');
            })
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']);

        $uniqueCustomers = (int) (clone $customerBase)
            ->selectRaw('COUNT(DISTINCT COALESCE(customer_email, customer_phone)) AS cnt')
            ->value('cnt');

        $repeatCustomers = (int) DB::table(
            (clone $customerBase)
                ->selectRaw('COALESCE(customer_email, customer_phone) AS identifier, COUNT(*) AS cnt')
                ->groupBy('identifier')
                ->havingRaw('cnt > 1'),
            'sub'
        )->count();

        $customerRevenue = (float) (clone $customerBase)->sum('total');

        $customerSummary = [
            'unique_customers' => $uniqueCustomers,
            'repeat_customers' => $repeatCustomers,
            'repeat_rate' => $uniqueCustomers > 0 ? round(($repeatCustomers / $uniqueCustomers) * 100, 1) : 0,
            'new_customers' => $uniqueCustomers - $repeatCustomers,
            'avg_clv' => $uniqueCustomers > 0 ? round($customerRevenue / $uniqueCustomers, 2) : 0,
            'orders_per_customer' => $uniqueCustomers > 0 ? round($currentOrders / $uniqueCustomers, 2) : 0,
        ];

        // ─── Pricing & Cost ─────────────────────────────────────────────────────

        $netRevenue = (float) (clone $scopedQuery)->sum(DB::raw('total - tax - shipping'));
        $totalDiscount = (float) (clone $scopedQuery)->sum('discount');
        $totalTax = (float) (clone $scopedQuery)->sum('tax');
        $totalShipping = (float) (clone $scopedQuery)->sum('shipping');

        $discountRate = $currentRevenue > 0 ? round(($totalDiscount / $currentRevenue) * 100, 2) : 0;

        $revenueBreakdown = [
            'net_revenue' => $netRevenue,
            'discount' => $totalDiscount,
            'tax' => $totalTax,
            'shipping' => $totalShipping,
        ];

        // ─── Geography ──────────────────────────────────────────────────────────

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
                {$provinceCodeExtract} AS province_code,
                COUNT(*)    AS orders,
                SUM(total)  AS revenue
            ")
            ->whereRaw("{$provinceCodeExtract} IS NOT NULL")
            ->whereRaw("{$provinceCodeExtract} NOT IN ('null', '', 'undefined', '0')")
            ->groupBy('province_code')
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($r) use ($provinceMap) {
                $code = (int) $r->province_code;

                return [
                    'province' => $provinceMap[$code] ?? "Tỉnh #{$code}",
                    'orders' => (int) $r->orders,
                    'revenue' => (float) $r->revenue,
                ];
            });

        // ─── Operations ─────────────────────────────────────────────────────────

        $avgFulfillHours = (float) (clone $scopedQuery)->selectRaw($avgFulfillHoursQuery.' AS val')->value('val');

        $cancellationRate = $scopedQuery->count() > 0
            ? round((clone $scopedQuery)->where('status', 'cancelled')->count() / $scopedQuery->count() * 100, 2)
            : 0;

        $processingOrders = (clone $scopedQuery)->where('status', 'processing')->count();
        $softDeletedCount = Order::onlyTrashed()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->count();

        // ─── Revenue by month ──────────────────────────────────────────────────

        $monthFormatQuery = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $revenueByMonth = Order::query()
            ->selectRaw("{$monthFormatQuery} AS month, SUM(total) AS revenue")
            ->where('created_at', '>=', $oneYearAgo)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => ['month' => $r->month, 'revenue' => (float) $r->revenue]);

        return Inertia::render('dashboard/Reports', [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'compared' => $compared,
            'revenue_by_day' => $revenueByDay,
            'orders' => $orders,
            'by_status' => $byStatus,
            'by_payment_method' => $byPaymentMethod,
            'paid_revenue' => $paidRevenue,
            'unpaid_revenue' => $unpaidRevenue,
            'payment_success_rate' => $paymentSuccessRate,
            'top_products' => $topByQty,
            'avg_items_per_order' => round((float) $avgItemsPerOrder, 2),
            'customer_summary' => $customerSummary,
            'revenue_breakdown' => $revenueBreakdown,
            'total_discount' => $totalDiscount,
            'discount_rate' => $discountRate,
            'total_tax' => $totalTax,
            'total_shipping' => $totalShipping,
            'total_revenue' => $currentRevenue,
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
            'orders' => $this->exportOrders($dateFrom, $dateTo),
            'daily' => $this->exportDaily($dateFrom, $dateTo),
            'products' => $this->exportProducts($dateFrom, $dateTo),
            'customers' => $this->exportCustomers($dateFrom, $dateTo),
            'provinces' => $this->exportProvinceData($dateFrom, $dateTo),
            'payments' => $this->exportPayments($dateFrom, $dateTo),
            default => abort(404, 'Section not found'),
        };

        $filename = "bao-cao-{$section}-{$dateFrom}-{$dateTo}.xlsx";

        return response()->streamDownload(function () use ($data) {
            $writer = new Writer;
            $writer->openToBrowser('php://output');

            if ($data->isNotEmpty()) {
                $writer->addRow(Row::fromValues(array_keys($data->first())));
                foreach ($data as $row) {
                    $writer->addRow(Row::fromValues(array_values($row)));
                }
            }

            $writer->close();
        }, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    private function exportOrders(string $dateFrom, string $dateTo): Collection
    {
        return Order::query()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($o) => [
                'Mã đơn' => $o->reference,
                'Khách hàng' => $o->customer_name ?? '',
                'Email' => $o->customer_email ?? '',
                'SĐT' => $o->customer_phone ?? '',
                'Tổng tiền' => (float) $o->total,
                'Giảm giá' => (float) $o->discount,
                'Thuế' => (float) $o->tax,
                'Phí vận chuyển' => (float) $o->shipping,
                'Phương thức TT' => $o->payment_method ?? '',
                'Trạng thái' => $o->status,
                'Đã thanh toán' => $o->paid_at ? 'Có' : 'Chưa',
                'Ngày tạo' => $o->created_at,
            ]);
    }

    private function exportDaily(string $dateFrom, string $dateTo): Collection
    {
        $driver = DB::connection()->getDriverName();
        $dateFormat = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m-%d')";

        return Order::query()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->selectRaw("
                {$dateFormat} AS date,
                COUNT(*)     AS orders,
                SUM(total)   AS revenue,
                COALESCE(AVG(total), 0) AS aov,
                COUNT(CASE WHEN paid_at IS NOT NULL THEN 1 END) AS paid_orders
            ")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'Ngày' => $r->date,
                'Số đơn' => (int) $r->orders,
                'Doanh thu' => (float) $r->revenue,
                'Đơn đã TT' => (int) $r->paid_orders,
                'Giá trị TB' => round((float) $r->aov, 2),
            ]);
    }

    private function exportProducts(string $dateFrom, string $dateTo): Collection
    {
        return OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59']))
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'), DB::raw('AVG(subtotal / NULLIF(quantity, 0)) as avg_price'))
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->with('product:id,name')
            ->get()
            ->map(fn ($r) => [
                'Sản phẩm' => $r->product?->name ?? 'Đã xoá',
                'Số lượng bán' => (int) $r->total_qty,
                'Doanh thu' => (float) $r->total_revenue,
                'Giá bán TB' => round((float) ($r->avg_price ?? 0), 2),
            ]);
    }

    private function exportCustomers(string $dateFrom, string $dateTo): Collection
    {
        return Order::query()
            ->whereNull('deleted_at')
            ->where(function ($q) {
                $q->whereNotNull('customer_email')->orWhereNotNull('customer_phone');
            })
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->selectRaw('
                COALESCE(customer_email, customer_phone) AS identifier,
                MAX(customer_name) AS customer_name,
                MAX(customer_email) AS customer_email,
                MAX(customer_phone) AS customer_phone,
                COUNT(*) AS order_count,
                COALESCE(SUM(total), 0) AS total_spent,
                MIN(created_at) AS first_order
            ')
            ->groupBy('identifier')
            ->orderByDesc('total_spent')
            ->get()
            ->map(fn ($c) => [
                'Khách hàng' => $c->customer_name ?? 'Khách vãng lai',
                'Email' => $c->customer_email ?? '',
                'SĐT' => $c->customer_phone ?? '',
                'Số đơn' => (int) $c->order_count,
                'Tổng chi tiêu' => (float) $c->total_spent,
                'Lần đầu' => $c->first_order,
            ]);
    }

    private function exportProvinceData(string $dateFrom, string $dateTo): Collection
    {
        $driver = DB::connection()->getDriverName();

        $provinceCodeExtract = $driver === 'sqlite'
            ? "json_extract(shipping_address, '$.province_code')"
            : "JSON_UNQUOTE(JSON_EXTRACT(shipping_address, '$.province_code'))";

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

        return Order::query()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->selectRaw("
                {$provinceCodeExtract} AS province_code,
                COUNT(*)    AS orders,
                SUM(total)  AS revenue
            ")
            ->whereRaw("{$provinceCodeExtract} IS NOT NULL")
            ->whereRaw("{$provinceCodeExtract} NOT IN ('null', '', 'undefined', '0')")
            ->groupBy('province_code')
            ->orderByDesc('revenue')
            ->get()
            ->map(function ($r) use ($provinceMap) {
                return [
                    'Tỉnh/Thành' => $provinceMap[(int) $r->province_code] ?? "Tỉnh #{$r->province_code}",
                    'Số đơn' => (int) $r->orders,
                    'Doanh thu' => (float) $r->revenue,
                ];
            });
    }

    private function exportPayments(string $dateFrom, string $dateTo): Collection
    {
        return Order::query()
            ->whereBetween('created_at', [$dateFrom.' 00:00:00', $dateTo.' 23:59:59'])
            ->selectRaw("COALESCE(payment_method, 'Không rõ') AS method, COUNT(*) AS count, SUM(total) AS revenue, COALESCE(AVG(total), 0) AS aov")
            ->groupBy('method')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($r) => [
                'Phương thức' => $r->method,
                'Số đơn' => (int) $r->count,
                'Doanh thu' => (float) $r->revenue,
                'Giá trị TB' => round((float) $r->aov, 2),
            ]);
    }
}
