import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  FileText, 
  Download, 
  TrendingUp, 
  ArrowUpRight,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  Send,
  Plus,
  Trash2,
  UserPlus,
  Check,
  AlertCircle,
  Palette,
  Bell,
  ExternalLink,
  Image as ImageIcon,
  LogOut
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  addDoc,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  arrayUnion
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { DIGITAL_PRODUCTS } from '../constants/data';

const data = [
  { name: 'Lun', ventas: 4000, proyectado: 4400 },
  { name: 'Mar', ventas: 3000, proyectado: 3200 },
  { name: 'Mie', ventas: 2000, proyectado: 2400 },
  { name: 'Jue', ventas: 2780, proyectado: 2800 },
  { name: 'Vie', ventas: 1890, proyectado: 2100 },
  { name: 'Sab', ventas: 2390, proyectado: 2500 },
  { name: 'Dom', ventas: 3490, proyectado: 3800 },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'resumen' | 'chat' | 'proyectos' | 'tareas' | 'config' | 'usuarios' | 'ventas' | 'clientes' | 'ajustes' | 'leads'>('resumen');
  const [chatFilter, setChatFilter] = React.useState<'active' | 'closed'>('active');
  const [userRole, setUserRole] = React.useState<'admin' | 'editor' | 'viewer' | null>(null);
  
  // Leads State
  const [leads, setLeads] = React.useState<any[]>([]);
  const [chatSessions, setChatSessions] = React.useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [replyText, setReplyText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [adminAvatar, setAdminAvatar] = React.useState<string>('https://api.dicebear.com/7.x/bottts/svg?seed=admin');
  
  // Users State
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  
  // Payment Validation State
  const [paymentReceipts, setPaymentReceipts] = React.useState<any[]>([]);
  
  // Notification Permission
  React.useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // Projects State
  const [projects, setProjects] = React.useState<any[]>([]);
  const [newProject, setNewProject] = React.useState({ title: '', description: '', image: '', link: '', deliveryDate: '', status: 'active' });
  const [editingProject, setEditingProject] = React.useState<any>(null);
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);
  
  // Tasks State
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [prevTasksCount, setPrevTasksCount] = React.useState(0);
  const [newTask, setNewTask] = React.useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });

  // Page Config State
  const [pageConfig, setPageConfig] = React.useState<any>({
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
  });

  // Products & Services State
  const [products, setProducts] = React.useState<any[]>([]);
  const [services, setServices] = React.useState<any[]>([]);
  const [landingSections, setLandingSections] = React.useState<any[]>([]);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);
  const [editingService, setEditingService] = React.useState<any>(null);
  const [newProduct, setNewProduct] = React.useState({ name: '', description: '', price: 0, category: 'software', image: '' });
  const [newService, setNewService] = React.useState({ title: '', description: '', detailedDescription: '', price: 0, category: 'construccion', icon: 'HardHat' });
  const [editingLandingSection, setEditingLandingSection] = React.useState<any>(null);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auth & Role Check
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role);
            if (data.avatarUrl) setAdminAvatar(data.avatarUrl);
          } else if (user.email === 'salazaroliveros@gmail.com') {
            setUserRole('admin');
            const defaultAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=admin';
            setAdminAvatar(defaultAvatar);
            // Bootstrap admin user
            setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              role: 'admin',
              name: 'Super Admin',
              avatarUrl: defaultAvatar
            }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
        return () => unsubDoc();
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for chat sessions
  React.useEffect(() => {
    if (!userRole) return;
    const q = query(
      collection(db, 'chats'), 
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((chat: any) => chat.status === chatFilter);
      
      // Notify on new active chat
      if (chatFilter === 'active' && sessions.length > chatSessions.length) {
        const newChat = sessions.find(s => !chatSessions.find(cs => cs.id === s.id)) as any;
        if (newChat) sendNotification('Nuevo Chat', `Visitante ${newChat.userName || newChat.id} ha iniciado una conversación.`);
      }

      setChatSessions(sessions);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    });
    return () => unsubscribe();
  }, [userRole]);

  // Listen for leads
  React.useEffect(() => {
    if (!userRole) return;
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });
    return () => unsubscribe();
  }, [userRole]);

  // Listen for messages in selected chat
  React.useEffect(() => {
    if (!selectedChatId) return;
    const q = query(
      collection(db, 'chats', selectedChatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      
      // Mark as read
      msgs.forEach((msg: any) => {
        if (msg.sender === 'user' && !msg.read) {
          updateDoc(doc(db, 'chats', selectedChatId, 'messages', msg.id), { read: true })
            .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${selectedChatId}/messages/${msg.id}`));
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${selectedChatId}/messages`);
    });
    return () => unsubscribe();
  }, [selectedChatId]);

  // Listen for projects
  React.useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });
    return () => unsubscribe();
  }, []);

  // Listen for tasks
  React.useEffect(() => {
    if (!userRole) return;
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Check for upcoming deadlines (2 days before)
      const now = new Date();
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(now.getDate() + 2);

      taskList.forEach((task: any) => {
        if (task.dueDate && task.status !== 'done') {
          const dueDate = new Date(task.dueDate);
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 2 && diffDays > 0 && !task.reminderSent) {
            sendNotification('Tarea Próxima a Vencer', `La tarea "${task.title}" vence en ${diffDays} días.`);
            // Mark reminder as sent to avoid spam
            updateDoc(doc(db, 'tasks', task.id), { reminderSent: true })
              .catch(err => handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`));
          }
        }
      });
      
      // Notify on new task
      if (taskList.length > prevTasksCount && prevTasksCount > 0) {
        const latestTask = taskList[0] as any;
        sendNotification('Nueva Tarea', `Se ha creado la tarea: ${latestTask.title}`);
      }
      
      setTasks(taskList);
      setPrevTasksCount(taskList.length);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });
    return () => unsubscribe();
  }, [userRole, prevTasksCount]);

  // Listen for page config
  React.useEffect(() => {
    if (!userRole) return;
    const unsubscribe = onSnapshot(doc(db, 'config', 'site'), (doc) => {
      if (doc.exists()) {
        setPageConfig(doc.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/site');
    });
    return () => unsubscribe();
  }, [userRole]);

  // Listen for users
  React.useEffect(() => {
    if (userRole !== 'admin') return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, [userRole]);

  // Listen for payment receipts
  React.useEffect(() => {
    if (userRole !== 'admin') return;
    const q = query(collection(db, 'payment_receipts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPaymentReceipts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'payment_receipts');
    });
    return () => unsubscribe();
  }, [userRole]);

  // Listen for products
  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  // Listen for services
  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    });
    return () => unsubscribe();
  }, []);

  // Listen for landing sections
  React.useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'landing'), (docSnap) => {
      if (docSnap.exists()) {
        setLandingSections(docSnap.data().sections || []);
      } else {
        // Initialize with default sections
        const defaultSections = [
          { id: 'hero', title: 'Hero Section', type: 'hero', visible: true },
          { id: 'services', title: 'Nuestros Servicios', type: 'grid', visible: true },
          { id: 'projects', title: 'Proyectos Destacados', type: 'carousel', visible: true },
          { id: 'testimonials', title: 'Testimonios', type: 'list', visible: true }
        ];
        setDoc(doc(db, 'config', 'landing'), { sections: defaultSections })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, 'config/landing'));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/landing');
    });
    return () => unsubscribe();
  }, []);

  const handleApprovePayment = async (receipt: any) => {
    try {
      // 1. Update receipt status
      await updateDoc(doc(db, 'payment_receipts', receipt.id), {
        status: 'approved',
        validatedAt: serverTimestamp()
      });

      // 2. Add product to user's purchases
      const userRef = doc(db, 'users', receipt.userId);
      await updateDoc(userRef, {
        purchases: arrayUnion(receipt.productId)
      });

      // 3. Send notification to user
      await addDoc(collection(db, 'notifications'), {
        id: `notif_${Date.now()}`,
        userId: receipt.userId,
        title: 'Pago Aprobado',
        message: `Tu pago por "${receipt.productName}" ha sido validado con éxito. Ya puedes acceder a tu producto.`,
        type: 'success',
        read: false,
        createdAt: serverTimestamp()
      });

      alert(`Pago aprobado. El producto "${receipt.productName}" ha sido añadido a la cuenta de ${receipt.userName}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `payment_receipts/${receipt.id}`);
    }
  };

  const handleRejectPayment = async (receipt: any) => {
    if (!confirm('¿Estás seguro de rechazar este comprobante?')) return;
    try {
      await updateDoc(doc(db, 'payment_receipts', receipt.id), {
        status: 'rejected',
        validatedAt: serverTimestamp()
      });

      // Send notification to user about rejection
      await addDoc(collection(db, 'notifications'), {
        id: `notif_${Date.now()}`,
        userId: receipt.userId,
        title: 'Pago Rechazado',
        message: `Tu comprobante de pago para "${receipt.productName}" ha sido rechazado. Por favor, verifica la información e intenta de nuevo.`,
        type: 'error',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payment_receipts/${receipt.id}`);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await setDoc(doc(db, 'config', 'site'), {
        ...pageConfig,
        id: 'site',
        updatedAt: serverTimestamp()
      });
      alert('Configuración guardada correctamente');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'config/site');
    }
  };

  // Auto-close inactive chats (30 minutes)
  React.useEffect(() => {
    if (!userRole || activeTab !== 'chat') return;
    const interval = setInterval(async () => {
      const now = Date.now();
      const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

      chatSessions.forEach(async (session) => {
        if (session.status === 'active' && session.lastActivity) {
          const lastActivity = (session.lastActivity as Timestamp).toMillis();
          if (now - lastActivity > INACTIVITY_LIMIT) {
            try {
              await updateDoc(doc(db, 'chats', session.id), { 
                status: 'closed',
                closedReason: 'inactivity'
              });
              // Add system message
              await addDoc(collection(db, 'chats', session.id, 'messages'), {
                id: `msg_system_${Date.now()}`,
                text: 'SISTEMA: Esta sesión se ha cerrado automáticamente debido a 30 minutos de inactividad.',
                sender: 'admin',
                timestamp: serverTimestamp(),
                read: false,
                isSystem: true
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `chats/${session.id}`);
            }
          }
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [userRole, chatSessions, activeTab]);

  // Task Reminders
  React.useEffect(() => {
    if (!userRole || tasks.length === 0) return;
    
    const checkReminders = async () => {
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
      
      for (const task of tasks) {
        if (task.status !== 'done' && task.dueDate && !task.reminderSent) {
          const dueDate = new Date(task.dueDate);
          if (dueDate <= twoDaysFromNow && dueDate >= now) {
            try {
              // Send browser notification
              sendNotification('Recordatorio de Tarea', `La tarea "${task.title}" vence pronto (${task.dueDate})`);
              
              // Update task to avoid duplicate reminders
              await updateDoc(doc(db, 'tasks', task.id), { reminderSent: true });
              
              // Add in-app notification for admin
              const adminId = auth.currentUser?.uid;
              if (adminId) {
                await addDoc(collection(db, 'notifications'), {
                  id: `notif_rem_${Date.now()}`,
                  userId: adminId,
                  title: 'Vencimiento Próximo',
                  message: `La tarea "${task.title}" vence el ${task.dueDate}.`,
                  type: 'warning',
                  read: false,
                  createdAt: serverTimestamp()
                });
              }
            } catch (err) {
              console.error('Error sending reminder:', err);
            }
          }
        }
      }
    };

    checkReminders();
  }, [tasks, userRole]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChatId) return;
    try {
      await addDoc(collection(db, 'chats', selectedChatId, 'messages'), {
        id: `msg_${Date.now()}`,
        text: replyText,
        sender: 'admin',
        senderAvatar: adminAvatar,
        timestamp: serverTimestamp(),
        read: false
      });
      setReplyText('');
      // Reset typing indicator and update activity
      await updateDoc(doc(db, 'chats', selectedChatId), { 
        adminTyping: false,
        lastActivity: serverTimestamp(),
        lastMessage: replyText,
        lastMessageAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${selectedChatId}/messages`);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyText(e.target.value);
    if (!isTyping && selectedChatId) {
      setIsTyping(true);
      updateDoc(doc(db, 'chats', selectedChatId), { adminTyping: true })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${selectedChatId}`));
      setTimeout(() => {
        setIsTyping(false);
        updateDoc(doc(db, 'chats', selectedChatId), { adminTyping: false })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${selectedChatId}`));
      }, 3000);
    }
  };

  const validateImageUrl = (url: string) => {
    const pattern = /\.(jpg|jpeg|png|gif|webp)$/i;
    return pattern.test(url);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.image) return;
    
    if (!validateImageUrl(newProject.image)) {
      alert('Por favor, ingresa una URL de imagen válida (.jpg, .png, .jpeg, .gif, .webp)');
      return;
    }

    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        id: `proj_${Date.now()}`,
        createdAt: serverTimestamp()
      });
      setNewProject({ title: '', description: '', image: '', link: '', deliveryDate: '', status: 'active' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title) return;

    if (!validateImageUrl(editingProject.image)) {
      alert('Por favor, ingresa una URL de imagen válida (.jpg, .png, .jpeg, .gif, .webp)');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', editingProject.id);
      await updateDoc(projectRef, {
        title: editingProject.title,
        description: editingProject.description,
        image: editingProject.image,
        link: editingProject.link,
        deliveryDate: editingProject.deliveryDate || '',
        status: editingProject.status || 'active'
      });
      setEditingProject(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${editingProject.id}`);
    }
  };

  const toggleProjectStatus = async (projectId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
      await updateDoc(doc(db, 'projects', projectId), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${projectId}`);
    }
  };

  // Product CRUD
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.image) return;

    if (!validateImageUrl(newProduct.image)) {
      alert('Por favor, ingresa una URL de imagen válida (.jpg, .png, .jpeg, .gif, .webp)');
      return;
    }

    try {
      const id = `prod_${Date.now()}`;
      await setDoc(doc(db, 'products', id), { ...newProduct, id });
      setNewProduct({ name: '', description: '', price: 0, category: 'software', image: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    if (!validateImageUrl(editingProduct.image)) {
      alert('Por favor, ingresa una URL de imagen válida (.jpg, .png, .jpeg, .gif, .webp)');
      return;
    }

    try {
      await updateDoc(doc(db, 'products', editingProduct.id), editingProduct);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${editingProduct.id}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  // Service CRUD
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `serv_${Date.now()}`;
      await setDoc(doc(db, 'services', id), { ...newService, id });
      setNewService({ title: '', description: '', detailedDescription: '', price: 0, category: 'construccion', icon: 'HardHat' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'services');
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await updateDoc(doc(db, 'services', editingService.id), editingService);
      setEditingService(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `services/${editingService.id}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  };

  // Landing Page Reordering/Editing
  const handleUpdateLandingSections = async (newSections: any[]) => {
    try {
      await setDoc(doc(db, 'config', 'landing'), { sections: newSections }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'config/landing');
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...landingSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    handleUpdateLandingSections(newSections);
  };

  const handleUpdateSectionContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLandingSection) return;
    
    const newSections = landingSections.map(s => 
      s.id === editingLandingSection.id ? editingLandingSection : s
    );
    
    try {
      await handleUpdateLandingSections(newSections);
      setEditingLandingSection(null);
      alert('Sección actualizada correctamente');
    } catch (error) {
      alert('Error al actualizar la sección');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        id: `task_${Date.now()}`,
        status: 'todo',
        createdAt: serverTimestamp(),
        reminderSent: false
      });
      setNewTask({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteProject = async (id: string) => {
    if (projectToDelete === id) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        setProjectToDelete(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
      }
    } else {
      setProjectToDelete(id);
    }
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="bg-panel p-10 rounded-2xl border border-border text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
          <p className="text-text-dim mb-8">Debes iniciar sesión con una cuenta autorizada para acceder al portal de administración.</p>
          <p className="text-xs text-accent uppercase tracking-widest font-bold">CONSTRUM&S SISTEMAS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside className="w-64 bg-panel text-white p-6 hidden md:flex flex-col gap-8 fixed h-full border-r border-border">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold tracking-tighter uppercase">ADMIN PORTAL</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('resumen')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'resumen' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
          >
            <TrendingUp className="w-4 h-4 text-accent" /> Resumen
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4 text-accent" /> Chat en Vivo
          </button>
          {(userRole === 'admin' || userRole === 'editor') && (
            <>
              <button 
                onClick={() => setActiveTab('proyectos')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'proyectos' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
              >
                <Package className="w-4 h-4 text-accent" /> Proyectos
              </button>
              <button 
                onClick={() => setActiveTab('tareas')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'tareas' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
              >
                <CheckCircle2 className="w-4 h-4 text-accent" /> Tareas
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
              >
                <Palette className="w-4 h-4 text-accent" /> Editor de Página
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => setActiveTab('usuarios')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'usuarios' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
                >
                  <Users className="w-4 h-4 text-accent" /> Usuarios
                </button>
              )}
            </>
          )}
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
          >
            <Users className="w-4 h-4 text-accent" /> Prospectos (Leads)
          </button>
          <button 
            onClick={() => setActiveTab('ventas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'ventas' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
          >
            <ShoppingBag className="w-4 h-4 text-accent" /> Ventas
          </button>
          <button 
            onClick={() => setActiveTab('clientes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'clientes' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
          >
            <Users className="w-4 h-4 text-accent" /> Clientes
          </button>
          <button 
            onClick={() => setActiveTab('ajustes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${activeTab === 'ajustes' ? 'bg-bg border border-border text-white font-medium' : 'text-text-dim hover:bg-bg hover:text-white'}`}
          >
            <Settings className="w-4 h-4 text-accent" /> Ajustes
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-2">
            <img src={adminAvatar} alt="Admin" className="w-8 h-8 rounded-full bg-accent border border-border" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest">{userRole}</p>
              <p className="text-[10px] text-text-dim">{auth.currentUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              await auth.signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-text-dim hover:bg-red-500/10 hover:text-red-500 transition-all rounded-lg text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Salir del Panel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {activeTab === 'resumen' && (
          <>
            <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-light text-white tracking-tight uppercase">Operaciones de <span className="font-bold text-accent">Ventas</span></h1>
                <p className="text-text-dim text-xs uppercase tracking-widest mt-1">Monitoreo de rendimiento y métricas clave.</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-panel border border-border rounded-lg text-[10px] font-bold text-accent hover:bg-bg transition-all uppercase tracking-widest">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-accent text-black rounded-lg text-[10px] font-bold hover:bg-accent/90 transition-all uppercase tracking-widest">
                  <FileText className="w-4 h-4" /> Informe PDF
                </button>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Ventas Mes', value: 'Q. 1.2M', trend: '+12.4%', icon: TrendingUp },
                { label: 'Conversión', value: '14.2%', trend: '+5.0%', icon: ArrowUpRight },
                { label: 'Proyectos', value: '28', trend: '+3.2%', icon: ShoppingBag },
                { label: 'Crecimiento', value: '+8.5%', trend: '+8.1%', icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="bg-panel p-6 rounded-xl border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-input rounded-lg text-accent">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">{stat.trend}</span>
                  </div>
                  <p className="text-text-dim text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-panel p-8 rounded-xl border border-border shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Tendencia Semanal</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8e9299' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8e9299' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1c1e', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#e0e0e0', fontSize: '12px' }}
                      />
                      <Bar dataKey="ventas" fill="#d4a017" radius={[4, 4, 0, 0]} opacity={0.8} />
                      <Bar dataKey="proyectado" fill="#8e9299" radius={[4, 4, 0, 0]} opacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-panel p-8 rounded-xl border border-border text-white">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Canales Activos</h3>
                <div className="space-y-8">
                  {[
                    { label: 'Productos Digitales', value: 40, color: 'bg-gold' },
                    { label: 'Servicios de Construcción', value: 60, color: 'bg-text-dim' },
                  ].map((channel, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span>{channel.label}</span>
                        <span className="text-accent">{channel.value}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${channel.color}`} style={{ width: `${channel.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-4rem)] flex gap-6">
            {/* Chat List */}
            <div className="w-1/3 bg-panel rounded-xl border border-border overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent">Chats</h2>
                <div className="flex bg-bg rounded-lg p-1 border border-border">
                  <button 
                    onClick={() => setChatFilter('active')}
                    className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${chatFilter === 'active' ? 'bg-accent text-black' : 'text-text-dim hover:text-white'}`}
                  >
                    Activos
                  </button>
                  <button 
                    onClick={() => setChatFilter('closed')}
                    className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${chatFilter === 'closed' ? 'bg-accent text-black' : 'text-text-dim hover:text-white'}`}
                  >
                    Historial
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chatSessions.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`w-full p-4 text-left border-b border-border transition-colors ${selectedChatId === chat.id ? 'bg-bg' : 'hover:bg-bg/50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <img src={chat.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor'} alt="Avatar" className="w-6 h-6 rounded-full bg-bg border border-border" />
                        <span className="text-white font-bold text-sm">{chat.userName}</span>
                      </div>
                      <span className="text-[9px] text-text-dim">
                        {chat.lastMessageAt ? (chat.lastMessageAt as Timestamp).toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-text-dim truncate flex-1">{chat.lastMessage || 'Nuevo chat'}</p>
                      {chat.assignedTo && <span className="text-[8px] bg-accent/10 text-accent px-1 rounded ml-2">{chat.assignedTo}</span>}
                      {chat.userTyping && <span className="text-[8px] text-accent animate-pulse font-bold ml-2">Escribiendo...</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-panel rounded-xl border border-border overflow-hidden flex flex-col">
              {selectedChatId ? (
                <>
                  <div className="p-6 border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img 
                        src={chatSessions.find(c => c.id === selectedChatId)?.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor'} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full bg-bg border border-border" 
                      />
                      <div>
                        <h2 className="text-white font-bold">Visitante ({selectedChatId})</h2>
                        <p className="text-[10px] text-accent uppercase tracking-widest">En línea</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        onChange={(e) => {
                          if (selectedChatId) {
                            updateDoc(doc(db, 'chats', selectedChatId), { assignedTo: e.target.value })
                              .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${selectedChatId}`));
                          }
                        }}
                        className="bg-bg border border-border rounded-lg px-2 py-1 text-[10px] text-text-dim outline-none"
                        value={chatSessions.find(c => c.id === selectedChatId)?.assignedTo || ''}
                      >
                        <option value="">Asignar a...</option>
                        <option value="Admin">Admin</option>
                        <option value="Editor 1">Editor 1</option>
                        <option value="Soporte">Soporte</option>
                      </select>
                      <button 
                        onClick={async () => {
                          if (selectedChatId) {
                            try {
                              await updateDoc(doc(db, 'chats', selectedChatId), { status: 'closed' });
                              setSelectedChatId(null);
                            } catch (error) {
                              handleFirestoreError(error, OperationType.UPDATE, `chats/${selectedChatId}`);
                            }
                          }
                        }}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                      >
                        <XCircle className="w-4 h-4" /> Cerrar
                      </button>
                    </div>
                  </div>
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-bg/30">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <img 
                          src={msg.sender === 'admin' ? (msg.senderAvatar || adminAvatar) : (msg.senderAvatar || chatSessions.find(c => c.id === selectedChatId)?.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor')} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full bg-panel border border-border shrink-0 mt-1"
                        />
                        <div
                          className={`max-w-[70%] p-4 rounded-xl text-sm ${
                            msg.sender === 'admin'
                              ? 'bg-accent text-black rounded-tr-none'
                              : 'bg-input border border-border text-white rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                          <div className="flex items-center justify-between mt-1 gap-4">
                            <span className={`text-[9px] ${msg.sender === 'admin' ? 'text-black/40' : 'text-text-dim'}`}>
                              {(msg.timestamp as Timestamp)?.toDate().toLocaleTimeString()}
                            </span>
                            {msg.sender === 'admin' && (
                              <span className="text-[9px] text-black/40">
                                {msg.read ? <Check className="w-3 h-3 inline" /> : <Clock className="w-3 h-3 inline" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {chatSessions.find(c => c.id === selectedChatId)?.userTyping && (
                      <div className="flex justify-start items-center gap-2">
                        <img 
                          src={chatSessions.find(c => c.id === selectedChatId)?.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor'} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full bg-panel border border-border animate-bounce" 
                        />
                        <div className="bg-input border border-border text-accent p-2 rounded-lg text-[10px] animate-pulse font-bold">
                          Usuario está escribiendo...
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 border-t border-border bg-bg/50">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendReply();
                      }}
                      className="flex gap-4"
                    >
                      <input
                        type="text"
                        value={replyText}
                        onChange={handleTyping}
                        placeholder="Escribe una respuesta..."
                        className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-accent text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Enviar
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-text-dim">
                  <MessageSquare className="w-16 h-16 opacity-10 mb-4" />
                  <p>Selecciona un chat para comenzar a responder</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'proyectos' && (
          <div className="space-y-8">
            <header className="mb-10">
              <h1 className="text-3xl font-light text-white tracking-tight uppercase">Gestión de <span className="font-bold text-accent">Proyectos</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-1">Añade y edita los proyectos destacados de la plataforma.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Landing Page Preview & Reorder */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-panel p-8 rounded-xl border border-border">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-6 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Vista Previa Principal
                  </h3>
                  <p className="text-[10px] text-text-dim uppercase tracking-widest mb-6">Reordena las secciones de la página de inicio</p>
                  
                  <div className="space-y-3">
                    {landingSections.map((section, index) => (
                      <div 
                        key={section.id} 
                        className={`flex items-center justify-between p-4 bg-bg border rounded-xl group hover:border-accent/30 transition-all ${
                          editingLandingSection?.id === section.id ? 'border-accent ring-1 ring-accent' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => moveSection(index, 'up')}
                              className="text-text-dim hover:text-accent disabled:opacity-0"
                              disabled={index === 0}
                            >
                              <Plus className="w-3 h-3 rotate-180" />
                            </button>
                            <button 
                              onClick={() => moveSection(index, 'down')}
                              className="text-text-dim hover:text-accent disabled:opacity-0"
                              disabled={index === landingSections.length - 1}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="cursor-pointer" onClick={() => setEditingLandingSection(section)}>
                            <p className="text-xs font-bold text-white">{section.title}</p>
                            <p className="text-[9px] text-text-dim uppercase tracking-widest">{section.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingLandingSection(section)}
                            className={`p-2 rounded-lg transition-all ${editingLandingSection?.id === section.id ? 'text-accent bg-accent/20' : 'text-text-dim hover:text-white'}`}
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const newSections = [...landingSections];
                              newSections[index].visible = !newSections[index].visible;
                              handleUpdateLandingSections(newSections);
                            }}
                            className={`p-2 rounded-lg transition-all ${section.visible ? 'text-accent bg-accent/10' : 'text-text-dim bg-white/5'}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editingLandingSection && (
                    <div className="mt-8 p-6 bg-bg border border-accent/30 rounded-xl animate-in fade-in slide-in-from-top-4">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent">Editando: {editingLandingSection.title}</h4>
                        <button onClick={() => setEditingLandingSection(null)} className="text-text-dim hover:text-white">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <form onSubmit={handleUpdateSectionContent} className="space-y-4">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-text-dim mb-2">Título de Sección</label>
                          <input 
                            type="text"
                            value={editingLandingSection.title}
                            onChange={(e) => setEditingLandingSection({...editingLandingSection, title: e.target.value})}
                            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-text-dim mb-2">Subtítulo / Descripción</label>
                          <textarea 
                            value={editingLandingSection.subtitle || ''}
                            onChange={(e) => setEditingLandingSection({...editingLandingSection, subtitle: e.target.value})}
                            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-accent h-20"
                          />
                        </div>
                        {editingLandingSection.image !== undefined && (
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-text-dim mb-2">URL de Imagen</label>
                            <input 
                              type="text"
                              value={editingLandingSection.image}
                              onChange={(e) => setEditingLandingSection({...editingLandingSection, image: e.target.value})}
                              className="w-full bg-input border border-border rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-accent"
                            />
                          </div>
                        )}
                        <button type="submit" className="w-full bg-accent text-black py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all">
                          Guardar Cambios
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="mt-8 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-2">Configuración Visual</p>
                    <p className="text-[9px] text-text-dim leading-relaxed">
                      Los cambios en el orden y visibilidad se reflejan en tiempo real para todos los visitantes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-panel p-8 rounded-xl border border-border h-fit">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">
                  {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h3>
                <form onSubmit={editingProject ? handleUpdateProject : handleAddProject} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Título</label>
                    <input
                      type="text"
                      value={editingProject ? editingProject.title : newProject.title}
                      onChange={(e) => editingProject 
                        ? setEditingProject({ ...editingProject, title: e.target.value })
                        : setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                      placeholder="Ej: Residencial Las Luces"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Descripción</label>
                    <textarea
                      value={editingProject ? editingProject.description : newProject.description}
                      onChange={(e) => editingProject
                        ? setEditingProject({ ...editingProject, description: e.target.value })
                        : setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none h-24"
                      placeholder="Breve descripción del proyecto..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">URL Imagen</label>
                    <input
                      type="text"
                      value={editingProject ? editingProject.image : newProject.image}
                      onChange={(e) => editingProject
                        ? setEditingProject({ ...editingProject, image: e.target.value })
                        : setNewProject({ ...newProject, image: e.target.value })}
                      className={`w-full bg-input border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none ${
                        (editingProject?.image || newProject.image) && !validateImageUrl(editingProject?.image || newProject.image) 
                        ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="https://images.unsplash.com/..."
                    />
                    {(editingProject?.image || newProject.image) && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-border h-32">
                        <img 
                          src={editingProject ? editingProject.image : newProject.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Imagen+No+Válida')}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Fecha de Entrega Estimada</label>
                    <input
                      type="date"
                      value={editingProject ? editingProject.deliveryDate : newProject.deliveryDate}
                      onChange={(e) => editingProject
                        ? setEditingProject({ ...editingProject, deliveryDate: e.target.value })
                        : setNewProject({ ...newProject, deliveryDate: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Link Detalle (Opcional)</label>
                    <input
                      type="text"
                      value={editingProject ? editingProject.link : newProject.link}
                      onChange={(e) => editingProject
                        ? setEditingProject({ ...editingProject, link: e.target.value })
                        : setNewProject({ ...newProject, link: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                      placeholder="/servicios"
                    />
                  </div>
                  <div className="flex gap-2">
                    {editingProject && (
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="flex-1 bg-bg border border-border text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-panel transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-[2] bg-accent text-black py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                    >
                      {editingProject ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingProject ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
                    </button>
                  </div>
                </form>

                <div className="mt-8 pt-8 border-t border-border">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-dim mb-4">Difusión en Redes Sociales</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { name: 'Facebook', color: 'hover:text-[#1877F2]', url: 'https://facebook.com' },
                      { name: 'TikTok', color: 'hover:text-[#000000]', url: 'https://tiktok.com' },
                      { name: 'WhatsApp', color: 'hover:text-[#25D366]', url: 'https://web.whatsapp.com' },
                      { name: 'LinkedIn', color: 'hover:text-[#0A66C2]', url: 'https://linkedin.com' },
                      { name: 'Instagram', color: 'hover:text-[#E4405F]', url: 'https://instagram.com' }
                    ].map((social) => (
                      <a 
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex flex-col items-center gap-1 p-2 bg-bg border border-border rounded-lg text-text-dim transition-all ${social.color} hover:border-current`}
                        title={`Publicar en ${social.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-[8px] font-bold uppercase">{social.name}</span>
                      </a>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => alert('Se ha enviado una notificación por correo a todos los usuarios suscritos sobre los nuevos diseños.')}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-bg border border-border rounded-xl text-white hover:border-accent transition-all group mt-4"
                  >
                    <Bell className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Notificar Nuevos Diseños</span>
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <div 
                    key={proj.id} 
                    className={`bg-panel rounded-xl border overflow-hidden group transition-all ${
                      proj.status === 'completed' ? 'border-green-500 shadow-lg shadow-green-500/5' : 'border-border'
                    }`}
                  >
                    <div className="h-40 relative">
                      <img src={proj.image} alt={proj.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          onClick={() => toggleProjectStatus(proj.id, proj.status)}
                          className={`p-2 rounded-lg transition-all ${
                            proj.status === 'completed' ? 'bg-green-500 text-white' : 'bg-white/10 text-white hover:bg-green-500 hover:text-white'
                          }`}
                          title={proj.status === 'completed' ? 'Marcar como Activo' : 'Marcar como Completo'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingProject(proj)}
                          className="p-2 bg-accent text-black rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteProject(proj.id)}
                          className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                            projectToDelete === proj.id ? 'bg-red-600 text-white animate-pulse' : 'bg-red-500 text-white'
                          }`}
                        >
                          {projectToDelete === proj.id ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                      {proj.status === 'completed' && (
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <Check className="w-3 h-3" /> Completado
                        </div>
                      )}
                      {projectToDelete === proj.id && (
                        <div className="absolute inset-0 bg-red-600/20 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white">¿Confirmar eliminación?</p>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold">{proj.title}</h4>
                        {proj.deliveryDate && (
                          <span className="text-[8px] text-text-dim uppercase font-bold border border-border px-1.5 py-0.5 rounded">
                            Entrega: {new Date(proj.deliveryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-text-dim text-xs line-clamp-2">{proj.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tareas' && (
          <div className="space-y-8">
            <header className="mb-10">
              <h1 className="text-3xl font-light text-white tracking-tight uppercase">Tablero de <span className="font-bold text-accent">Tareas</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-1">Asigna y monitorea el progreso de las operaciones.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Form Column */}
              <div className="bg-panel p-6 rounded-xl border border-border h-fit">
                <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-6">Nueva Tarea</h3>
                <form onSubmit={handleAddTask} className="space-y-4">
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                    placeholder="Título de la tarea"
                  />
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                  />
                  <input
                    type="text"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                    placeholder="Asignar a..."
                  />
                  <button
                    type="submit"
                    className="w-full bg-accent text-black py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all"
                  >
                    Crear Tarea
                  </button>
                </form>
              </div>

              {/* Status Columns */}
              {['todo', 'in-progress', 'done'].map((status) => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">
                      {status === 'todo' ? 'Pendiente' : status === 'in-progress' ? 'En Proceso' : 'Finalizado'}
                    </h3>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-text-dim">
                      {tasks.filter(t => t.status === status).length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {tasks.filter(t => t.status === status).map((task) => (
                      <div key={task.id} className="bg-panel p-4 rounded-xl border border-border shadow-sm group">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                            task.priority === 'medium' ? 'bg-accent/10 text-accent' : 'bg-green-500/10 text-green-500'
                          }`}>
                            {task.priority}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            {status !== 'done' && (
                              <button 
                                onClick={() => updateTaskStatus(task.id, status === 'todo' ? 'in-progress' : 'done')}
                                className="p-1 hover:bg-bg rounded text-accent"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <h4 className="text-white text-sm font-bold mb-1">{task.title}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-text-dim text-[10px] uppercase tracking-widest">Asignado: {task.assignedTo || 'Sin asignar'}</p>
                          {task.dueDate && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                              new Date(task.dueDate).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000 && status !== 'done'
                              ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse'
                              : 'bg-bg text-text-dim border-border'
                            }`}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-light tracking-tighter text-white uppercase">Editor de <span className="text-accent font-bold">Página</span></h1>
                <p className="text-text-dim text-xs uppercase tracking-widest mt-2">Personaliza el contenido visual y textual sin código</p>
              </div>
              <button 
                onClick={handleSaveConfig}
                className="bg-accent text-black px-8 py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Guardar Cambios
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Text & Content */}
              <div className="bg-panel p-8 rounded-2xl border border-border space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Contenido de Texto
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Título Principal (Hero)</label>
                    <input 
                      type="text" 
                      value={pageConfig.heroTitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, heroTitle: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Subtítulo (Hero)</label>
                    <textarea 
                      rows={3}
                      value={pageConfig.heroSubtitle}
                      onChange={(e) => setPageConfig({ ...pageConfig, heroSubtitle: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Texto del Pie de Página</label>
                    <input 
                      type="text" 
                      value={pageConfig.footerText}
                      onChange={(e) => setPageConfig({ ...pageConfig, footerText: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Email de Contacto</label>
                      <input 
                        type="email" 
                        value={pageConfig.contactEmail}
                        onChange={(e) => setPageConfig({ ...pageConfig, contactEmail: e.target.value })}
                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Teléfono de Contacto</label>
                      <input 
                        type="text" 
                        value={pageConfig.contactPhone}
                        onChange={(e) => setPageConfig({ ...pageConfig, contactPhone: e.target.value })}
                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Dirección Física</label>
                    <input 
                      type="text" 
                      value={pageConfig.contactAddress}
                      onChange={(e) => setPageConfig({ ...pageConfig, contactAddress: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Información de Cuenta Bancaria</label>
                    <textarea 
                      value={pageConfig.bankAccountInfo}
                      onChange={(e) => setPageConfig({ ...pageConfig, bankAccountInfo: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none h-24"
                      placeholder="Ej: Banco Industrial - Cuenta Monetaria: 123-456789-0..."
                    />
                  </div>
                </div>
              </div>

              {/* Visuals & Colors */}
              <div className="bg-panel p-8 rounded-2xl border border-border space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Identidad Visual
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Imagen de Fondo (Hero URL)</label>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={pageConfig.heroImage}
                        onChange={(e) => setPageConfig({ ...pageConfig, heroImage: e.target.value })}
                        className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                      />
                      <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-bg">
                        <img src={pageConfig.heroImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Color de Acento</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={pageConfig.accentColor}
                          onChange={(e) => setPageConfig({ ...pageConfig, accentColor: e.target.value })}
                          className="w-10 h-10 bg-transparent border-none outline-none cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={pageConfig.accentColor}
                          onChange={(e) => setPageConfig({ ...pageConfig, accentColor: e.target.value })}
                          className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-accent outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Color Primario (Fondo)</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={pageConfig.primaryColor}
                          onChange={(e) => setPageConfig({ ...pageConfig, primaryColor: e.target.value })}
                          className="w-10 h-10 bg-transparent border-none outline-none cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={pageConfig.primaryColor}
                          onChange={(e) => setPageConfig({ ...pageConfig, primaryColor: e.target.value })}
                          className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-accent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-bg rounded-xl border border-border">
                    <p className="text-[10px] text-text-dim uppercase tracking-widest mb-2">Vista Previa de Estilo</p>
                    <div className="flex gap-2">
                      <div className="w-full h-8 rounded" style={{ backgroundColor: pageConfig.primaryColor }}></div>
                      <div className="w-full h-8 rounded" style={{ backgroundColor: pageConfig.accentColor }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-3xl font-light tracking-tighter text-white uppercase">Gestión de <span className="text-accent font-bold">Usuarios y Pagos</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-2">Valida comprobantes y monitorea la actividad de tus clientes</p>
            </header>

            {/* Payment Validation Section */}
            {userRole === 'admin' && paymentReceipts.filter(r => r.status === 'pending').length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Pagos Pendientes de Validación
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paymentReceipts.filter(r => r.status === 'pending').map((receipt) => (
                    <div key={receipt.id} className="bg-panel rounded-2xl border border-accent/30 overflow-hidden flex flex-col shadow-lg shadow-accent/5">
                      <div className="h-48 relative group">
                        <img src={receipt.receiptImageUrl} alt="Comprobante" className="w-full h-full object-cover" />
                        <a 
                          href={receipt.receiptImageUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest"
                        >
                          Ver Imagen Completa <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </div>
                      <div className="p-6 space-y-4 flex-1">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-text-dim">Usuario</p>
                          <p className="text-sm text-white font-bold">{receipt.userName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-text-dim">Producto</p>
                          <p className="text-sm text-accent font-bold">{receipt.productName}</p>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <button 
                            onClick={() => handleApprovePayment(receipt)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" /> Aprobar
                          </button>
                          <button 
                            onClick={() => handleRejectPayment(receipt)}
                            className="flex-1 bg-red-600/10 text-red-500 border border-red-500/20 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" /> Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
                <Users className="w-4 h-4" /> Directorio de Clientes
              </h2>
              <div className="bg-panel rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-bg/50">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Usuario</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Rol</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Adquisiciones</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Registro</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-border" />
                            <div>
                              <p className="text-sm font-bold text-white">{user.name || 'Sin nombre'}</p>
                              <p className="text-[10px] text-text-dim">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                            user.role === 'admin' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-bg text-text-dim border-border'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.purchases?.length > 0 ? (
                              user.purchases.map((pid: string) => (
                                <span key={pid} className="text-[9px] bg-bg border border-border text-white px-2 py-0.5 rounded">
                                  {DIGITAL_PRODUCTS.find(p => p.id === pid)?.name || pid}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-text-dim italic">Ninguna</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-text-dim">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-all">
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
        {activeTab === 'ventas' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-3xl font-light tracking-tighter text-white uppercase">Historial de <span className="text-accent font-bold">Ventas</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-2">Registro completo de transacciones y productos entregados</p>
            </header>

            <div className="bg-panel rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-bg/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Fecha</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Cliente</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Producto</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paymentReceipts.filter(r => r.status === 'approved').map((sale) => (
                    <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-[10px] text-text-dim">
                        {sale.validatedAt ? (sale.validatedAt as Timestamp).toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{sale.userName}</p>
                        <p className="text-[10px] text-text-dim">{sale.userId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-accent font-medium">{sale.productName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                          Completado
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-white">
                        Q. {DIGITAL_PRODUCTS.find(p => p.id === sale.productId)?.price.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                  {paymentReceipts.filter(r => r.status === 'approved').length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-dim italic text-xs">
                        No hay ventas registradas aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-3xl font-light tracking-tighter text-white uppercase">Directorio de <span className="text-accent font-bold">Clientes</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-2">Gestión de perfiles de usuario y actividad en la plataforma</p>
            </header>

            <div className="bg-panel rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-bg/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Usuario</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Rol</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Adquisiciones</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Registro</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-border" />
                          <div>
                            <p className="text-sm font-bold text-white">{user.name || 'Sin nombre'}</p>
                            <p className="text-[10px] text-text-dim">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${
                          user.role === 'admin' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-bg text-text-dim border-border'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.purchases?.length > 0 ? (
                            user.purchases.map((pid: string) => (
                              <span key={pid} className="text-[9px] bg-bg border border-border text-white px-2 py-0.5 rounded">
                                {DIGITAL_PRODUCTS.find(p => p.id === pid)?.name || pid}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-text-dim italic">Ninguna</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-text-dim">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-all">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ajustes' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
              <h1 className="text-3xl font-light tracking-tighter text-white uppercase">Catálogo y <span className="text-accent font-bold">Configuración</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-2">Gestiona productos digitales, servicios y parámetros del sistema</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Products Management */}
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <Package className="w-4 h-4" /> Productos Digitales
                  </h2>
                  <button 
                    onClick={() => {
                      setEditingProduct(null);
                      setNewProduct({ name: '', description: '', price: 0, category: 'software', image: '' });
                    }}
                    className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-black transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-panel p-6 rounded-2xl border border-border space-y-6">
                  <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Nombre</label>
                        <input
                          type="text"
                          value={editingProduct ? editingProduct.name : newProduct.name}
                          onChange={(e) => editingProduct 
                            ? setEditingProduct({ ...editingProduct, name: e.target.value })
                            : setNewProduct({ ...newProduct, name: e.target.value })}
                          className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent"
                          placeholder="Nombre del producto"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Precio (Q)</label>
                        <input
                          type="number"
                          value={editingProduct ? editingProduct.price : newProduct.price}
                          onChange={(e) => editingProduct
                            ? setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                            : setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Descripción</label>
                      <textarea
                        value={editingProduct ? editingProduct.description : newProduct.description}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, description: e.target.value })
                          : setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent h-20"
                        placeholder="Descripción corta..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">URL Imagen</label>
                      <input
                        type="text"
                        value={editingProduct ? editingProduct.image : newProduct.image}
                        onChange={(e) => editingProduct
                          ? setEditingProduct({ ...editingProduct, image: e.target.value })
                          : setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent"
                        placeholder="https://..."
                      />
                      {(editingProduct?.image || newProduct.image) && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-border h-32 bg-bg/50">
                          <img 
                            src={editingProduct ? editingProduct.image : newProduct.image} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Imagen+No+Válida')}
                          />
                        </div>
                      )}
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-accent text-black py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all"
                    >
                      {editingProduct ? 'Actualizar Producto' : 'Añadir Producto'}
                    </button>
                  </form>

                  <div className="space-y-3 pt-6 border-t border-border">
                    {products.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between p-4 bg-bg border border-border rounded-xl group">
                        <div>
                          <p className="text-xs font-bold text-white">{prod.name}</p>
                          <p className="text-[10px] text-accent">Q. {prod.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingProduct(prod)}
                            className="p-2 hover:bg-accent/10 text-accent rounded-lg"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Services Management */}
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Servicios de Obra
                  </h2>
                  <button 
                    onClick={() => {
                      setEditingService(null);
                      setNewService({ title: '', description: '', detailedDescription: '', price: 0, category: 'construccion', icon: 'HardHat' });
                    }}
                    className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-black transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-panel p-6 rounded-2xl border border-border space-y-6">
                  <form onSubmit={editingService ? handleUpdateService : handleAddService} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Título</label>
                        <input
                          type="text"
                          value={editingService ? editingService.title : newService.title}
                          onChange={(e) => editingService 
                            ? setEditingService({ ...editingService, title: e.target.value })
                            : setNewService({ ...newService, title: e.target.value })}
                          className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent"
                          placeholder="Título del servicio"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Precio Base (Q)</label>
                        <input
                          type="number"
                          value={editingService ? editingService.price : newService.price}
                          onChange={(e) => editingService
                            ? setEditingService({ ...editingService, price: Number(e.target.value) })
                            : setNewService({ ...newService, price: Number(e.target.value) })}
                          className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Descripción Corta</label>
                      <textarea
                        value={(editingService ? editingService.description : newService.description) || ''}
                        onChange={(e) => editingService
                          ? setEditingService({ ...editingService, description: e.target.value })
                          : setNewService({ ...newService, description: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent h-20"
                        placeholder="Descripción corta del servicio..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-text-dim mb-2">Descripción Detallada</label>
                      <textarea
                        value={(editingService ? editingService.detailedDescription : newService.detailedDescription) || ''}
                        onChange={(e) => editingService
                          ? setEditingService({ ...editingService, detailedDescription: e.target.value })
                          : setNewService({ ...newService, detailedDescription: e.target.value })}
                        className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-accent h-40"
                        placeholder="Información exhaustiva sobre el servicio..."
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-accent text-black py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all"
                    >
                      {editingService ? 'Actualizar Servicio' : 'Añadir Servicio'}
                    </button>
                  </form>

                  <div className="space-y-3 pt-6 border-t border-border">
                    {services.map((serv) => (
                      <div key={serv.id} className="flex items-center justify-between p-4 bg-bg border border-border rounded-xl group">
                        <div>
                          <p className="text-xs font-bold text-white">{serv.title}</p>
                          <p className="text-[10px] text-accent">Desde Q. {serv.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingService(serv)}
                            className="p-2 hover:bg-accent/10 text-accent rounded-lg"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(serv.id)}
                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* System Settings */}
            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
                <Settings className="w-4 h-4" /> Configuración del Sistema
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-panel p-8 rounded-2xl border border-border space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Parámetros de Chat
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border">
                      <div>
                        <p className="text-xs text-white font-bold">Auto-cierre por inactividad</p>
                        <p className="text-[10px] text-text-dim">Cerrar chats después de 30 minutos sin mensajes</p>
                      </div>
                      <div className="w-10 h-5 bg-accent rounded-full relative">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-black rounded-full"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Avatar del Administrador</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 items-center">
                        {auth.currentUser?.photoURL && (
                          <div className="flex flex-col items-center gap-1">
                            <button 
                              onClick={() => setAdminAvatar(auth.currentUser!.photoURL!)}
                              className={`w-10 h-10 rounded-full border-2 transition-all shrink-0 overflow-hidden ${adminAvatar === auth.currentUser.photoURL ? 'border-accent scale-110' : 'border-border opacity-50'}`}
                            >
                              <img src={auth.currentUser.photoURL} alt="Google" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                            <span className="text-[8px] text-text-dim uppercase font-bold">Google</span>
                          </div>
                        )}
                        {['admin', 'support', 'engineer', 'architect'].map(seed => (
                          <div key={seed} className="flex flex-col items-center gap-1">
                            <button 
                              onClick={() => setAdminAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`)}
                              className={`w-10 h-10 rounded-full border-2 transition-all shrink-0 ${adminAvatar.includes(seed) ? 'border-accent scale-110' : 'border-border opacity-50'}`}
                            >
                              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`} alt={seed} className="w-full h-full rounded-full" />
                            </button>
                            <span className="text-[8px] text-text-dim uppercase font-bold">{seed}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-panel p-8 rounded-2xl border border-border space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Estado del Servidor
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-bg rounded-xl border border-border flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-xs text-white font-bold">Firestore Database</p>
                        <p className="text-[10px] text-text-dim">Conectado y Operativo</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        {activeTab === 'leads' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-light text-white tracking-tight uppercase">Gestión de <span className="font-bold text-accent">Prospectos</span></h1>
              <p className="text-text-dim text-xs uppercase tracking-widest mt-1">Leads generados desde el calculador de costos.</p>
            </header>

            <div className="bg-panel rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg/50 border-b border-border">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Fecha</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Nombre</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Contacto</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Proyecto</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Estimación</th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-text-dim">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs text-text-dim">
                            {lead.createdAt ? (lead.createdAt as Timestamp).toDate().toLocaleDateString() : 'Reciente'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{lead.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-accent" />
                            <span className="text-xs text-white">{lead.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-white uppercase">{lead.m2}m² - {lead.workType}</p>
                            <p className="text-[10px] text-text-dim uppercase">{lead.department}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-accent">Q. {lead.estimatedTotal?.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                            className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
                            title="Contactar por WhatsApp"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Users className="w-12 h-12 text-text-dim/20 mx-auto mb-4" />
                          <p className="text-text-dim text-sm">No hay prospectos registrados aún.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
