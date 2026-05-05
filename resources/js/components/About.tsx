import { motion } from 'framer-motion';
import React from 'react';

export default function About() {
    return (
        <div className="px-6 lg:px-16">
            {/* Section Title */}
            <motion.h1
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="my-8 scroll-mt-32 text-5xl font-extrabold text-md-on-primary-fixed-variant lg:text-7xl"
                id="about"
            >
                Về chúng tôi
            </motion.h1>

            {/* Intro Section */}
            <div className="grid gap-10 lg:grid-cols-2">
                {/* Text */}
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="max-w-2xl text-lg leading-relaxed font-medium text-md-on-primary-fixed-variant lg:text-xl"
                >
                    Viện khoa học dược liệu Việt Nam – AAiPharma là đơn vị vinh
                    dự đạt hạng Vàng Thương hiệu số 1 Việt Nam trong lĩnh vực
                    Dinh dưỡng y học do Trung tâm nghiên cứu phát triển doanh
                    nghiệp Châu Á tại chương trình VIETNAM No.1 Brand Awards
                    2025 bình chọn. Chúng tôi luôn không ngừng nỗ lực cải tiến,
                    nghiên cứu và mang đến những sản phẩm dinh dưỡng tinh khiết
                    – an toàn – phù hợp nhất với thể trạng người Việt.
                </motion.h2>

                {/* Image */}
                <motion.img
                    src="award.jpg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="max-h-100 w-full rounded-2xl object-contain"
                />
            </div>

            {/* Awards Header */}
            <div className="mx-auto my-20 max-w-3xl text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl font-bold text-md-on-background lg:text-4xl"
                >
                    Thương hiệu được tin dùng
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-4 text-lg leading-relaxed text-md-on-background"
                >
                    AAiPharma tự hào đạt nhiều chứng nhận uy tín, khẳng định cam
                    kết về chất lượng và sức khỏe người tiêu dùng.
                </motion.h2>
            </div>

            {/* Awards Grid */}
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                    hidden: {},
                    show: {
                        transition: { staggerChildren: 0.15 },
                    },
                }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
                {[
                    {
                        img: 'iso22000.png',
                        title: 'Chứng nhận ISO 22000',
                        desc: 'Tiêu chuẩn quốc tế về hệ thống quản lý an toàn thực phẩm.',
                    },
                    {
                        img: 'Rectangle-15-1.png',
                        title: 'Sản phẩm An Toàn cho Sức Khỏe',
                        desc: 'Vinh danh sản phẩm đạt độ an toàn và hiệu quả cao.',
                    },
                    {
                        img: 'gmp.png',
                        title: 'Chứng nhận GMP',
                        desc: 'Quy trình sản xuất đạt chuẩn quốc tế về chất lượng.',
                    },
                    {
                        img: 'haccp.png',
                        title: 'Chứng nhận HACCP',
                        desc: 'Hệ thống kiểm soát rủi ro an toàn thực phẩm toàn diện.',
                    },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            show: { opacity: 1, y: 0 },
                        }}
                        className="flex flex-col items-center rounded-2xl border border-md-outline-variant bg-md-surface p-6 text-center transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <img
                            src={item.img}
                            className="mb-4 h-32 object-contain"
                        />

                        <h3 className="min-h-12 text-lg font-semibold text-md-on-background">
                            {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-md-on-surface-variant">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
