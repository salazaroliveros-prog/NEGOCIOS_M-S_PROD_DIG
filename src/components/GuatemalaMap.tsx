import React from 'react';
import { motion } from 'motion/react';

interface GuatemalaMapProps {
  selectedDepartment: string;
  onSelect: (name: string) => void;
}

export const GuatemalaMap: React.FC<GuatemalaMapProps> = ({ selectedDepartment, onSelect }) => {
  // Realistic SVG paths for Guatemala departments
  const departments = [
    { name: "Petén", path: "M130,10 L260,10 L260,110 L220,120 L200,140 L130,130 Z" },
    { name: "Huehuetenango", path: "M20,110 L90,110 L100,140 L80,180 L20,170 Z" },
    { name: "Quiché", path: "M90,110 L150,110 L160,140 L140,190 L90,180 Z" },
    { name: "Alta Verapaz", path: "M150,110 L220,110 L230,150 L190,170 L150,160 Z" },
    { name: "Izabal", path: "M220,110 L290,110 L295,160 L240,180 L220,160 Z" },
    { name: "San Marcos", path: "M10,170 L60,170 L70,200 L30,220 L10,200 Z" },
    { name: "Quetzaltenango", path: "M60,170 L100,170 L110,200 L80,220 L60,200 Z" },
    { name: "Totonicapán", path: "M100,170 L130,170 L135,195 L105,200 Z" },
    { name: "Sololá", path: "M105,200 L135,195 L130,220 L100,220 Z" },
    { name: "Retalhuleu", path: "M40,220 L90,220 L95,250 L45,250 Z" },
    { name: "Suchitepéquez", path: "M90,220 L130,220 L135,250 L95,250 Z" },
    { name: "Chimaltenango", path: "M130,170 L160,170 L165,200 L135,200 Z" },
    { name: "Sacatepéquez", path: "M145,200 L165,200 L165,220 L145,220 Z" },
    { name: "Guatemala", path: "M165,170 L195,170 L200,210 L170,220 L165,200 Z" },
    { name: "Baja Verapaz", path: "M150,160 L190,160 L195,185 L155,190 Z" },
    { name: "El Progreso", path: "M190,160 L220,160 L225,185 L195,190 Z" },
    { name: "Zacapa", path: "M220,160 L260,160 L265,195 L225,200 Z" },
    { name: "Chiquimula", path: "M260,160 L290,160 L295,205 L265,210 Z" },
    { name: "Jalapa", path: "M195,190 L225,190 L230,220 L200,225 Z" },
    { name: "Jutiapa", path: "M225,190 L265,190 L270,240 L230,245 Z" },
    { name: "Santa Rosa", path: "M170,220 L210,220 L215,255 L175,260 Z" },
    { name: "Escuintla", path: "M130,220 L170,220 L175,265 L135,270 Z" },
  ];

  return (
    <div className="w-full aspect-square bg-panel/30 rounded-xl border border-border p-4 flex flex-col items-center">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4">Mapa Interactivo de Departamentos</h3>
      <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {departments.map((dep) => (
          <motion.path
            key={dep.name}
            d={dep.path}
            onClick={() => onSelect(dep.name)}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            className={`cursor-pointer transition-all duration-300 stroke-panel stroke-[1.5] ${
              selectedDepartment === dep.name 
                ? 'fill-accent filter-[url(#glow)]' 
                : 'fill-white/10 hover:fill-white/30'
            }`}
          >
            <title>{dep.name}</title>
          </motion.path>
        ))}
      </svg>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="text-[8px] text-accent font-bold px-2 py-0.5 bg-accent/10 rounded border border-accent/20">
          {selectedDepartment}
        </span>
      </div>
      <p className="text-[9px] text-text-dim mt-4 text-center uppercase tracking-widest">
        Seleccione un departamento en el mapa para actualizar el costo base
      </p>
    </div>
  );
};
