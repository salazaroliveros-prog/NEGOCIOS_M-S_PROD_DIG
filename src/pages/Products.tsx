import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Download, ExternalLink, Check, Upload, CreditCard, Clock, MessageSquare } from 'lucide-react';
import { DIGITAL_PRODUCTS } from '../constants/data';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const ProductsPage = () => {
  const [user, setUser] = React.useState<any>(null);
  const [purchasedIds, setPurchasedIds] = React.useState<string[]>([]);
  const [pendingReceipts, setPendingReceipts] = React.useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [receiptUrl, setReceiptUrl] = React.useState('');
  const [bankInfo, setBankInfo] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Listen to user purchases
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setPurchasedIds(docSnap.data().purchases || []);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });

        // Listen to pending receipts (Filtered by user)
        const q = query(
          collection(db, 'payment_receipts'), 
          where('userId', '==', currentUser.uid)
        );
        const unsubReceipts = onSnapshot(q, (snapshot) => {
          const pending = snapshot.docs
            .map(doc => doc.data())
            .filter(r => r.status === 'pending')
            .map(r => r.productId);
          setPendingReceipts(pending);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'payment_receipts');
        });

        // Get bank info
        try {
          const configDoc = await getDoc(doc(db, 'config', 'site'));
          if (configDoc.exists()) {
            setBankInfo(configDoc.data().bankAccountInfo || 'Información bancaria no disponible.');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'config/site');
        }

        return () => {
          unsubUser();
          unsubReceipts();
        };
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUploadReceipt = async () => {
    if (!user || !selectedProduct || !receiptUrl) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, 'payment_receipts'), {
        id: `receipt_${Date.now()}`,
        userId: user.uid,
        userName: user.displayName || user.email,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        receiptImageUrl: receiptUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Comprobante enviado con éxito. El administrador validará su pago pronto.');
      setSelectedProduct(null);
      setReceiptUrl('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payment_receipts');
      alert('Error al enviar el comprobante.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePurchaseClick = (product: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedProduct(product);
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-bg min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white uppercase">
          Tienda <br />
          <span className="text-accent font-bold">Digital Premium</span>
        </h1>
        <p className="mt-4 text-text-dim max-w-2xl font-medium border-l-2 border-border pl-4">
          Herramientas de software y diseños premium para optimizar su flujo de trabajo.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DIGITAL_PRODUCTS.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -5 }}
            className="bg-panel rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-2xl transition-all group"
          >
            <div className="h-48 relative overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800';
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-gold/20 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-gold border border-gold/30">
                  {product.category}
                </div>
                {product.isLite && (
                  <div className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-green-500 border border-green-500/30">
                    Versión Lite
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
              <p className="text-text-dim text-sm mb-6 leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-dim block">Inversión</span>
                  <span className="text-xl font-bold text-gold">
                    {product.isLite ? 'GRATIS' : `Q. ${product.price.toLocaleString()}`}
                  </span>
                </div>
                {purchasedIds.includes(product.id) || product.isLite ? (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        if (product.isLite) {
                          // Handle Lite version access (e.g., open a demo or download)
                          window.dispatchEvent(new CustomEvent('open-chat', { 
                            detail: { message: `Hola, me gustaría probar la versión Lite de ${product.name}.` } 
                          }));
                        } else {
                          navigate('/perfil');
                        }
                      }}
                      className={`${product.isLite ? 'bg-gold' : 'bg-green-500'} text-black p-3 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest justify-center`}
                    >
                      {product.isLite ? <Download className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                      {product.isLite ? 'Probar Ahora' : 'Adquirido'}
                    </button>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-chat', { 
                          detail: { message: `Hola, tengo una consulta sobre el producto: ${product.name}` } 
                        }));
                      }}
                      className="text-[9px] text-gold font-bold uppercase tracking-widest hover:underline flex items-center gap-1 justify-center"
                    >
                      <MessageSquare className="w-3 h-3" /> Soporte Técnico
                    </button>
                  </div>
                ) : pendingReceipts.includes(product.id) ? (
                  <div className="flex flex-col gap-2">
                    <button 
                      disabled
                      className="bg-yellow-500/20 text-yellow-500 p-3 rounded-lg border border-yellow-500/30 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest justify-center"
                    >
                      <Clock className="w-5 h-5" /> Pendiente
                    </button>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-chat', { 
                          detail: { message: `Hola, envié mi comprobante para ${product.name} y quisiera saber el estado.` } 
                        }));
                      }}
                      className="text-[9px] text-gold font-bold uppercase tracking-widest hover:underline flex items-center gap-1 justify-center"
                    >
                      <MessageSquare className="w-3 h-3" /> Consultar Estado
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-chat', { 
                          detail: { message: `Hola, me interesa el producto ${product.name}. ¿Podrían darme más información?` } 
                        }));
                      }}
                      className="p-3 text-text-dim hover:text-gold transition-all"
                      title="Consultar sobre este producto"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handlePurchaseClick(product)}
                      className="bg-gold text-black p-3 rounded-lg hover:bg-gold/90 transition-all shadow-lg shadow-gold/10"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-panel max-w-lg w-full rounded-2xl border border-border overflow-hidden shadow-2xl"
          >
            <div className="p-8 space-y-6">
              <header className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Proceso de <span className="text-accent">Adquisición</span></h2>
                  <p className="text-text-dim text-xs uppercase tracking-widest mt-1">{selectedProduct.name}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-text-dim hover:text-white transition-colors">
                  <ExternalLink className="w-6 h-6 rotate-45" />
                </button>
              </header>

              <div className="bg-bg p-6 rounded-xl border border-border space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Datos de Transferencia</h3>
                </div>
                <p className="text-sm text-white font-mono leading-relaxed bg-panel p-4 rounded-lg border border-border/50">
                  {bankInfo}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] uppercase font-bold text-text-dim">Monto a depositar</span>
                  <span className="text-lg font-bold text-accent">Q. {selectedProduct.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Upload className="w-5 h-5" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Adjuntar Boleta de Pago</h3>
                </div>
                
                <div className="space-y-4">
                  {!receiptUrl ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-text-dim group-hover:text-accent mb-2 transition-colors" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim group-hover:text-accent">Haga clic para subir imagen</p>
                        <p className="text-[8px] text-text-dim mt-1">PNG, JPG o JPEG (Máx. 1MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1024 * 1024) {
                              alert('La imagen es demasiado grande. Máximo 1MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setReceiptUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-border h-48">
                      <img src={receiptUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                          onClick={() => setReceiptUrl('')}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all"
                        >
                          <ExternalLink className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.3em]">
                      <span className="bg-panel px-2 text-text-dim">O usa una URL</span>
                    </div>
                  </div>

                  <input 
                    type="text" 
                    value={receiptUrl.startsWith('data:') ? '' : receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-[10px] text-white focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleUploadReceipt}
                disabled={!receiptUrl || isUploading}
                className="w-full py-4 bg-accent text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? <Clock className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isUploading ? 'Enviando...' : 'Enviar para Validación'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
