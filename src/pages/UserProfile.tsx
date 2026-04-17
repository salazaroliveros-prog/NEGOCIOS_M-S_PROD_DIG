import React from 'react';
import { motion } from 'motion/react';
import { Package, Download, FileText, LogOut, User, ShoppingBag, Bell, Camera, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc, collection, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { DIGITAL_PRODUCTS } from '../constants/data';

export const UserProfile = () => {
  const [userData, setUserData] = React.useState<any>(null);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAvatarEditor, setShowAvatarEditor] = React.useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const navigate = useNavigate();

  const itemsPerPage = userData?.purchases?.length > 8 ? 4 : 8;

  const validateImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase()) || url.includes('dicebear.com');
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Listen to user data for real-time updates on purchases
        const userRef = doc(db, 'users', user.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });

        // Listen to notifications
        const notifRef = collection(db, 'notifications');
        const notifQuery = query(
          notifRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
          setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'notifications');
        });

        return () => {
          unsubDoc();
          unsubNotif();
        };
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const markAsRead = async (notifId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notifId}`);
    }
  };

  const deleteNotification = async (notifId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notifId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${notifId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const purchasedProducts = DIGITAL_PRODUCTS.filter(p => 
    userData?.purchases?.includes(p.id)
  );

  const totalPages = Math.ceil(purchasedProducts.length / itemsPerPage);
  const currentItems = purchasedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-bg">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-panel p-8 rounded-2xl border border-border text-center">
            <div className="relative inline-block mb-4 group">
              <img 
                src={userData?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.uid}`} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full border-2 border-accent p-1 bg-bg"
              />
              <button 
                onClick={() => setShowAvatarEditor(!showAvatarEditor)}
                title="Editar avatar"
                aria-label="Editar avatar"
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white"
              >
                <Camera className="w-6 h-6" />
              </button>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-panel rounded-full"></div>
            </div>

            {showAvatarEditor && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 space-y-4 text-left border-t border-border pt-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Elegir Avatar</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Felix', 'Aneka', 'Spooky', 'Tigger', 'Milo', 'Jasper'].map(seed => (
                    <button 
                      key={seed}
                      onClick={async () => {
                        const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                        try {
                          await updateDoc(doc(db, 'users', auth.currentUser!.uid), { avatarUrl: url });
                        } catch (error) {
                          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
                        }
                      }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${userData?.avatarUrl?.includes(seed) ? 'border-accent' : 'border-border opacity-50'}`}
                    >
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} className="w-full h-full rounded-full" />
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">URL Personalizada</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-input border border-border rounded px-3 py-2 text-xs text-white outline-none"
                    />
                    <button 
                      onClick={async () => {
                        if (customAvatarUrl) {
                          if (!validateImageUrl(customAvatarUrl)) {
                            alert('Por favor, ingresa una URL de imagen válida (.jpg, .png, .svg, etc.)');
                            return;
                          }
                          try {
                            await updateDoc(doc(db, 'users', auth.currentUser!.uid), { avatarUrl: customAvatarUrl });
                            setCustomAvatarUrl('');
                          } catch (err) {
                            handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
                          }
                        }
                      }}
                      title="Guardar avatar personalizado"
                      aria-label="Guardar avatar personalizado"
                      className="bg-accent text-black p-2 rounded hover:bg-accent/90 transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <h2 className="text-xl font-bold text-white mb-1">{userData?.name}</h2>
            <p className="text-text-dim text-xs uppercase tracking-widest mb-6">{userData?.email}</p>
            
            <div className="flex flex-col gap-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-bg border border-border rounded-xl text-xs uppercase tracking-widest text-white font-bold">
                <User className="w-4 h-4 text-accent" /> Mi Perfil
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-text-dim hover:bg-red-500/10 hover:text-red-500 transition-all rounded-xl text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="bg-panel p-6 rounded-2xl border border-border">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notificaciones ({notifications.filter(n => !n.read).length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-xl border transition-all ${notif.read ? 'bg-bg/50 border-border opacity-60' : 'bg-bg border-accent/30 shadow-lg shadow-accent/5'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        notif.type === 'success' ? 'bg-green-500/10 text-green-500' :
                        notif.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'
                      }`}>
                        {notif.title}
                      </span>
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="text-text-dim hover:text-red-500 transition-colors"
                        title="Eliminar notificación"
                        aria-label="Eliminar notificación"
                      >
                        <LogOut className="w-3 h-3 rotate-90" />
                      </button>
                    </div>
                    <p className="text-[10px] text-white leading-relaxed mb-2">{notif.message}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-text-dim">
                        {notif.createdAt ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente'}
                      </span>
                      {!notif.read && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="text-[8px] font-bold uppercase tracking-widest text-accent hover:underline"
                        >
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-text-dim italic text-center py-4">No tienes notificaciones</p>
              )}
            </div>
          </div>

          <div className="bg-panel p-6 rounded-2xl border border-border">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Suscripciones
            </h3>
            <div className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border">
              <span className="text-xs text-white">Nuevos Diseños</span>
              <div className="w-10 h-5 bg-accent rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full"></div>
              </div>
            </div>
            <p className="mt-4 text-[9px] text-text-dim leading-relaxed uppercase tracking-wider">
              Recibirás un correo cada vez que agreguemos un nuevo diseño o software a la plataforma.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-light tracking-tighter text-white uppercase">Mis <span className="text-accent font-bold">Adquisiciones</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-2">Accede a tus herramientas y documentos digitales</p>
            </div>
            <div className="hidden md:flex items-center gap-4 bg-panel px-6 py-3 rounded-xl border border-border">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-text-dim">Total Compras</p>
                <p className="text-xl font-bold text-white">{purchasedProducts.length}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-accent opacity-20" />
            </div>
          </header>

          {purchasedProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentItems.map((product) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-panel rounded-2xl border border-border overflow-hidden flex flex-col"
                  >
                    <div className="h-40 relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent"></div>
                      <div className="absolute bottom-4 left-6">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20 mb-2 inline-block">
                          {product.category}
                        </span>
                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" /> Documentos del Diseño
                        </h4>
                        <div className="space-y-2">
                          {product.documents?.map((doc, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border hover:border-accent transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-accent" />
                                <span className="text-xs text-white group-hover:text-accent transition-colors">{doc.name}</span>
                              </div>
                              <a 
                                href={doc.url}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-black transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                              >
                                Descargar <Download className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button className="w-full py-3 bg-accent text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center justify-center gap-2">
                        <Package className="w-4 h-4" /> Acceder al Software
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-4 py-2 bg-panel border border-border text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    <ArrowLeft className="w-3 h-3" /> Anterior
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg font-bold text-[10px] transition-all ${
                          currentPage === page 
                            ? 'bg-accent text-black' 
                            : 'bg-panel border border-border text-text-dim hover:text-white hover:border-accent'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-4 py-2 bg-panel border border-border text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-accent transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                  >
                    Siguiente <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-panel p-20 rounded-2xl border border-border text-center">
              <ShoppingBag className="w-16 h-16 text-text-dim mx-auto mb-6 opacity-20" />
              <h3 className="text-xl font-bold text-white mb-2">No tienes adquisiciones aún</h3>
              <p className="text-text-dim text-sm max-w-sm mx-auto mb-8">
                Explora nuestra tienda digital y adquiere las mejores herramientas para tus proyectos de ingeniería.
              </p>
              <button 
                onClick={() => navigate('/productos')}
                className="bg-accent text-black px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all"
              >
                Ir a la Tienda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
