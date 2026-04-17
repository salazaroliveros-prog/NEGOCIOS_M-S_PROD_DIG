import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Share2, Facebook, Twitter, Linkedin, Mail, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROJECT_CAROUSEL } from '../constants/data';

export const Carousel = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [showShareModal, setShowShareModal] = React.useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % PROJECT_CAROUSEL.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + PROJECT_CAROUSEL.length) % PROJECT_CAROUSEL.length);
  };

  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentProject = PROJECT_CAROUSEL[currentIndex];
  const shareUrl = window.location.href;
  const shareText = `Mira este proyecto de Construm&s: ${currentProject.title}`;

  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-bg border-b border-border">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={currentProject.image}
            alt={currentProject.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent"></div>
          
          <div className="absolute inset-0 flex items-center justify-center px-8 md:px-20">
            <div className="max-w-4xl text-center">
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block"
              >
                Proyecto Destacado
              </motion.span>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-light text-white tracking-tighter mb-2 uppercase"
              >
                {currentProject.title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-accent font-medium text-sm md:text-lg mb-6 italic"
              >
                {currentProject.subtitle}
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-text-dim text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-10"
              >
                {currentProject.description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-4"
              >
                <Link
                  to={currentProject.link}
                  className="inline-flex items-center gap-2 bg-accent text-black px-8 py-4 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/10"
                >
                  {currentProject.cta} <ArrowRight className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                >
                  Compartir <Share2 className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-panel border border-border p-8 rounded-2xl max-w-sm w-full shadow-2xl"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-text-dim hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Compartir Proyecto</h3>
              <div className="grid grid-cols-2 gap-4">
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-4 bg-bg border border-border rounded-xl hover:border-[#1877F2] hover:text-[#1877F2] transition-all group"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Facebook</span>
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-4 bg-bg border border-border rounded-xl hover:border-[#1DA1F2] hover:text-[#1DA1F2] transition-all group"
                >
                  <Twitter className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Twitter</span>
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-4 bg-bg border border-border rounded-xl hover:border-[#0A66C2] hover:text-[#0A66C2] transition-all group"
                >
                  <Linkedin className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">LinkedIn</span>
                </a>
                <a 
                  href={`mailto:?subject=${encodeURIComponent(currentProject.title)}&body=${encodeURIComponent(shareText + '\n' + shareUrl)}`}
                  className="flex flex-col items-center gap-2 p-4 bg-bg border border-border rounded-xl hover:border-accent hover:text-accent transition-all group"
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase">Correo</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-panel/50 border border-border text-white hover:bg-accent hover:text-black transition-all z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-panel/50 border border-border text-white hover:bg-accent hover:text-black transition-all z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {PROJECT_CAROUSEL.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-12 h-1 rounded-full transition-all ${
              index === currentIndex ? 'bg-accent' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
