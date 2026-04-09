import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
    return (
        <div className="px-6 lg:px-16">

            {/* Section Title */}
            <motion.h1
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="my-8 text-5xl lg:text-7xl font-extrabold text-md-on-primary-fixed-variant scroll-mt-32"
                id='about'
            >
                Về chúng tôi
            </motion.h1>

            {/* Intro Section */}
            <div className="grid lg:grid-cols-2 gap-10">

                {/* Text */}
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg lg:text-xl font-medium text-md-on-primary-fixed-variant leading-relaxed max-w-2xl"
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
                    className="w-full max-h-100 object-contain rounded-2xl"
                />
            </div>

            {/* Awards Header */}
            <div className="my-20 text-center max-w-3xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl lg:text-4xl font-bold text-md-on-background"
                >
                    Thương hiệu được tin dùng
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-4 text-lg text-md-on-background leading-relaxed"
                >
                    AAiPharma tự hào đạt nhiều chứng nhận uy tín, khẳng định
                    cam kết về chất lượng và sức khỏe người tiêu dùng.
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >

                {[
                    {
                        img: "iso22000.png",
                        title: "Chứng nhận ISO 22000",
                        desc: "Tiêu chuẩn quốc tế về hệ thống quản lý an toàn thực phẩm.",
                    },
                    {
                        img: "Rectangle-15-1.png",
                        title: "Sản phẩm An Toàn cho Sức Khỏe",
                        desc: "Vinh danh sản phẩm đạt độ an toàn và hiệu quả cao.",
                    },
                    {
                        img: "gmp.png",
                        title: "Chứng nhận GMP",
                        desc: "Quy trình sản xuất đạt chuẩn quốc tế về chất lượng.",
                    },
                    {
                        img: "haccp.png",
                        title: "Chứng nhận HACCP",
                        desc: "Hệ thống kiểm soát rủi ro an toàn thực phẩm toàn diện.",
                    },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            show: { opacity: 1, y: 0 },
                        }}
                        className="bg-md-surface border border-md-outline-variant rounded-2xl p-6 text-center flex flex-col items-center transition hover:shadow-md hover:-translate-y-1"
                    >
                        <img
                            src={item.img}
                            className="h-32 object-contain mb-4"
                        />

                        <h3 className="text-md-on-background text-lg font-semibold min-h-12">
                            {item.title}
                        </h3>

                        <p className="text-sm text-md-on-surface-variant mt-2 leading-relaxed">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
