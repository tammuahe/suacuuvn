import About from '@/components/About';
import Hero from '@/components/Hero';
import Products from '@/components/Products';

export default function Welcome() {
    return (
        <div className="isolate px-32 py-12">
            <Hero />
            <About />
            <Products />
        </div>
    );
}
