import About from '@/components/About';
import Hero from '@/components/Hero';
import Products from '@/components/Products';

export default function Welcome() {
    return (
        <div className="px-32 py-12 isolate">
            <Hero />
            <About />
            <Products />
        </div>
    );
}
