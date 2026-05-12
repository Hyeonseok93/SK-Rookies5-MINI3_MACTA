import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  isExiting: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );
    
    // Wait for the exit animation to finish before removing from DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 500); // Animation duration
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // Generate a unique ID using timestamp + random number to prevent duplicate keys
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border
              transition-all duration-500 ease-in-out
              ${toast.isExiting 
                ? 'opacity-0 translate-x-12 scale-95 blur-sm' 
                : 'opacity-100 translate-x-0 scale-100 blur-0 animate-in slide-in-from-right fade-in duration-500'}
              ${toast.type === 'success' ? 'bg-[#0d2a1f] border-green-500/30 text-green-400' : 
                toast.type === 'error' ? 'bg-[#2a0d0d] border-red-500/30 text-red-400' : 
                'bg-[#0d1b2e] border-blue-500/30 text-blue-400'}
            `}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <span className="text-sm font-semibold tracking-tight">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
