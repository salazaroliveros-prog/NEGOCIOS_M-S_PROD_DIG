import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Check, Clock, Settings } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin' | 'system';
  senderAvatar?: string;
  timestamp: Date;
  read?: boolean;
  isSystem?: boolean;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const [chatId, setChatId] = React.useState<string | null>(localStorage.getItem('construms_chat_id'));
  const [user, setUser] = React.useState<any>(null);
  const [userAvatar, setUserAvatar] = React.useState<string>(localStorage.getItem('construms_user_avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=visitor');
  const [customAvatarUrl, setCustomAvatarUrl] = React.useState('');
  const [showSettings, setShowSettings] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.avatarUrl) {
              setUserAvatar(data.avatarUrl);
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });
        return () => unsubDoc();
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.message) {
        // We need to wait for chatId to be ready if it's a new chat
        const checkAndSend = () => {
          const currentChatId = localStorage.getItem('construms_chat_id');
          if (currentChatId) {
            handleSendMessage(e.detail.message);
          } else {
            setTimeout(checkAndSend, 500);
          }
        };
        checkAndSend();
      }
    };
    window.addEventListener('open-chat', handleOpen);
    return () => window.removeEventListener('open-chat', handleOpen);
  }, [userAvatar]); // Added userAvatar to dependencies to ensure it's ready

  const quickReplies = [
    'Cotizar proyecto',
    'Software de cálculo',
    'Servicios topográficos',
    'Hablar con un experto',
  ];

  // Initialize or fetch chat session
  React.useEffect(() => {
    if (!chatId && isOpen) {
      const newChatId = `chat_${Date.now()}`;
      const chatRef = doc(db, 'chats', newChatId);
      setDoc(chatRef, {
        id: newChatId,
        status: 'active',
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
        userName: user?.displayName || user?.email || 'Visitante',
        userAvatar: userAvatar,
        lastActivity: serverTimestamp()
      }).then(() => {
        localStorage.setItem('construms_chat_id', newChatId);
        setChatId(newChatId);
        // Add initial system message
        addDoc(collection(db, 'chats', newChatId, 'messages'), {
          text: 'Chat iniciado. Un asesor se conectará pronto.',
          sender: 'system',
          isSystem: true,
          timestamp: serverTimestamp()
        }).catch(() => {});
      }).catch((error) => {
        handleFirestoreError(error, OperationType.WRITE, `chats/${newChatId}`);
      });
    }
  }, [isOpen, chatId]);

  // Listen for messages
  React.useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          sender: data.sender,
          senderAvatar: data.senderAvatar,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
          read: data.read,
          isSystem: data.isSystem
        };
      });
      setMessages(msgs);

      // Mark admin messages as read and update admin avatar
      let newUnread = 0;
      msgs.forEach(msg => {
        if (msg.sender === 'admin') {
          if (msg.senderAvatar) setAdminAvatar(msg.senderAvatar);
          if (!msg.read) {
            newUnread++;
            if (!isOpen) {
              // Play sound if chat is closed
              audioRef.current?.play().catch(() => {});
            }
            updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), { read: true })
              .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}/messages/${msg.id}`));
          }
        }
      });
      setUnreadCount(prev => isOpen ? 0 : prev + newUnread);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
    });

    // Listen for admin typing and chat status
    const chatUnsubscribe = onSnapshot(doc(db, 'chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdminTyping(data.adminTyping);
        
        // Auto-close logic: if active and inactive for > 30 mins
        if (data.status === 'active' && data.lastActivity) {
          const lastAct = (data.lastActivity as Timestamp).toDate();
          const now = new Date();
          const diffMins = (now.getTime() - lastAct.getTime()) / (1000 * 60);
          
          if (diffMins > 30) {
            updateDoc(doc(db, 'chats', chatId), { 
              status: 'closed',
              closedReason: 'inactivity'
            }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`));

            addDoc(collection(db, 'chats', chatId, 'messages'), {
              text: 'Conversación cerrada por inactividad.',
              sender: 'admin',
              isSystem: true,
              timestamp: serverTimestamp()
            }).catch(() => {});
          }
        }
        
        if (data.status === 'closed') {
          setChatStatus('closed');
        } else {
          setChatStatus('active');
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${chatId}`);
    });

    return () => {
      unsubscribe();
      chatUnsubscribe();
    };
  }, [chatId]);

  const [adminTyping, setAdminTyping] = React.useState(false);
  const [adminAvatar, setAdminAvatar] = React.useState<string>('https://api.dicebear.com/7.x/bottts/svg?seed=admin');
  const [isTyping, setIsTyping] = React.useState(false);
  const [chatStatus, setChatStatus] = React.useState<'active' | 'closed'>('active');
  const [unreadCount, setUnreadCount] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const validateImageUrl = (url: string) => {
    const pattern = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    return pattern.test(url) || url.includes('dicebear.com');
  };

  React.useEffect(() => {
    // Initialize notification sound
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isTyping && chatId) {
      setIsTyping(true);
      updateDoc(doc(db, 'chats', chatId), { userTyping: true })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`));
      setTimeout(() => {
        setIsTyping(false);
        updateDoc(doc(db, 'chats', chatId), { userTyping: false })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`));
      }, 3000);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !chatId) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        id: `msg_${Date.now()}`,
        text,
        sender: 'user',
        senderAvatar: userAvatar,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update last message and activity in chat session
      await setDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        userTyping: false
      }, { merge: true });

      setInputValue('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
    }
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-24 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-panel border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-accent p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={adminAvatar} alt="Admin" className="w-8 h-8 rounded-full bg-black/10" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-panel rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-black font-bold text-sm">Asesor CONSTRUM&S</h3>
                  <p className="text-black/60 text-[10px] uppercase font-bold tracking-widest">En línea</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSettings(!showSettings)} className="text-black/60 hover:text-black transition-colors" title="Ajustes" aria-label="Ajustes">
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="text-black/60 hover:text-black transition-colors" title="Cerrar chat" aria-label="Cerrar chat">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showSettings && (
              <div className="bg-bg border-b border-border p-4 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Tu Avatar</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 items-center">
                    {user?.photoURL && (
                      <div className="flex flex-col items-center gap-1">
                        <button 
                          onClick={() => {
                            const url = user.photoURL;
                            setUserAvatar(url);
                            localStorage.setItem('construms_user_avatar', url);
                            if (chatId) {
                              updateDoc(doc(db, 'chats', chatId), { userAvatar: url })
                                .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`));
                            }
                          }}
                          className={`w-10 h-10 rounded-full border-2 transition-all shrink-0 overflow-hidden ${userAvatar === user.photoURL ? 'border-accent scale-110' : 'border-border opacity-50'}`}
                        >
                          <img src={user.photoURL} alt="Google" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                        <span className="text-[8px] text-text-dim uppercase font-bold">Google</span>
                      </div>
                    )}
                    {['visitor', 'Felix', 'Aneka', 'Spooky', 'Tigger'].map(seed => (
                      <div key={seed} className="flex flex-col items-center gap-1">
                        <button 
                          onClick={() => {
                            const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                            setUserAvatar(url);
                            localStorage.setItem('construms_user_avatar', url);
                            if (chatId) {
                              updateDoc(doc(db, 'chats', chatId), { userAvatar: url })
                                .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`));
                            }
                          }}
                          className={`w-10 h-10 rounded-full border-2 transition-all shrink-0 ${userAvatar.includes(seed) ? 'border-accent scale-110' : 'border-border opacity-50'}`}
                        >
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} className="w-full h-full rounded-full" />
                        </button>
                        <span className="text-[8px] text-text-dim uppercase font-bold">{seed}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">URL Personalizada</p>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-input border border-border rounded px-2 py-1 text-[10px] text-white outline-none"
                    />
                    <button 
                      onClick={() => {
                        if (customAvatarUrl) {
                          if (!validateImageUrl(customAvatarUrl)) {
                            alert('Por favor, ingresa una URL de imagen válida.');
                            return;
                          }
                          setUserAvatar(customAvatarUrl);
                          localStorage.setItem('construms_user_avatar', customAvatarUrl);
                          if (chatId) {
                            updateDoc(doc(db, 'chats', chatId), { userAvatar: customAvatarUrl })
                              .catch(err => handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`));
                          }
                          setCustomAvatarUrl('');
                        }
                      }}
                      className="bg-accent text-black px-2 py-1 rounded text-[9px] font-bold uppercase"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/50">
              {!chatId && (
                <div className="flex justify-center w-full py-10 animate-pulse">
                  <div className="text-[10px] text-accent font-bold uppercase tracking-widest flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    Iniciando sesión segura...
                  </div>
                </div>
              )}
              {chatStatus === 'closed' && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Sesión Finalizada</p>
                  <p className="text-[9px] text-text-dim mt-1">Esta conversación ha sido cerrada por inactividad o por un asesor.</p>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('construms_chat_id');
                      setChatId(null);
                      setMessages([]);
                      setChatStatus('active');
                    }}
                    className="mt-2 text-[9px] text-accent underline font-bold"
                  >
                    Iniciar nuevo chat
                  </button>
                </div>
              )}
              {messages.length === 0 && chatStatus === 'active' && (
                <div className="text-center py-10">
                  <Bot className="w-12 h-12 text-accent/20 mx-auto mb-4" />
                  <p className="text-text-dim text-xs">¡Hola! ¿En qué podemos ayudarte hoy?</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} ${msg.isSystem ? 'justify-center' : ''}`}
                >
                  {!msg.isSystem && (
                    <img 
                      src={msg.sender === 'user' ? (msg.senderAvatar || userAvatar) : (msg.senderAvatar || adminAvatar)} 
                      alt="Avatar" 
                      className="w-6 h-6 rounded-full bg-panel border border-border shrink-0 mt-1"
                    />
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-xl text-sm ${
                      msg.isSystem
                        ? 'bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-[0.2em] text-center w-full py-2 px-4 rounded-full'
                        : msg.sender === 'user'
                          ? 'bg-accent text-black rounded-tr-none'
                          : 'bg-panel border border-border text-text rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    {!msg.isSystem && (
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <span className={`text-[9px] ${msg.sender === 'user' ? 'text-black/40' : 'text-text-dim'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sender === 'user' && (
                          <span className="text-[9px] text-black/40">
                            {msg.read ? <Check className="w-3 h-3 inline" /> : <Clock className="w-3 h-3 inline" />}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {adminTyping && (
                <div className="flex justify-center w-full py-2 animate-pulse">
                  <div className="bg-accent/5 border border-accent/10 text-accent text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1 rounded-full">
                    El asesor está escribiendo...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Quick Replies */}
            <div className="p-2 flex gap-2 overflow-x-auto border-t border-border bg-bg/30">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleSendMessage(reply)}
                  className="whitespace-nowrap px-3 py-1 rounded-full border border-border text-[10px] text-text-dim hover:border-accent hover:text-accent transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-panel border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleTyping}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-input border border-border rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-accent outline-none"
                />
                <button
                  type="submit"
                  className="bg-accent text-black p-2 rounded-lg hover:bg-accent/90 transition-all"
                  title="Enviar mensaje"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (isOpen) {
            if (chatStatus === 'active' && messages.length > 0) {
              if (!confirm('¿Deseas cerrar la ventana del chat? La conversación seguirá activa.')) return;
            }
          }
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className="w-14 h-14 rounded-full bg-accent text-black flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-110 transition-all relative"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg">
            {unreadCount}
          </div>
        )}
      </button>
    </div>
  );
};
