import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface PageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  accentColor: string;
  primaryColor: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  bankAccountInfo: string;
  carouselImages?: string[];
}

const DEFAULT_CONFIG: PageConfig = {
  heroTitle: 'INGENIERÍA QUE CONSTRUYE EL FUTURO',
  heroSubtitle: 'Soluciones integrales en diseño, cálculo y ejecución de obras civiles con los más altos estándares de calidad.',
  heroImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80',
  accentColor: '#EAB308',
  primaryColor: '#0A0A0A',
  footerText: '© 2024 CONSTRUM&S. Todos los derechos reservados.',
  contactEmail: 'info@construms.com',
  contactPhone: '+502 1234 5678',
  contactAddress: 'Ciudad de Guatemala, Guatemala',
  bankAccountInfo: 'Banco Industrial - Cuenta Monetaria: 123-456789-0 - A nombre de: CONSTRUM&S S.A.'
};

export const usePageConfig = () => {
  const [config, setConfig] = useState<PageConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'site'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as PageConfig);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/site');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { config, loading };
};
