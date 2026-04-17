import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CONSTRUCTION_SERVICES } from '../constants/data';

export const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = React.useState<any[]>([]);
  const [expandedService, setExpandedService] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    type: 'Residencial',
    budget: '',
    duration: 12,
    details: ''
  });

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Fallback to static data if Firestore is empty
      setServices(servicesData.length > 0 ? servicesData : CONSTRUCTION_SERVICES);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services');
      setServices(CONSTRUCTION_SERVICES);
    });

    return () => unsubscribe();
  }, []);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre completo es obligatorio';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un formato de correo válido';
    }
    if (!formData.type) newErrors.type = 'Seleccione el tipo de edificación';
    if (!formData.budget || Number(formData.budget) <= 0) {
      newErrors.budget = 'El presupuesto debe ser mayor a 0';
    }
    if (!formData.details.trim()) {
      newErrors.details = 'Por favor, describa los detalles de su proyecto';
    } else if (formData.details.trim().length < 20) {
      newErrors.details = 'La descripción debe tener al menos 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setFormData({ name: '', email: '', type: 'Residencial', budget: '', duration: 12, details: '' });
    } catch (error) {
      console.error('Error sending form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="flex-1 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white uppercase">
            Servicios de <br />
            <span className="text-accent font-bold">Ejecución</span>
          </h1>
          <p className="mt-4 text-text-dim max-w-2xl font-medium border-l-2 border-border pl-4">
            Ejecución magistral y supervisión técnica para proyectos de cualquier escala.
          </p>
        </header>

        <div className="space-y-24">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
            >
              <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1503387762-592dee58c460?auto=format&fit=crop&q=80&w=1200'}
                  alt={service.name || service.title}
                  className="w-full h-full object-cover opacity-70"
                />
              </div>
              <div className="w-full md:w-1/2 space-y-6">
                <span className="text-accent font-bold text-[10px] uppercase tracking-[0.3em]">Servicio 0{i + 1}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{service.name || service.title}</h2>
                <p className="text-text-dim text-lg leading-relaxed font-light">
                  {service.description}
                </p>

                {service.detailedDescription && (
                  <div className="bg-panel/30 rounded-xl border border-border/50 overflow-hidden">
                    <button
                      onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-accent font-bold text-[10px] uppercase tracking-widest hover:bg-accent/5 transition-all"
                    >
                      {expandedService === service.id ? 'Ocultar Detalles' : 'Ver Detalles Completos'}
                      {expandedService === service.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedService === service.id && (
                      <div className="px-6 pb-6 text-sm text-text-dim leading-relaxed whitespace-pre-wrap border-t border-border/50 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {service.detailedDescription}
                      </div>
                    )}
                  </div>
                )}

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Certificación ISO 9001', 'Tecnología BIM', 'Supervisión 24/7', 'Control LiDAR'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-text-dim text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-accent" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <button
                    onClick={() => {
                      const formSection = document.getElementById('cotizacion-form');
                      if (formSection) {
                        formSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-accent text-black px-8 py-4 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg shadow-accent/10"
                  >
                    Solicitar Cotización <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Premium Contact Form */}
        <section className="mt-32 bg-panel rounded-3xl border border-border p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center mb-12" id="cotizacion-form">
            <span className="text-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Asesoría Premium</span>
            <h2 className="text-3xl md:text-5xl font-light text-white tracking-tighter uppercase">
              Inicie su <span className="text-accent font-bold">Proyecto</span>
            </h2>
            <p className="mt-4 text-text-dim font-medium">
              Complete los detalles específicos para una cotización prioritaria y detallada.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Nombre Completo</label>
              <input
                type="text"
                title="Nombre Completo"
                placeholder="Nombre Completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-input border rounded-lg py-4 px-6 text-white focus:ring-2 focus:ring-accent outline-none transition-all ${errors.name ? 'border-red-500' : 'border-border'}`}
              />
              {errors.name && <p className="text-[9px] text-red-500 uppercase font-bold">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Correo Electrónico</label>
              <input
                type="email"
                title="Correo Electrónico"
                placeholder="Correo Electrónico"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-input border rounded-lg py-4 px-6 text-white focus:ring-2 focus:ring-accent outline-none transition-all ${errors.email ? 'border-red-500' : 'border-border'}`}
              />
              {errors.email && <p className="text-[9px] text-red-500 uppercase font-bold">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Tipo de Edificación</label>
              <select
                value={formData.type}
                title="Tipo de Edificación"
                aria-label="Tipo de Edificación"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-input border border-border rounded-lg py-4 px-6 text-white focus:ring-2 focus:ring-accent outline-none"
              >
                <option>Residencial</option>
                <option>Industrial</option>
                <option>Comercial</option>
                <option>Infraestructura</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Presupuesto Estimado (GTQ)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className={`w-full bg-input border rounded-lg py-4 px-6 text-white focus:ring-2 focus:ring-accent outline-none transition-all ${errors.budget ? 'border-red-500' : 'border-border'}`}
                placeholder="Q. 0.00"
              />
              {errors.budget && <p className="text-[9px] text-red-500 uppercase font-bold">{errors.budget}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Plazo Deseado ({formData.duration} Meses)</label>
              <input
                type="range"
                title="Plazo Deseado"
                aria-label="Plazo Deseado"
                min="1"
                max="24"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-text-dim font-bold uppercase">
                <span>1 Mes</span>
                <span>12 Meses</span>
                <span>24 Meses</span>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Detalles del Proyecto</label>
              <textarea
                rows={4}
                title="Detalles del Proyecto"
                placeholder="Describe tu proyecto..."
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className={`w-full bg-input border rounded-lg py-4 px-6 text-white focus:ring-2 focus:ring-accent outline-none resize-none transition-all ${errors.details ? 'border-red-500' : 'border-border'}`}
              ></textarea>
              {errors.details && <p className="text-[9px] text-red-500 uppercase font-bold">{errors.details}</p>}
            </div>
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-accent text-black font-bold py-5 rounded-xl uppercase tracking-widest hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : isSuccess ? (
                  <>Enviado con Éxito <CheckCircle2 className="w-5 h-5" /></>
                ) : (
                  'Enviar a Cola Prioritaria'
                )}
              </button>
              {isSuccess && (
                <p className="text-center text-green-500 text-[10px] font-bold uppercase mt-4 tracking-widest animate-bounce">
                  ¡Gracias! Un asesor se contactará pronto.
                </p>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
