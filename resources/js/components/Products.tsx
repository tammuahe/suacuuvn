import React from 'react';
import { Carousel } from './Carousel';

export default function Products() {
    return (
        <div id="product" className="scroll-mt-12">
            <h1 className="my-4 text-7xl/relaxed font-extrabold text-md-on-background">
                Sản phẩm
            </h1>
            <div className="flex">
                <Carousel />
            </div>
        </div>
    );
}
