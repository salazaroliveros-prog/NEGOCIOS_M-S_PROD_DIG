import React from 'react';
import { CalculatorBanner } from '../components/CalculatorBanner';
import { motion } from 'motion/react';
import { ShoppingCart, Download, ExternalLink, Check, Upload, CreditCard, Clock, MessageSquare } from 'lucide-react';
import { DIGITAL_PRODUCTS } from '../constants/data';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const ProductsPage = () => {
  const [user, setUser] = React.useState<any>(null);
  // Nuevo estado para modal de renders
  const [showRendersModal, setShowRendersModal] = React.useState(false);
  const [renders, setRenders] = React.useState<any[]>([]); // [{url,label}]
  const [selectedRendersProduct, setSelectedRendersProduct] = React.useState<any>(null);

  // Simulación: obtener renders por producto (en real, usar Firestore o similar)
  const getRendersForProduct = (productId: string) => {
    // Aquí deberías obtener los renders de la base de datos por producto
    // Por ahora, demo con imágenes por defecto
    return [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', label: 'Render Interior' },
      { url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&q=80&w=800', label: 'Render Exterior' }
    ];
  };
  const [purchasedIds, setPurchasedIds] = React.useState<string[]>([]);
  const [pendingReceipts, setPendingReceipts] = React.useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [receiptUrl, setReceiptUrl] = React.useState('');
  const [bankInfo, setBankInfo] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [firestoreError, setFirestoreError] = React.useState<string | null>(null);
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
          setFirestoreError('No se pudo obtener tus compras. Intenta más tarde.');
          console.error(error);
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
          setFirestoreError('No se pudo obtener tus comprobantes. Intenta más tarde.');
          console.error(error);
        });

        // Get bank info
        try {
          const configDoc = await getDoc(doc(db, 'config', 'site'));
          if (configDoc.exists()) {
            setBankInfo(configDoc.data().bankAccountInfo || 'Información bancaria no disponible.');
          }
        } catch (error) {
          setFirestoreError('No se pudo obtener la información bancaria. Intenta más tarde.');
          console.error(error);
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
    setShowRendersModal(false); // Cierra modal de renders si está abierto
    setSelectedRendersProduct(null);
    setSelectedProduct(product);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <div className="flex-1 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white uppercase">
            Tienda <br />
            <span className="text-accent font-bold">Digital Premium</span>
          </h1>
          <p className="mt-4 text-text-dim max-w-2xl font-medium border-l-2 border-border pl-4">
            Herramientas de software y diseños premium para optimizar su flujo de trabajo.
          </p>
        </header>
        {firestoreError && (
          <div className="mb-8 p-4 bg-red-900/80 border border-red-500 text-red-200 rounded-xl text-center font-bold">
            {firestoreError}
          </div>
        )}

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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(null); // Cierra modal de compra si está abierto
                    setSelectedRendersProduct(product);
                    setRenders(getRendersForProduct(product.id));
                    setShowRendersModal(true);
                  }}
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
                        title="Ver detalles del producto"
                        aria-label="Ver detalles del producto"
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
                        title="Agregar al carrito"
                        aria-label="Agregar al carrito"
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

        {/* Modal flotante de renders fuera del map */}
        {showRendersModal && selectedRendersProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-panel max-w-2xl w-full rounded-2xl border border-border overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setShowRendersModal(false)}
                className="absolute top-4 right-4 text-text-dim hover:text-white transition-colors z-10"
                title="Cerrar"
                aria-label="Cerrar"
              >
                <span className="text-3xl font-bold">&times;</span>
              </button>
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-2">Galería de Renders</h2>
                <p className="text-text-dim text-xs uppercase tracking-widest mb-4">{selectedRendersProduct.name}</p>
                <CalculatorBanner images={renders} />
                <button
                  onClick={() => { setShowRendersModal(false); navigate('/calculadora'); }}
                  className="w-full py-4 bg-accent text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Calcular con tus m2 disponibles
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
