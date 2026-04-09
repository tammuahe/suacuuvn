<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Sữa Cừu Organic Thuần Khiết Dinh Dưỡng Đặc Biệt 350g (SURE GOLD)',
                'price' => 750000,
                'discount' => 0.24,
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/12/Sure-gold-400x400.png',
            ],
            [
                'name' => 'Sữa Cừu Organic Thuần Khiết Dinh Dưỡng Đặc Biệt 650g (SURE GOLD)',
                'price' => 1250000,
                'discount' => 0.21,
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/12/Loi-ich-sure-gold-510x510.png',
            ],
            [
                'name' => 'Sữa Cừu Organic Thuần Khiết Tiểu Đường, Tim Mạch 350g (DIABETES)',
                'price' => 750000,
                'discount' => 0.24,
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/10/Sua-cuu-diabetes-510x510.png',
            ],
            [
                'name' => 'Sữa Cừu Organic Thuần Khiết Tiểu Đường, Tim Mạch 650g (DIABETES)',
                'price' => 1250000,
                'discount' => 0.21,
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/10/Sua-cuu-diabetes-510x510.png',
            ],
            [
                'name' => 'Sữa Cừu Organic Xương Khớp 350g (Canxi)',
                'price' => 750000,
                'discount' => 0.24,
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2025/11/z7355642459730_fb72a5dc41d9eaadee2aad1d7707f8dd-510x510.jpg',
            ],
            [
                'name' => 'Sữa Cừu Organic Xương Khớp 650g (Canxi)',
                'price' => 1250000,
                'discount' => 0.21,
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2025/05/canxi-650g-1-510x510.png',
            ],
        ];

        foreach ($products as $product) {
            DB::table('products')->insertOrIgnore([
                ...$product,
                'slug' => Str::slug($product['name']),
                'stock_quantity' => 999,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
