<?php

namespace App\Http\Controllers;

use App\Models\Order;
use DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $sort = $request->query('sort', 'total_spent');
        $direction = $request->query('direction', 'desc');
        $allowedSorts = ['customer_name', 'order_count', 'total_spent', 'last_order_date'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'total_spent';
        }
        if (! in_array($direction, ['asc', 'desc'], true)) {
            $direction = 'desc';
        }

        $baseQuery = Order::query()
            ->whereNull('deleted_at')
            ->where(function ($q) {
                $q->whereNotNull('customer_email')
                    ->orWhereNotNull('customer_phone');
            });

        $identifierExpr = DB::raw('COALESCE(customer_email, customer_phone)');

        $customersQuery = Order::query()
            ->whereNull('deleted_at')
            ->where(function ($q) {
                $q->whereNotNull('customer_email')
                    ->orWhereNotNull('customer_phone');
            })
            ->selectRaw('
                COALESCE(customer_email, customer_phone) AS identifier,
                MAX(customer_name) AS customer_name,
                MAX(customer_email) AS customer_email,
                MAX(customer_phone) AS customer_phone,
                MAX(shipping_address) AS shipping_address,
                COUNT(*) AS order_count,
                COALESCE(SUM(total), 0) AS total_spent,
                MAX(created_at) AS last_order_date,
                MIN(created_at) AS first_order_date
            ')
            ->groupBy('identifier');

        if ($search) {
            $customersQuery->havingRaw('MAX(customer_name) LIKE ? OR MAX(customer_email) LIKE ? OR MAX(customer_phone) LIKE ?', [
                "%{$search}%",
                "%{$search}%",
                "%{$search}%",
            ]);
        }

        $customersQuery->orderBy($sort, $direction);

        $customers = $customersQuery->paginate(20)->withQueryString();

        $uniqueCustomers = (int) $baseQuery
            ->selectRaw('COUNT(DISTINCT COALESCE(customer_email, customer_phone)) AS cnt')
            ->value('cnt');

        $repeatCustomers = (int) DB::table(
            Order::query()
                ->selectRaw('COALESCE(customer_email, customer_phone) AS identifier, COUNT(*) AS cnt')
                ->whereNull('deleted_at')
                ->where(function ($q) {
                    $q->whereNotNull('customer_email')
                        ->orWhereNotNull('customer_phone');
                })
                ->groupBy('identifier')
                ->havingRaw('cnt > 1')
                ->getQuery(),
            'sub'
        )->count();

        $totalRevenue = (float) $baseQuery->sum('total');

        $totalOrders = $baseQuery->count();

        $kpis = [
            'unique_customers' => $uniqueCustomers,
            'repeat_customers' => $repeatCustomers,
            'repeat_rate' => $uniqueCustomers > 0 ? round(($repeatCustomers / $uniqueCustomers) * 100, 2) : 0,
            'avg_clv' => $uniqueCustomers > 0 ? round($totalRevenue / $uniqueCustomers, 2) : 0,
            'orders_per_customer' => $uniqueCustomers > 0 ? round($totalOrders / $uniqueCustomers, 2) : 0,
        ];

        return Inertia::render('dashboard/Customers', [
            'customers' => $customers,
            'kpis' => $kpis,
            'search' => $search,
            'sort' => $sort,
            'direction' => $direction,
        ]);
    }

    public function show(string $identifier): JsonResponse
    {
        $customer = Order::query()
            ->whereNull('deleted_at')
            ->where(function ($q) use ($identifier) {
                $q->where('customer_email', $identifier)
                    ->orWhere('customer_phone', $identifier);
            })
            ->selectRaw('
                COALESCE(customer_email, customer_phone) AS identifier,
                MAX(customer_name) AS customer_name,
                MAX(customer_email) AS customer_email,
                MAX(customer_phone) AS customer_phone,
                MAX(shipping_address) AS shipping_address,
                COUNT(*) AS order_count,
                COALESCE(SUM(total), 0) AS total_spent,
                MAX(created_at) AS last_order_date,
                MIN(created_at) AS first_order_date
            ')
            ->groupBy('identifier')
            ->first();

        if (! $customer) {
            abort(404);
        }

        $orders = Order::query()
            ->where(function ($q) use ($identifier) {
                $q->where('customer_email', $identifier)
                    ->orWhere('customer_phone', $identifier);
            })
            ->whereNull('deleted_at')
            ->orderByDesc('created_at')
            ->get(['id', 'reference', 'total', 'status', 'paid_at', 'created_at']);

        $customer->avg_order_value = $customer->order_count > 0
            ? round($customer->total_spent / $customer->order_count, 2)
            : 0;

        return response()->json([
            'customer' => $customer,
            'orders' => $orders,
        ]);
    }
}
