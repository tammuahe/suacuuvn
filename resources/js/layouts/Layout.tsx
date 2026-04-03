import Navbar from '@/components/Navbar';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import Footer from '@/components/Footer';
import ReactLenis, { LenisRef } from 'lenis/react';
import { cancelFrame, frame } from 'framer-motion';
import Lenis from 'lenis';
import { IconContext } from 'react-icons/lib';

type props = {
    children: ReactNode;
};

interface FrameData {
    delta: number;
    timestamp: number;
    isProcessing: boolean;
}

export default function Layout({ children }: props) {
    const lenisRef = useRef<LenisRef | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        function update(data: FrameData) {
            if (lenisRef.current?.lenis) {
                lenisRef.current.lenis.raf(data.timestamp);
            }
        }

        frame.update(update, true);
        return () => {
            cancelFrame(update);
        };
    }, []);
    return (
        <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
            <IconContext.Provider value={{color: "rgb(0 25 69 / 1)"}}>
                <div className="bg-md-background">
                    <Navbar />
                    {children}
                    <Footer />
                </div>
            </IconContext.Provider>
        </ReactLenis>
    );
}
