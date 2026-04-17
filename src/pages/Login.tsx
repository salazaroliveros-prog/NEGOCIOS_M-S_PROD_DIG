import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, UserPlus, Check } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [isResetting, setIsResetting] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userRef);
          
          if (user.email === 'salazaroliveros@gmail.com') {
            // Force admin role for this specific email
            if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'Super Admin',
                role: 'admin',
                createdAt: userDoc.exists() ? userDoc.data()?.createdAt : new Date().toISOString(),
                purchases: userDoc.exists() ? userDoc.data()?.purchases : [],
                avatarUrl: userDoc.exists() ? userDoc.data()?.avatarUrl : `https://api.dicebear.com/7.x/bottts/svg?seed=admin`
              }, { merge: true });
            }
            navigate('/admin');
            return;
          }

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/perfil');
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isResetting) {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Se ha enviado un correo para restablecer tu contraseña.');
        setIsResetting(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        // Create user doc
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            name: name,
            role: 'user',
            createdAt: new Date().toISOString(),
            purchases: [],
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center bg-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-panel p-8 rounded-2xl border border-border shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/20">
            {isResetting ? <Mail className="w-8 h-8 text-accent" /> : (isLogin ? <LogIn className="w-8 h-8 text-accent" /> : <UserPlus className="w-8 h-8 text-accent" />)}
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tighter uppercase">
            {isResetting ? 'Recuperar Cuenta' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </h2>
          <p className="text-text-dim text-xs uppercase tracking-widest mt-2">
            {isResetting ? 'Enviaremos un link a tu correo' : (isLogin ? 'Accede a tu panel de control' : 'Únete a CONSTRUM&S')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-xs">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-500 text-xs">
            <Check className="w-4 h-4" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isResetting && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Nombre Completo</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 pl-10 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                  placeholder="Tu nombre"
                />
                <LogIn className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Correo Electrónico</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 pl-10 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                placeholder="correo@ejemplo.com"
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            </div>
          </div>

          {!isResetting && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Contraseña</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setIsResetting(true)}
                    className="text-[9px] uppercase tracking-widest text-accent hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 pl-10 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (isResetting ? 'Enviar Link' : (isLogin ? 'Entrar' : 'Registrarme'))}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {!isResetting && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-panel px-4 text-text-dim">O continuar con</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
          </>
        )}

        <div className="mt-8 text-center space-y-4">
          {isResetting ? (
            <button
              onClick={() => setIsResetting(false)}
              className="text-[10px] uppercase tracking-widest text-text-dim hover:text-accent transition-colors"
            >
              Volver al inicio de sesión
            </button>
          ) : (
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] uppercase tracking-widest text-text-dim hover:text-accent transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
