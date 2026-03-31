import Navbar from '@/components/Navbar';
import React, { ReactNode } from 'react';
import { ReactLenis } from 'lenis/react';

type props = {
    children: ReactNode;
};

export default function Layout({ children }: props) {
    return (
        <ReactLenis root>
            <div className="scroll-smooth! bg-md-background">
                <Navbar />
                {children}
            </div>
        </ReactLenis>
    );
}
