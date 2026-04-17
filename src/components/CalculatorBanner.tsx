import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BannerImage {
    url: string;
    label: string;
}

interface CalculatorBannerProps {
    images: BannerImage[];
    small?: boolean;
}

export const CalculatorBanner: React.FC<CalculatorBannerProps> = ({ images, small }) => {
    const [index, setIndex] = React.useState(0);
    React.useEffect(() => {
        if (!images || images.length === 0) return;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [images?.length]);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full rounded-xl overflow-hidden mb-4">
            <AnimatePresence mode="wait">
                <motion.img
                    key={images[index]?.url || 'default'}
                    src={images[index]?.url}
                    alt={images[index]?.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-full object-cover"     
                />
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 w-full bg-black/40 py-2 px-4 text-white text-xs font-bold tracking-widest uppercase">
                {images[index]?.label}
            </div>
        </div>
    );
};
