import React from 'react';

export default function Hero() {
    return (
        <div>
            <h1 className="my-4 text-7xl/relaxed font-extrabold text-md-on-background">
                Khám phá
                <br />
                Một chuẩn dinh dưỡng khác
            </h1>
            <h2 className="my-4 text-3xl font-semibold tracking-wide text-md-on-background">
                Nguồn sữa cừu organic từ New Zealand, giàu đạm A2 và vi chất
                thiết yếu, phù hợp cho nhu cầu dinh dưỡng và hấp thu mỗi ngày.
            </h2>
            <div className="p-8">
                <img
                    src="/Sure-gold.png"
                    className="mx-auto my-12 w-full rounded-2xl object-cover"
                />
            </div>
        </div>
    );
}
