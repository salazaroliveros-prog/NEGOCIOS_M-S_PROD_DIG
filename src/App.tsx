import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CalculatorPage } from './pages/Calculator';
import ProductsPage from './pages/Products';
import { ServicesPage } from './pages/Services';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/Login';
import { UserProfile } from './pages/UserProfile';
import { ChatWidget } from './components/ChatWidget';
import { FloatingActionButton } from './components/FloatingActionButton';
import { usePageConfig } from './hooks/usePageConfig';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { config } = usePageConfig();

  React.useEffect(() => {
    document.documentElement.style.setProperty('--site-accent', config.accentColor);
    document.documentElement.style.setProperty('--site-bg', config.primaryColor);
  }, [config]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculadora" element={<CalculatorPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/servicios" element={<ServicesPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/perfil" element={<UserProfile />} />
          </Routes>

          <ChatWidget />
          <FloatingActionButton />

          <footer className="bg-panel text-white py-12 px-8 border-t border-border">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-lg font-bold tracking-tighter uppercase text-accent">CONSTRUCTORA WM/M&S</div>
                <div className="flex flex-wrap justify-center gap-8 text-[10px] uppercase tracking-widest text-text-dim">
                  <a href={`mailto:${config.contactEmail}`} className="hover:text-accent transition-colors">{config.contactEmail}</a>
                  <a href={`tel:${config.contactPhone}`} className="hover:text-accent transition-colors">{config.contactPhone}</a>
                  <span className="text-text-dim">{config.contactAddress}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-white/5">
                <div className="flex flex-wrap justify-center gap-8 text-[10px] uppercase tracking-widest text-text-dim">
                  <a href="#" className="hover:text-accent transition-colors">Términos</a>
                  <a href="#" className="hover:text-accent transition-colors">Privacidad</a>
                  <a href="#" className="hover:text-accent transition-colors">Soporte</a>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-text-dim text-center md:text-right">
                  {config.footerText}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
