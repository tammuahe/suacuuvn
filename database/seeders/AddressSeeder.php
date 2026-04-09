<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddressSeeder extends Seeder
{
    public function run(): void
    {
        $json = file_get_contents(public_path('addresses.json'));
        $data = json_decode($json, true);

        DB::transaction(function () use ($data) {

            foreach ($data as $province) {

                // Insert province
                DB::table('provinces')->insert([
                    'code' => $province['code'],
                    'name' => $province['name'],
                    'division_type' => $province['division_type'],
                    'codename' => $province['codename'],
                    'phone_code' => $province['phone_code'] ?? null,
                ]);

                $districtRows = [];
                $wardRows = [];

                foreach ($province['districts'] as $district) {

                    $districtRows[] = [
                        'code' => $district['code'],
                        'name' => $district['name'],
                        'division_type' => $district['division_type'],
                        'codename' => $district['codename'],
                        'province_code' => $district['province_code'],
                    ];

                    foreach ($district['wards'] as $ward) {
                        $wardRows[] = [
                            'code' => $ward['code'],
                            'name' => $ward['name'],
                            'division_type' => $ward['division_type'],
                            'codename' => $ward['codename'],
                            'district_code' => $ward['district_code'],
                        ];
                    }
                }

                if (! empty($districtRows)) {
                    DB::table('districts')->insert($districtRows);
                }

                if (! empty($wardRows)) {
                    DB::table('wards')->insert($wardRows);
                }
            }

        });
    }
}
