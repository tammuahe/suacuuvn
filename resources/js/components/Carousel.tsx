import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import { useState } from 'react';
import { CarouselCard } from './CarouselCard';

export function Carousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        AutoScroll({ stopOnInteraction: true, speed: 1 }),
    ]);
    const [products] = useState([
        {
            id: 1,
            name: 'Sữa Cừu Organic Thuần Khiết Dinh Dưỡng Đặc Biệt 350g (SURE GOLD)',
            price: 750000,
            discount: 0.24,
            img: 'https://aaipharma.vn/wp-content/uploads/2024/12/Sure-gold-400x400.png',
        },
        {
            id: 2,
            name: 'Sữa Cừu Organic Thuần Khiết Dinh Dưỡng Đặc Biệt 650g (SURE GOLD)',
            price: 1250000,
            discount: 0.21,
            img: 'https://aaipharma.vn/wp-content/uploads/2024/12/Loi-ich-sure-gold-510x510.png',
        },
        {
            id: 3,
            name: 'Sữa Cừu Organic Thuần Khiết Tiểu Đường, Tim Mạch 350g (DIABETES)',
            price: 750000,
            discount: 0.24,
            img: 'https://aaipharma.vn/wp-content/uploads/2024/10/Sua-cuu-diabetes-510x510.png',
        },
        {
            id: 4,
            name: 'Sữa Cừu Organic Thuần Khiết Tiểu Đường, Tim Mạch 650g (DIABETES)',
            price: 1250000,
            discount: 0.21,
            img: 'https://aaipharma.vn/wp-content/uploads/2024/10/Sua-cuu-diabetes-510x510.png',
        },
        {
            id: 5,
            name: 'Sữa Cừu Organic Xương Khớp 350g (Canxi)',
            price: 750000,
            discount: 0.24,
            img: 'https://aaipharma.vn/wp-content/uploads/2025/11/z7355642459730_fb72a5dc41d9eaadee2aad1d7707f8dd-510x510.jpg',
        },
        {
            id: 6,
            name: 'Sữa Cừu Organic Xương Khớp 650g (Canxi)',
            price: 1250000,
            discount: 0.21,
            img: 'https://aaipharma.vn/wp-content/uploads/2025/05/canxi-650g-1-510x510.png',
        },
    ]);
    emblaApi?.on('autoScroll:stop', (emblaApi) => {
        setTimeout(() => {
            emblaApi.plugins().autoScroll.play();
        }, 2000);
    });

    return (
        <div className="embla w-full">
            <div className="p-2 overflow-x-hidden" ref={emblaRef}>
                <div className="flex">
                    {products.map((i) => (
                        <div
                            key={i.id}
                            className="flex-[0_0_25%] px-2 md:flex-[0_0_25%] lg:flex-[0_0_25%]"
                        >
                            <CarouselCard product={i} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
