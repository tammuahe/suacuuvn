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
                'sku' => 'SUREGOLD350',
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/12/Sure-gold-400x400.png',
                'description' => 'Sữa Cừu Organic Thuần Khiết Dinh Dưỡng Đặc Biệt (SURE GOLD) với nguyên liệu Sữa cừu nhập khẩu New Zealand. Với ưu điểm là hàm lượng dưỡng chất vượt trội hơn hẳn so với sữa bò, giàu Canxi, Phospho, cùng hàm lượng Đạm A2 cao. Sữa cừu Organic Sure Gold đặc biệt phù hợp với những người muốn bổ sung dưỡng chất, bồi bổ cơ thể, tốt cho hệ tiêu hóa và chuyển hóa. Sản phẩm có mùi thơm ngậy đặc trưng của sữa cừu, vị ngọt dịu, dễ uống.',
                'detailed_description' => "SỮA CỪU ORGANIC SURE GOLD – DINH DƯỠNG TOÀN DIỆN CHO CẢ GIA ĐÌNH\nTinh túy từ nguồn sữa cừu hữu cơ New Zealand – vùng đất nổi tiếng với đàn cừu được chăn thả tự nhiên 100%, ăn cỏ sạch quanh năm, không hormone, không kháng sinh, mang đến nguồn sữa tinh khiết và an toàn tuyệt đối.\n\nLà “siêu thực phẩm tự nhiên”, sữa cừu Sure Gold chứa hàm lượng đạm, canxi, photpho và vitamin thiết yếu cao, cung cấp năng lượng và dưỡng chất toàn diện cho mọi lứa tuổi.\n\n💠 Đạm A2 tự nhiên – dễ hấp thu, giảm gánh nặng tiêu hóa, phù hợp cho người lớn tuổi, trẻ nhỏ, người có hệ tiêu hóa nhạy cảm.\n💠 Hàm lượng Canxi, Phospho, Lysine cao – hỗ trợ phát triển chiều cao, xương răng chắc khỏe, hạn chế loãng xương.\n💠 Dinh dưỡng đậm đặc, năng lượng cao – lý tưởng cho người cần tăng cân, phục hồi thể trạng, phụ nữ sau sinh.\n💠 Giàu Vitamin A, D, Kẽm – tăng đề kháng, nâng cao miễn dịch.\n💠 Chống oxy hóa tự nhiên (CLA & peptide sinh học) – bảo vệ tim mạch, giảm viêm, chống lão hóa.\n\n“Một sản phẩm – nhiều lợi ích sức khỏe – tiện dụng cho cả gia đình”\n\nLỢI ÍCH ĐẾN TỪ SỮA CỪU ORGANIC SURE GOLD\n\nBổ sung dinh dưỡng & tăng cường sức khỏe\nNâng cao hệ miễn dịch, tăng cường sức đề kháng\nHỗ trợ sức khỏe đường ruột, nhẹ tiêu hóa.\nDuy trì sức khỏe tim mạch và xương khớp",
            ],
            [
                'name' => 'Sữa Cừu Organic Thuần Khiết Dinh Dưỡng Đặc Biệt 650g (SURE GOLD)',
                'price' => 1250000,
                'discount' => 0.21,
                'sku' => 'SUREGOLD650',
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/12/Loi-ich-sure-gold-510x510.png',
                'description' => 'Sữa Cừu Organic Thuần Khiết Dinh Dưỡng Đặc Biệt (SURE GOLD) với nguyên liệu Sữa cừu nhập khẩu New Zealand. Với ưu điểm là hàm lượng dưỡng chất vượt trội hơn hẳn so với sữa bò, giàu Canxi, Phospho, cùng hàm lượng Đạm A2 cao. Sữa cừu Organic Sure Gold đặc biệt phù hợp với những người muốn bổ sung dưỡng chất, bồi bổ cơ thể, tốt cho hệ tiêu hóa và chuyển hóa. Sản phẩm có mùi thơm ngậy đặc trưng của sữa cừu, vị ngọt dịu, dễ uống.',
                'detailed_description' => "SỮA CỪU ORGANIC SURE GOLD – DINH DƯỠNG TOÀN DIỆN CHO CẢ GIA ĐÌNH\n".
                "Tinh túy từ nguồn sữa cừu hữu cơ New Zealand – vùng đất nổi tiếng với đàn cừu được chăn thả tự nhiên 100%, ăn cỏ sạch quanh năm, không hormone, không kháng sinh, mang đến nguồn sữa tinh khiết và an toàn tuyệt đối.\n\n".
                "Là “siêu thực phẩm tự nhiên”, sữa cừu Sure Gold chứa hàm lượng đạm, canxi, photpho và vitamin thiết yếu cao, cung cấp năng lượng và dưỡng chất toàn diện cho mọi lứa tuổi.\n\n".
                "💠 Đạm A2 tự nhiên – dễ hấp thu, giảm gánh nặng tiêu hóa, phù hợp cho người lớn tuổi, trẻ nhỏ, người có hệ tiêu hóa nhạy cảm.\n".
                "💠 Hàm lượng Canxi, Phospho, Lysine cao – hỗ trợ phát triển chiều cao, xương răng chắc khỏe, hạn chế loãng xương.\n".
                "💠 Dinh dưỡng đậm đặc, năng lượng cao – lý tưởng cho người cần tăng cân, phục hồi thể trạng, phụ nữ sau sinh.\n".
                "💠 Giàu Vitamin A, D, Kẽm – tăng đề kháng, nâng cao miễn dịch.\n".
                "💠 Chống oxy hóa tự nhiên (CLA & peptide sinh học) – bảo vệ tim mạch, giảm viêm, chống lão hóa.\n\n".
                "“Một sản phẩm – nhiều lợi ích sức khỏe – tiện dụng cho cả gia đình”\n\n".
                "LỢI ÍCH ĐẾN TỪ SỮA CỪU ORGANIC SURE GOLD\n\n".
                "Bồi bổ cơ thể & tăng cường sức khỏe\n".
                "Hỗ trợ sức khỏe đường ruột, nhẹ tiêu hóa\n".
                "Nâng cao hệ miễn dịch, tăng cường sức đề kháng\n".
                'Tốt cho sức khỏe tim mạch và xương khớp',
            ],
            [
                'name' => 'Sữa Cừu Organic Thuần Khiết Tiểu Đường, Tim Mạch 350g (DIABETES)',
                'price' => 750000,
                'discount' => 0.24,
                'sku' => 'DIABETES350',
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/10/Sua-cuu-diabetes-510x510.png',
                'description' => 'Sữa Cừu Organic Tiểu Đường, Tim Mạch (DIABETES) giúp hỗ trợ cân bằng đường huyết và cải thiện sức khỏe tim mạch. Sản phẩm với nguyên liệu là sữa cừu hữu cơ giàu đạm A2 dễ tiêu hóa, tốt cho người tiểu đường và tim mạch. Giảm nguy cơ biến chứng và duy trì sức khỏe toàn diện.',
                'detailed_description' => "SỮA CỪU ORGANIC DIABETES – DINH DƯỠNG CHUYÊN BIỆT CHO NGƯỜI TIỂU ĐƯỜNG, TIM MẠCH\n\n".
                "Sữa Cừu Organic Diabetes mang đến giải pháp dinh dưỡng y học thế hệ mới giúp kiểm soát đường huyết, ổn định chuyển hóa và bảo vệ tim mạch.\n".
                "💠 Nguồn sữa cừu tinh khiết New Zealand – giàu đạm A2 tự nhiên, dễ tiêu hóa, ít dị ứng, cung cấp dinh dưỡng đậm đặc nhưng kiểm soát đường nghiêm ngặt.\n".
                "💠 Isomalt – đường ngọt lành có chỉ số GI < 10, giúp hạn chế tăng đường huyết, hỗ trợ kiểm soát cân nặng và hệ tiêu hóa khỏe mạnh.\n".
                "💠 Vitamin nhóm B cao – hỗ trợ chuyển hóa đường – mỡ – năng lượng, giúp giảm nguy cơ rối loạn thần kinh do tiểu đường.\n".
                "💠 Magie và nhóm chống oxy hóa (C, E, Selen, Kẽm) – giúp duy trì năng lượng tế bào, ổn định hoạt động của insulin và giảm stress oxy hóa.\n".
                "💠 Công thức chuyên biệt đáp ứng nhu cầu dinh dưỡng cho người tiểu đường, tim mạch, đồng thời củng cố sức khỏe tổng thể và tăng sức bền tế bào.\n\n".
                "Sữa Cừu Organic Diabetes – kiểm soát đường huyết, tốt cho tim mạch và chuyển hóa bền vững.\n\n".
                "Lợi ích đến từ sản phẩm\n\n".
                "Hỗ trợ kiểm soát đường huyết ổn định\n".
                "Củng cố sức khỏe tim mạch\n".
                "Tăng cường sức đề kháng\n".
                "Giảm thiểu nguy cơ biến chứng do Tiểu đường\n".
                "Cung cấp năng lượng\n\n".
                "Lý do chọn loại 350g:\n\n".
                "Gọn nhẹ, dễ dàng mang theo hoặc sử dụng cho các gia đình nhỏ.\n".
                'Tiện lợi trong việc bảo quản và sử dụng lâu dài.',
            ],
            [
                'name' => 'Sữa Cừu Organic Thuần Khiết Tiểu Đường, Tim Mạch 650g (DIABETES)',
                'price' => 1250000,
                'sku' => 'DIABETES650',
                'discount' => 0.21,
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2024/10/Sua-cuu-diabetes-510x510.png',
                'description' => 'Sữa Cừu Organic Tiểu Đường, Tim Mạch (DIABETES) giúp hỗ trợ cân bằng đường huyết và cải thiện sức khỏe tim mạch. Sản phẩm với nguyên liệu là sữa cừu hữu cơ giàu đạm A2 dễ tiêu hóa, tốt cho người tiểu đường và tim mạch. Giảm nguy cơ biến chứng và duy trì sức khỏe toàn diện.',
                'detailed_description' => "SỮA CỪU ORGANIC DIABETES – DINH DƯỠNG CHUYÊN BIỆT CHO NGƯỜI TIỂU ĐƯỜNG, TIM MẠCH.\n\n".
                "Sữa Cừu Organic Diabetes mang đến giải pháp dinh dưỡng y học thế hệ mới giúp kiểm soát đường huyết, ổn định chuyển hóa và bảo vệ tim mạch.\n".
                "💠 Nguồn sữa cừu tinh khiết New Zealand – giàu đạm A2 tự nhiên, dễ tiêu hóa, ít dị ứng, cung cấp dinh dưỡng đậm đặc.\n".
                "💠 Isomalt(GI < 10): hạn chế tăng đường huyết, hỗ trợ kiểm soát cân nặng.\n".
                "💠 Vitamin nhóm B cao – hỗ trợ chuyển hóa đường – mỡ – năng lượng, giảm nguy cơ rối loạn thần kinh do tiểu đường.\n".
                "💠 Magie và nhóm chống oxy hóa (C, E, Selen, Kẽm) – giúp duy trì năng lượng tế bào, ổn định hoạt động của insulin và giảm stress oxy hóa.\n".
                "💠 Công thức chuyên biệt đáp ứng nhu cầu dinh dưỡng cho người tiểu đường, tim mạch, đồng thời củng cố sức khỏe tổng thể.\n\n".
                "Sữa Cừu Organic Diabetes – kiểm soát đường huyết, tốt cho tim mạch và chuyển hóa bền vững.\n\n".
                "Lợi ích đến từ sản phẩm:\n\n".
                "Hỗ trợ kiểm soát đường huyết ổn định\n".
                "Củng cố sức khỏe tim mạch\n".
                "Tăng cường sức đề kháng\n".
                "Giảm thiểu nguy cơ biến chứng do Tiểu đường\n".
                "Cung cấp năng lượng\n\n".
                "Lý do chọn loại 350g:\n\n".
                "Gọn nhẹ, dễ dàng mang theo hoặc sử dụng cho các gia đình nhỏ.\n".
                'Tiện lợi trong việc bảo quản và sử dụng lâu dài.',
            ],
            [
                'name' => 'Sữa Cừu Organic Xương Khớp 350g (Canxi)',
                'price' => 750000,
                'discount' => 0.24,
                'sku' => 'CANXI350',
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2025/11/z7355642459730_fb72a5dc41d9eaadee2aad1d7707f8dd-510x510.jpg',
                'description' => 'Sữa Cừu Organic Xương Khớp – nguyên liệu nhập khẩu New Zealand, giàu canxi sinh học tự nhiên và Vitamin D, hỗ trợ xương khớp khỏe mạnh, phát triển chiều cao và dễ tiêu hóa. Sản phẩm có mùi thơm ngậy đặc trưng của sữa cừu, vị ngọt dịu, dễ uống.',
                'detailed_description' => "SỮA CỪU ORGANIC CALCI XƯƠNG KHỚP – KHỎE TỪ GỐC, DẺO DAI MỖI NGÀY\n\n".
                "Sữa Cừu Organic Xương Khớp 350g là dòng sữa hữu cơ chất lượng cao, với nguyên liệu sữa nhập khẩu trực tiếp từ New Zealand, mang lại nguồn dưỡng chất hoàn hảo để chăm sóc sức khỏe xương khớp. Với quy trình sản xuất khép kín và đạt tiêu chuẩn hữu cơ quốc tế, sản phẩm đảm bảo chất lượng, an toàn và thân thiện với mọi thành viên trong gia đình.\n\n".
                "Điểm nổi bật của Sữa Cừu Organic Xương Khớp 350g:\n\n".
                "Khác biệt từ nguồn sữa tinh túy New Zealand – vùng đất của những đàn cừu hữu cơ cho dòng sữa giàu đạm A2 tự nhiên, canxi, lysine, và vitamin B12, giúp tăng hấp thu – giảm dị ứng – hỗ trợ phục hồi xương khớp.\n".
                "Hàm lượng dinh dưỡng cao hơn sữa bò 30–50%, là lựa chọn tối ưu cho người lớn tuổi, người đau nhức xương khớp, sau chấn thương hoặc trẻ phát triển chiều cao.\n\n".
                "💠 Collagen Type II không biến tính – tái tạo sụn, giảm đau khớp, tăng linh hoạt vận động.\n".
                "💠 Canxi sinh học tự nhiên + Vitamin D3 – hấp thu gấp 2 lần, giúp xương chắc, khớp khỏe, ngừa loãng xương.\n".
                "💠 Đạm và acid amin thiết yếu (Lysine, Tryptophan) – tái tạo cơ xương, giảm mỏi, tăng sức bền.\n".
                "💠 MCT – năng lượng sạch dễ hấp thu, giúp cơ thể dẻo dai, tỉnh táo mỗi ngày.\n\n".
                "Sữa Cừu Organic Canxi AAiPharma – công thức dinh dưỡng y học giúp xương chắc, khớp linh hoạt, cơ thể khỏe mạnh từ bên trong.\n\n".
                "LỢI ÍCH ĐẾN TỪ SẢN PHẨM\n\n".
                "Bổ sung dưỡng chất, tăng cường sức khỏe\n".
                "Giúp xương chắc khỏe\n".
                "Hỗ trợ khớp vận động linh hoạt\n".
                'Hỗ trợ duy trì sức khỏe khớp, hạn chế các vấn đề khớp do tuổi tác',
            ],
            [
                'name' => 'Sữa Cừu Organic Xương Khớp 650g (Canxi)',
                'price' => 1250000,
                'discount' => 0.21,
                'sku' => 'CANXI650',
                'image_url' => 'https://aaipharma.vn/wp-content/uploads/2025/05/canxi-650g-1-510x510.png',
                'description' => 'Sữa Cừu Organic Xương Khớp – nguyên liệu nhập khẩu New Zealand, giàu canxi sinh học tự nhiên và Vitamin D, hỗ trợ xương khớp khỏe mạnh, phát triển chiều cao và dễ tiêu hóa.',
                'detailed_description' => "SỮA CỪU ORGANIC CANXI XƯƠNG KHỚP – KHỎE TỪ GỐC, DẺO DAI MỖI NGÀY\n\n".
                "Sữa Cừu Organic Xương Khớp 650g là dòng sữa hữu cơ chất lượng cao, với nguyên liệu sữa nhập khẩu trực tiếp từ New Zealand, mang lại nguồn dưỡng chất hoàn hảo để chăm sóc sức khỏe xương khớp. Với quy trình sản xuất khép kín và đạt tiêu chuẩn hữu cơ quốc tế, sản phẩm đảm bảo chất lượng, an toàn và thân thiện với mọi thành viên trong gia đình.\n\n".
                "Điểm nổi bật của Sữa Cừu Organic Xương Khớp 650g:\n\n".
                "Khác biệt từ nguồn sữa tinh túy New Zealand – vùng đất của những đàn cừu hữu cơ cho dòng sữa giàu đạm A2 tự nhiên, canxi, lysine, và vitamin B12, giúp tăng hấp thu – giảm dị ứng – hỗ trợ phục hồi xương khớp.\n".
                "Hàm lượng dinh dưỡng cao hơn sữa bò 30–50%, là lựa chọn tối ưu cho người lớn tuổi, người đau nhức xương khớp, sau chấn thương hoặc trẻ phát triển chiều cao.\n\n".
                "💠 Collagen Type II không biến tính – tái tạo sụn, giảm đau khớp, tăng linh hoạt vận động.\n".
                "💠 Canxi sinh học tự nhiên + Vitamin D3 – hấp thu gấp 2 lần, giúp xương chắc, khớp khỏe, ngừa loãng xương.\n".
                "💠 Đạm và acid amin thiết yếu (Lysine, Tryptophan) – tái tạo cơ xương, giảm mỏi, tăng sức bền.\n".
                "💠 MCT – năng lượng sạch dễ hấp thu, giúp cơ thể dẻo dai, tỉnh táo mỗi ngày.\n\n".
                "Sữa Cừu Organic Canxi AAiPharma – công thức dinh dưỡng y học giúp xương chắc, khớp linh hoạt, cơ thể khỏe mạnh từ bên trong.\n\n".
                "LỢI ÍCH ĐẾN TỪ SẢN PHẨM\n\n".
                "Bổ sung dưỡng chất, tăng cường sức khỏe\n".
                "Giúp xương chắc khỏe\n".
                "Hỗ trợ khớp vận động linh hoạt\n".
                'Hỗ trợ duy trì sức khỏe khớp, hạn chế các vấn đề khớp do tuổi tác',
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
