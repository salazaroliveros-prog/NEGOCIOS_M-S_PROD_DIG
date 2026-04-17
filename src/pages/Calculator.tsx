import React from 'react';
import { motion } from 'motion/react';
import { Calculator as CalcIcon, MapPin, Ruler, Info, ArrowRight, Upload, Check, CreditCard, Clock, X } from 'lucide-react';
import { GUATEMALA_DEPARTMENTS } from '../constants/data';
import { GuatemalaMap } from '../components/GuatemalaMap';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const CalculatorPage = () => {
  const [m2, setM2] = React.useState<number>(100);
  const [department, setDepartment] = React.useState(GUATEMALA_DEPARTMENTS[0]);
  const [workType, setWorkType] = React.useState<'economica' | 'estandar' | 'premium'>('estandar');
  const [user, setUser] = React.useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = React.useState(false);
  const [receiptUrl, setReceiptUrl] = React.useState('');
  const [bankInfo, setBankInfo] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [leadInfo, setLeadInfo] = React.useState({ name: '', phone: '' });
  const [showResults, setShowResults] = React.useState(false);
  const navigate = useNavigate();

  const workTypeFactors = {
    economica: 0.85,
    estandar: 1.0,
    premium: 1.35
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const fetchBankInfo = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'config', 'site'));
        if (configDoc.exists()) {
          setBankInfo(configDoc.data().bankAccountInfo || 'Información bancaria no disponible.');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'config/site');
      }
    };

    fetchBankInfo();
    return () => unsubscribe();
  }, []);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadInfo.name || !leadInfo.phone) return;

    try {
      await addDoc(collection(db, 'leads'), {
        name: leadInfo.name,
        phone: leadInfo.phone,
        m2,
        department: department.name,
        workType,
        estimatedTotal: totalCost,
        createdAt: serverTimestamp()
      });
      setShowResults(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
      setShowResults(true); // Still show results even if lead capture fails
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = async () => {
    if (!user || !receiptUrl) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, 'payment_receipts'), {
        id: `receipt_${Date.now()}`,
        userId: user.uid,
        userName: user.displayName || user.email,
        productId: 'expediente_tecnico',
        productName: `Expediente Técnico (${m2}m² en ${department.name})`,
        receiptImageUrl: receiptUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
        details: {
          m2,
          department: department.name,
          totalEstimated: totalCost
        }
      });
      alert('Comprobante enviado con éxito. El administrador validará su pago pronto.');
      setShowPurchaseModal(false);
      setReceiptUrl('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payment_receipts');
      alert('Error al enviar el comprobante.');
    } finally {
      setIsUploading(false);
    }
  };

  const baseCost = department.baseCostPerM2 * workTypeFactors[workType];
  const totalCost = (m2 * baseCost) * department.logisticFactor;
  const materialCost = totalCost * 0.65;
  const laborCost = totalCost * 0.35;

  return (
    <div className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto bg-bg min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white uppercase">
          Calculadora de <br />
          <span className="text-gold font-bold">Costos de Obra</span>
        </h1>
        <p className="mt-4 text-text-dim max-w-2xl font-medium border-l-2 border-border pl-4">
          Estimaciones precisas para el mercado de Guatemala. 
          Factores logísticos regionales aplicados según el departamento.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-panel p-8 rounded-xl border border-border">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gold mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Configuración del Proyecto
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Departamento</label>
                <select
                  className="w-full bg-input border border-border rounded-lg py-3 px-4 text-white font-bold focus:ring-2 focus:ring-gold outline-none"
                  value={department.name}
                  onChange={(e) => {
                    const dep = GUATEMALA_DEPARTMENTS.find(d => d.name === e.target.value);
                    if (dep) setDepartment(dep);
                  }}
                >
                  {GUATEMALA_DEPARTMENTS.map(dep => (
                    <option key={dep.name} value={dep.name}>{dep.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Tipo de Obra</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['economica', 'estandar', 'premium'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setWorkType(type)}
                      className={`py-2 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        workType === type ? 'bg-gold text-black border-gold' : 'bg-input border-border text-text-dim hover:border-gold/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim mb-2">Área de Construcción (m²)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={m2}
                    onChange={(e) => setM2(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-lg py-4 px-4 text-2xl font-black text-white focus:ring-2 focus:ring-gold outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim font-bold">M²</span>
                </div>
              </div>
            </div>
          </div>

          {!showResults && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-panel p-8 rounded-xl border border-gold/30 shadow-2xl shadow-gold/5"
            >
              <h3 className="text-xs font-bold text-gold uppercase tracking-widest mb-4">Ver Resultados Detallados</h3>
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Tu Nombre"
                  required
                  value={leadInfo.name}
                  onChange={e => setLeadInfo({...leadInfo, name: e.target.value})}
                  className="w-full bg-input border border-border rounded-lg py-3 px-4 text-white text-sm outline-none focus:border-gold"
                />
                <input
                  type="tel"
                  placeholder="Teléfono / WhatsApp"
                  required
                  value={leadInfo.phone}
                  onChange={e => setLeadInfo({...leadInfo, phone: e.target.value})}
                  className="w-full bg-input border border-border rounded-lg py-3 px-4 text-white text-sm outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="w-full bg-gold text-black font-bold py-4 rounded-lg text-xs uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                >
                  Calcular Ahora <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          <GuatemalaMap 
            selectedDepartment={department.name} 
            onSelect={(name) => {
              const dep = GUATEMALA_DEPARTMENTS.find(d => d.name === name);
              if (dep) setDepartment(dep);
            }} 
          />
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-6">
          {showResults ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-panel text-white p-10 rounded-xl border border-border relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">Costo Total Estimado</span>
                  <div className="text-6xl md:text-7xl font-light mt-4 tracking-tighter text-white">
                    Q. {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-border">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gold block mb-1">Materiales e Insumos</span>
                        <div className="text-3xl font-bold text-white">Q. {materialCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gold block mb-1">Mano de Obra</span>
                        <div className="text-3xl font-bold text-white">Q. {laborCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 right-0 p-6 opacity-10">
                  <CalcIcon className="w-32 h-32 text-gold" />
                </div>
              </div>

              <div className="bg-gold/5 p-8 rounded-xl border border-gold/20 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-gold/10 rounded-full text-gold">
                  <Info className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-gold uppercase text-xs tracking-widest">Aviso de Conversión Premium</h3>
                  <p className="text-sm text-text-dim mt-2 leading-relaxed">
                    Este es un costo estimado. Para obtener el desglose de renglones de trabajo, listado de materiales y planos de este modelo, adquiera nuestro <span className="text-white font-bold">Pack de Planificación Premium</span>.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setShowPurchaseModal(true)}
                    className="bg-gold text-black font-bold text-[10px] uppercase tracking-widest py-4 px-8 rounded-lg hover:bg-gold/90 transition-all shadow-lg shadow-gold/20"
                  >
                    Adquirir Pack Premium
                  </button>
                  <button 
                    onClick={() => navigate('/servicios')}
                    className="border border-gold text-gold font-bold text-[10px] uppercase tracking-widest py-4 px-8 rounded-lg hover:bg-gold hover:text-black transition-all"
                  >
                    Contactar Asesor
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-panel/50 border border-dashed border-border rounded-xl h-[400px] flex flex-col items-center justify-center text-center p-8">
              <CalcIcon className="w-16 h-16 text-text-dim/20 mb-4" />
              <p className="text-text-dim text-sm max-w-xs">Ingresa tus datos para desbloquear el desglose técnico y financiero de tu proyecto.</p>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-panel w-full max-w-lg rounded-2xl border border-border overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-bg/50">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Adquirir Expediente Técnico</h3>
              </div>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="text-text-dim hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-bg/50 p-4 rounded-xl border border-border">
                <p className="text-[10px] uppercase font-bold text-text-dim mb-1">Detalles del Pedido</p>
                <p className="text-sm text-white font-bold">Expediente Técnico - {m2}m² en {department.name}</p>
                <p className="text-xl font-bold text-accent mt-2">Q. 450.00</p>
                <p className="text-[9px] text-text-dim mt-1 italic">*Precio fijo por generación de expediente técnico digital.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <Info className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Instrucciones de Pago</p>
                    <p className="text-[11px] text-text-dim leading-relaxed">
                      {bankInfo}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-text-dim">Cargar Comprobante</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-border group-hover:border-accent/50 rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 bg-bg/30">
                      {receiptUrl ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                          <img src={receiptUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-accent/10 rounded-full text-accent">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-white">Haz clic o arrastra una imagen</p>
                            <p className="text-[10px] text-text-dim mt-1">PNG, JPG hasta 1MB</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-border text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUploadReceipt}
                  disabled={!receiptUrl || isUploading}
                  className="flex-[2] px-6 py-4 rounded-xl bg-accent text-black font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isUploading ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
