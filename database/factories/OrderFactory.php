<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected static $addressData;

    private function pickValidAddress($faker, $data)
    {
        do {
            $province = $faker->randomElement($data);
            $districts = $province['districts'] ?? [];
        } while (empty($districts));

        do {
            $district = $faker->randomElement($districts);
            $wards = $district['wards'] ?? [];
        } while (empty($wards));

        $ward = $faker->randomElement($wards);

        return [$province, $district, $ward];
    }

    public function definition(): array
    {
        $faker = $this->faker;

        // Load JSON once
        if (! self::$addressData) {
            $path = public_path('addresses.json');
            self::$addressData = json_decode(file_get_contents($path), true);

            if (! is_array(self::$addressData)) {
                throw new \Exception('Invalid addresses.json format');
            }
        }

        $data = self::$addressData;

        // ✅ Correct usage
        [$province, $district, $ward] = $this->pickValidAddress($faker, $data);

        // ✅ Better status logic
        $paid = $faker->boolean(70);

        $status = match (true) {
            ! $paid => 'pending',
            $faker->boolean(80) => 'delivered',
            default => $faker->randomElement(['processing', 'shipped']),
        };

        return [
            'reference' => 'ORD-'.strtoupper(Str::random(8)),

            'status' => $status,

            // will be updated later
            'tax' => 0,
            'shipping' => 0,
            'discount' => 0,
            'total' => 0,

            'customer_name' => $faker->name(),
            'customer_email' => $faker->optional()->safeEmail(),
            'customer_phone' => $faker->phoneNumber(),

            'shipping_address' => [
                'address' => $faker->randomElement([
                    'Số 12 ngõ 45',
                    'Chung cư CT1, phòng 1203',
                    'Thôn Đông',
                    'Nhà văn hóa thôn Đoài',
                ]),
                'province_code' => $province['code'],
                'district_code' => $district['code'],
                'ward_code' => $ward['code'],
            ],

            'payment_reference' => $faker->optional()->uuid(),
            'payment_method' => $faker->optional()->randomElement([
                'cod',
                'bank_transfer',
                'credit_card',
                'e_wallet',
            ]),

            'notes' => $faker->optional()->sentence(),

            'paid_at' => $paid ? $faker->dateTimeBetween('-30 days', 'now') : null,

            // ✅ time variance
            'created_at' => $faker->dateTimeBetween('-30 days', 'now'),
            'updated_at' => now(),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function ($order) {

            // ✅ better distribution of item count
            $itemCount = $this->faker->biasedNumberBetween(1, 6, fn ($x) => 1 - sqrt($x));

            $items = OrderItem::factory()
                ->count($itemCount)
                ->make();

            $subtotal = 0;

            foreach ($items as $item) {
                $item->order_id = $order->id;
                $item->save();

                $subtotal += $item->subtotal;
            }

            // ✅ realistic pricing logic
            $tax = round($subtotal * 0.1, 2);
            $shipping = rand(10000, 30000);

            $discount = $subtotal > 1000000
                ? rand(20000, 100000)
                : rand(0, 20000);

            $order->update([
                'tax' => $tax,
                'shipping' => $shipping,
                'discount' => $discount,
                'total' => max(0, $subtotal + $tax + $shipping - $discount),
            ]);
        });
    }
}
