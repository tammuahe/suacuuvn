import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import { welcome } from '@/routes';
import { Link } from '@inertiajs/react';
import React from 'react';

export default function Welcome() {
    return (
        <div className="px-32 py-12 text-md-primary">
            <Hero />
        </div>
    );
}
