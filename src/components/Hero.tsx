
import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageConfig } from '../hooks/usePageConfig';

export const Hero = () => {
  const { config } = usePageConfig();
  // Permitir fallback si no hay imágenes configuradas
  const images: string[] = Array.isArray(config.carouselImages) && config.carouselImages.length > 0
    ? config.carouselImages
    : [
        'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200',
      ];
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        {images.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt="Construcción moderna"
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-40' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-oxford/20 via-oxford/60 to-oxford"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-gold font-bold text-[15px] uppercase tracking-[0.5em] mb-4"
        >
          CONSTRUYENDO EL FUTURO
        </motion.span>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-7xl md:text-6xl lg:text-20xl font-black text-white tracking-tighter uppercase leading-[1.1]"
        >
          CONSTRUCTORA <span className="text-gold">WM/M&S</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-lg md:text-1xl text-text-dim max-w-5xl mx-auto font-medium leading-relaxed"
        >
          Transformamos Ideas en concreto y sueños en estructuras. Arquitectura de vanguardia para proyectos de alto impacto.
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap justify-center gap-15"
        >
          <Link
            to="/calculadora"
            className="bg-gold text-black px-5 py-5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-5xl shadow-gold/20 flex items-center gap-1"
          >
            Cotiza tu Proyecto hoy <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/servicios"
            className="bg-panel/50 backdrop-blur-md border border-border text-white px-5 py-5 rounded-xl font-bold text-[15px] uppercase tracking-widest hover:bg-panel transition-all"
          >
            Nuestros Servicios
          </Link>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-bg to-transparent"></div>
    </section>
  );
};
