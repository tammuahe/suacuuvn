import { cancelFrame, frame } from 'framer-motion';
import type { LenisRef } from 'lenis/react';
import ReactLenis from 'lenis/react';
import type { ReactNode} from 'react';
import React, { useEffect, useRef } from 'react';
import { IconContext } from 'react-icons/lib';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

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
