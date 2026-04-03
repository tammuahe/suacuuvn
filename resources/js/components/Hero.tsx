import React from 'react';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <div>
            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="my-4 text-7xl/relaxed font-extrabold text-md-on-primary-fixed-variant"
            >
                Khám phá
                <br />
                Một chuẩn dinh dưỡng khác
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                className="my-4 text-3xl font-semibold tracking-wide text-md-on-primary-container"
            >
                Nguồn sữa cừu organic từ New Zealand, giàu đạm A2 và vi chất
                thiết yếu, phù hợp cho nhu cầu dinh dưỡng và hấp thu mỗi ngày.
            </motion.h2>

            {/* Image */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="p-8"
            >
                <img
                    src="/Sure-gold.png"
                    className="mx-auto my-12 w-full rounded-2xl object-cover"
                />
            </motion.div>
        </div>
    );
}
