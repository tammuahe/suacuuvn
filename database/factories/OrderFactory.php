<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use RuntimeException;

class OrderFactory extends Factory
{
    protected static $addressData;

    private function pickValidAddress($faker, $data)
    {
        $attempts = 0;
        do {
            $province = $faker->randomElement($data);
            $districts = $province['districts'] ?? [];
            $attempts++;
        } while (empty($districts) && $attempts < 10);

        if (empty($districts)) {
            throw new RuntimeException('Failed to find a province with associated districts.');
        }

        $attempts = 0;
        do {
            $district = $faker->randomElement($districts);
            $wards = $district['wards'] ?? [];
            $attempts++;
        } while (empty($wards) && $attempts < 10);

        if (empty($wards)) {
            throw new RuntimeException('Failed to find a district with associated wards.');
        }

        $ward = $faker->randomElement($wards);

        return [$province, $district, $ward];
    }

    public function definition(): array
    {
        $faker = $this->faker;

        // Load JSON once
        if (! self::$addressData) {
            $path = public_path('addresses.json');

            if (! file_exists($path)) {
                throw new RuntimeException("Address file not found at {$path}");
            }

            self::$addressData = json_decode(file_get_contents($path), true);

            if (! is_array(self::$addressData)) {
                throw new RuntimeException('Invalid addresses.json format');
            }
        }

        $data = self::$addressData;

        [$province, $district, $ward] = $this->pickValidAddress($faker, $data);

        $paid = $faker->boolean(70);

        $status = match (true) {
            ! $paid => 'pending',
            $faker->boolean(80) => 'delivered',
            default => $faker->randomElement(['processing', 'shipped', 'cancelled']),
        };

        $createdAt = $faker->dateTimeBetween('-365 days', 'now');

        return [
            'reference' => 'ORD-'.strtoupper(Str::random(8)),
            'status' => $status,
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
                'province' => $province['name'] ?? null,
                'province_code' => $province['code'] ?? null,
                'district_code' => $district['code'] ?? null,
                'ward_code' => $ward['code'] ?? null,
            ],
            'payment_reference' => $faker->optional()->uuid(),
            'payment_method' => $faker->optional()->randomElement([
                'cod',
                'bank_transfer',
                'credit_card',
                'e_wallet',
            ]),
            'notes' => $faker->optional()->sentence(),
            'paid_at' => $paid ? $faker->dateTimeBetween($createdAt, (clone $createdAt)->modify('+2 days')) : null,
            'created_at' => $createdAt,
            'updated_at' => now(),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function ($order) {
            $itemCount = $this->faker->biasedNumberBetween(1, 6, fn ($x) => 1 - sqrt($x));

            $items = OrderItem::factory()
                ->count($itemCount)
                ->create(['order_id' => $order->id]);

            $subtotal = $items->sum('subtotal');

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
