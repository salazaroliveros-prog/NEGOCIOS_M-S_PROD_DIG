import React from 'react';
import { motion } from 'motion/react';
import { Target, Lightbulb, TrendingUp } from 'lucide-react';
import { SUCCESS_CASES } from '../constants/data';

export const SuccessCases = () => {
  return (
    <section className="py-24 px-8 md:px-20 bg-panel border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-accent font-bold text-[10px] uppercase tracking-[0.3em]">Casos de Éxito</span>
          <h2 className="text-3xl md:text-5xl font-light text-white tracking-tighter mt-4 uppercase">
            Resultados <span className="font-bold text-accent">Tangibles</span>
          </h2>
        </div>

        <div className="space-y-20">
          {SUCCESS_CASES.map((caseStudy, i) => (
            <div key={caseStudy.id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl overflow-hidden border border-border shadow-2xl"
              >
                <img
                  src={caseStudy.image}
                  alt={caseStudy.title}
                  className="w-full h-[400px] object-cover opacity-80"
                />
              </motion.div>

              <div className="space-y-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{caseStudy.title}</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">El Problema</h4>
                      <p className="text-text-dim text-sm leading-relaxed">{caseStudy.problem}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">La Solución</h4>
                      <p className="text-text-dim text-sm leading-relaxed">{caseStudy.solution}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Resultados</h4>
                      <p className="text-text-dim text-sm leading-relaxed">{caseStudy.results}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
