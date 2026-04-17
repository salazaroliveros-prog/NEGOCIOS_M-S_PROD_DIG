import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '../constants/data';

export const Testimonials = () => {
  return (
    <section className="py-24 px-8 md:px-20 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold text-[10px] uppercase tracking-[0.3em]">Testimonios</span>
          <h2 className="text-3xl md:text-5xl font-light text-white tracking-tighter mt-4 uppercase">
            Lo que dicen <span className="font-bold text-accent">nuestros clientes</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-panel p-10 rounded-2xl border border-border relative"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-accent/10" />
              <p className="text-text-dim text-lg italic leading-relaxed mb-8 relative z-10">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                {testimonial.photo && (
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border border-accent/30"
                  />
                )}
                <div>
                  <h4 className="text-white font-bold text-sm">{testimonial.name}</h4>
                  <p className="text-accent text-[10px] uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
