import About from '@/components/About';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Products from '@/components/Products';
import { welcome } from '@/routes';
import { Link } from '@inertiajs/react';
import ReactLenis from 'lenis/react';
import React, { useRef } from 'react';

export default function Welcome() {
    return (
        <div className="px-32 py-12 isolate">
            <Hero />
            <About />
            <Products />
        </div>
    );
}
