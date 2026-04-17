
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Building2, Cpu, Ruler } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel } from '../components/Carousel';
import { Testimonials } from '../components/Testimonials';
import { SuccessCases } from '../components/SuccessCases';
import { Hero } from '../components/Hero';
import { AdminEditBar } from '../components/AdminEditBar';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const Home = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        // Solo para ejemplo: admin por correo
        if (user.email === 'salazaroliveros@gmail.com') {
          setUserRole('admin');
        } else {
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col bg-bg">
      {/* Botón para activar modo edición solo para admin */}
      {userRole === 'admin' && (
        <button
          className={`edit-mode-toggle-btn px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest ${editMode ? 'bg-accent text-black' : 'bg-panel text-white border border-border'}`}
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? 'Salir de Edición' : 'Modo Edición'}
        </button>
      )}

      {/* Barra flotante solo si admin y modo edición activo */}
      {userRole === 'admin' && editMode && (
        <AdminEditBar
          onOpenPalette={() => alert('Editar paleta de colores (demo)')}
          onOpenImages={() => alert('Editar imágenes (demo)')}
          onOpenTexts={() => alert('Editar textos (demo)')}
          onOpenEffects={() => alert('Editar efectos visuales (demo)')}
          onSave={() => alert('Guardar cambios (demo)')}
        />
      )}

      {/* Hero Section */}
      <Hero />
      {/* Features Section */}
      <section className="py-24 px-8 md:px-20 bg-panel border-b border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-bg border border-border rounded-xl flex items-center justify-center text-accent">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Construcción Residencial, Comercial, Industrial, Civil y Pública</h3>
            <p className="text-text-dim text-sm leading-relaxed">
              Ejecución de proyectos completos con los más altos estándares de calidad y seguridad.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-bg border border-border rounded-xl flex items-center justify-center text-accent">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Software Especializado</h3>
            <p className="text-text-dim text-sm leading-relaxed">
              Apps de cálculo, ERP y herramientas de control diseñadas por profesionales para ayudarte a llevar el control
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-bg border border-border rounded-xl flex items-center justify-center text-accent">
              <Ruler className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Diseño y Planificación</h3>
            <p className="text-text-dim text-sm leading-relaxed">
              Anteproyectos, planos y renders 3D que dan vida a sus ideas antes de la primera piedra.
            </p>
          </div>
        </div>
      </section>
      {/* Success Cases Section */}
      <SuccessCases />
      {/* Featured Projects Carousel */}
      <section className="py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-8 mb-12">
          <span className="text-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Portafolio</span>
          <h2 className="text-4xl font-light text-white tracking-tighter uppercase">Proyectos <span className="text-accent font-bold">Destacados</span></h2>
        </div>
        <Carousel />
      </section>
      {/* Testimonials Section */}
      <Testimonials />
      {/* CTA Section */}
      <section className="py-20 px-8 md:px-20 bg-accent text-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6 uppercase">¿Listo para iniciar su proyecto?</h2>
          <p className="text-lg mb-10 font-medium opacity-80">
            Obtenga una asesoría técnica personalizada y un presupuesto base en minutos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/calculadora"
              className="bg-black text-white px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black/80 transition-all"
            >
              Ir a la Calculadora
            </Link>
            <Link
              to="/servicios"
              className="border-2 border-black px-8 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Nuestros Servicios
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
