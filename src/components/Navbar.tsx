import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Calculator, ShoppingBag, Settings, Menu, X, User, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [role, setRole] = React.useState<string | null>(null);
  const location = useLocation();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Calculadora', path: '/calculadora' },
    { name: 'Productos', path: '/productos' },
    { name: 'Servicios', path: '/servicios' },
  ];

  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-panel/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Layout className="w-8 h-8 text-accent" />
              <span className="text-xl font-bold tracking-tighter text-accent uppercase">CONSTRUCTORA WM/M&S</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-xs uppercase tracking-widest font-medium transition-colors hover:text-accent",
                  location.pathname === link.path ? "text-accent" : "text-text-dim"
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-black text-xs font-bold hover:bg-accent/90 transition-all uppercase tracking-widest"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-white text-xs font-bold hover:bg-panel transition-all uppercase tracking-widest"
                >
                  <User className="w-4 h-4 text-accent" />
                  Mi Perfil
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-black text-xs font-bold hover:bg-accent/90 transition-all uppercase tracking-widest"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-text-dim">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-panel border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 text-base font-medium text-text-dim hover:text-accent"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-base font-medium text-accent"
                    onClick={() => setIsOpen(false)}
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  to="/perfil"
                  className="block px-3 py-2 text-base font-medium text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Mi Perfil
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 text-base font-medium text-accent"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
