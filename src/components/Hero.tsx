import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageConfig } from '../hooks/usePageConfig';

export const Hero = () => {
  const { config } = usePageConfig();

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          poster="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-construction-site-with-cranes-and-workers-33230-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-oxford/20 via-oxford/60 to-oxford"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 text-center">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-gold font-bold text-[10px] uppercase tracking-[0.5em] mb-6"
        >
          CONSTRUCTORA WM/M&S
        </motion.span>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9]"
        >
          CONSTRUYENDO EL <span className="text-gold">FUTURO</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-lg md:text-xl text-text-dim max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Transformamos bits en concreto y sueños en estructuras. Ingeniería de vanguardia para proyectos de alto impacto.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          <Link
            to="/calculadora"
            className="bg-gold text-black px-10 py-5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-gold/20 flex items-center gap-2"
          >
            Cotiza tu proyecto hoy <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/servicios"
            className="bg-panel/50 backdrop-blur-md border border-border text-white px-10 py-5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-panel transition-all"
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
