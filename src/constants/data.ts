export interface DepartmentCost {
  name: string;
  baseCostPerM2: number; // in GTQ
  logisticFactor: number;
}

export const GUATEMALA_DEPARTMENTS: DepartmentCost[] = [
  { name: "Guatemala", baseCostPerM2: 3800, logisticFactor: 1.05 },
  { name: "Jutiapa", baseCostPerM2: 3500, logisticFactor: 1.00 },
  { name: "Sacatepéquez", baseCostPerM2: 4000, logisticFactor: 1.10 },
  { name: "Quetzaltenango", baseCostPerM2: 3900, logisticFactor: 1.08 },
  { name: "Chimaltenango", baseCostPerM2: 3700, logisticFactor: 1.02 },
  { name: "Escuintla", baseCostPerM2: 3600, logisticFactor: 1.03 },
  { name: "Santa Rosa", baseCostPerM2: 3400, logisticFactor: 1.01 },
  { name: "Sololá", baseCostPerM2: 3800, logisticFactor: 1.12 },
  { name: "Totonicapán", baseCostPerM2: 3700, logisticFactor: 1.09 },
  { name: "San Marcos", baseCostPerM2: 3800, logisticFactor: 1.15 },
  { name: "Huehuetenango", baseCostPerM2: 3900, logisticFactor: 1.18 },
  { name: "Quiché", baseCostPerM2: 3800, logisticFactor: 1.16 },
  { name: "Baja Verapaz", baseCostPerM2: 3600, logisticFactor: 1.05 },
  { name: "Alta Verapaz", baseCostPerM2: 3700, logisticFactor: 1.10 },
  { name: "Petén", baseCostPerM2: 4200, logisticFactor: 1.25 },
  { name: "Izabal", baseCostPerM2: 4000, logisticFactor: 1.20 },
  { name: "Zacapa", baseCostPerM2: 3700, logisticFactor: 1.05 },
  { name: "Chiquimula", baseCostPerM2: 3600, logisticFactor: 1.04 },
  { name: "Jalapa", baseCostPerM2: 3500, logisticFactor: 1.02 },
  { name: "El Progreso", baseCostPerM2: 3500, logisticFactor: 1.03 },
  { name: "Retalhuleu", baseCostPerM2: 3600, logisticFactor: 1.05 },
  { name: "Suchitepéquez", baseCostPerM2: 3600, logisticFactor: 1.04 },
];

export interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'gestion' | 'ingenieria' | 'diseno';
  image: string;
  documents?: { name: string; url: string }[];
  isLite?: boolean;
}

export const DIGITAL_PRODUCTS: DigitalProduct[] = [
  {
    id: '1',
    name: 'ERP Completo Construcción',
    description: 'Sistema integral de gestión para empresas constructoras.',
    price: 15000,
    category: 'gestion',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    isLite: false
  },
  {
    id: '2',
    name: 'App Seguimiento de Obra',
    description: 'Control de cronogramas y personal en tiempo real.',
    price: 3500,
    category: 'gestion',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800',
    isLite: true
  },
  {
    id: '3',
    name: 'App Rendimiento y Presupuestos',
    description: 'Cálculo exacto de materiales y mano de obra.',
    price: 2500,
    category: 'ingenieria',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800',
    isLite: true
  },
  {
    id: '4',
    name: 'Pack Planos Residenciales',
    description: 'Planos arquitectónicos listos para construir.',
    price: 5000,
    category: 'diseno',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    name: 'Renders 3D Premium',
    description: 'Visualización fotorrealista de alta calidad.',
    price: 1200,
    category: 'diseno',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  }
];

export interface ConstructionService {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const CONSTRUCTION_SERVICES: ConstructionService[] = [
  {
    id: 's1',
    name: 'Ejecución de Proyectos',
    description: 'Construcción completa de obras civiles e industriales.',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's2',
    name: 'Supervisión de Obra',
    description: 'Control técnico y administrativo de proyectos.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's3',
    name: 'Agrimensura y Topografía',
    description: 'Medición de terrenos y levantamientos LiDAR.',
    image: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&q=80&w=800'
  }
];

export interface CarouselItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  link: string;
}

export const PROJECT_CAROUSEL: CarouselItem[] = [
  {
    id: 'c1',
    title: 'Residencial Las Luces',
    subtitle: 'Eficiencia energética y diseño bioclimático',
    description: 'Diseño y ejecución de vivienda de lujo con eficiencia energética.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    cta: 'Ver Proyecto',
    link: '/servicios'
  },
  {
    id: 'c2',
    title: 'Complejo Industrial Escuintla',
    subtitle: 'Infraestructura de alto impacto para logística',
    description: 'Nave industrial de 5,000 m² con estructura de acero reforzada.',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1200',
    cta: 'Solicitar Presupuesto',
    link: '/calculadora'
  },
  {
    id: 'c3',
    title: 'Urbanización El Valle',
    subtitle: 'Desarrollo urbano sostenible en el altiplano',
    description: 'Planificación y lotificación de 20 hectáreas con servicios integrales.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
    cta: 'Ver Detalles',
    link: '/servicios'
  }
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  photo?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ing. Carlos Méndez',
    role: 'Director de Proyectos, Inmobiliaria GT',
    content: 'La precisión en los cálculos y la calidad de los renders de CONSTRUM&S nos permitieron cerrar ventas antes de iniciar la construcción.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 't2',
    name: 'Arq. Sofía Estrada',
    role: 'Consultora Independiente',
    content: 'Sus herramientas digitales son indispensables para cualquier profesional de la construcción en Guatemala. Ahorran semanas de trabajo.',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
  }
];

export interface SuccessCase {
  id: string;
  title: string;
  problem: string;
  solution: string;
  results: string;
  image: string;
}

export const SUCCESS_CASES: SuccessCase[] = [
  {
    id: 'sc1',
    title: 'Optimización de Costos en Edificio Vertical',
    problem: 'El presupuesto inicial excedía la capacidad del cliente en un 15% debido a ineficiencias en el diseño estructural.',
    solution: 'Rediseño estructural utilizando su software de cálculo avanzado y optimización de materiales.',
    results: 'Reducción del 18% en costos de materiales y finalización 2 semanas antes de lo previsto.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  }
];
