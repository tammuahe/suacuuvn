import { welcome } from '@/routes';
import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import React from 'react';

export default function Navbar() {
    return (
        <nav className="border-2 flex items-center border-md-outline font-semibold sticky top-0 bg-md-background h-16 z-50">
            <div className="inline mx-4 my-2">
                <a href={welcome().url}>
                <img src="/logo_cropped.png" className="w-8"/>
                </a>
            </div>
            <div className="self-stretch border-l-2 border-md-outline"></div>

            <div className="space-x-12 mx-8">
                <Link href={welcome()} className='text-md-on-primary-container'>Trang chủ</Link>
                <Link href={`${welcome().url}#about`} className='text-md-on-primary-container'>Về chúng tôi</Link>
                <Link href="/shopping" className='text-md-on-primary-container'>Mua hàng</Link>
            </div>
            <ShoppingCart className='ml-auto mr-8' color='#001A41' />
        </nav>
    );
}
