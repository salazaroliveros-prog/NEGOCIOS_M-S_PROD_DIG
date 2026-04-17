import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const FloatingActionButton = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) return null;

  const handleOpenChat = () => {
    // Dispatch a custom event to open the chat widget
    window.dispatchEvent(new CustomEvent('open-chat'));
  };

  return (
    <button
      onClick={handleOpenChat}
      className="fixed bottom-6 right-6 z-40 bg-accent text-black p-4 rounded-full shadow-2xl shadow-accent/40 hover:scale-110 transition-all group flex items-center gap-3"
    >
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-[10px] uppercase tracking-widest">
        Solicitar Asesoría
      </span>
      <MessageSquare className="w-6 h-6" />
    </button>
  );
};
