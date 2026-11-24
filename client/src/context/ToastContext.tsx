import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (title: string, variant: ToastVariant, description?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, title, description, variant };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, desc?: string) => addToast(title, 'success', desc),
    error: (title: string, desc?: string) => addToast(title, 'error', desc),
    warning: (title: string, desc?: string) => addToast(title, 'warning', desc),
    info: (title: string, desc?: string) => addToast(title, 'info', desc),
  };

  const getVariantStyles = (variant: ToastVariant) => {
    switch (variant) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          border: 'border-emerald-200 dark:border-emerald-800',
          bg: 'bg-emerald-50/90 dark:bg-emerald-950/90',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
          border: 'border-red-200 dark:border-red-800',
          bg: 'bg-red-50/90 dark:bg-red-950/90',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          border: 'border-amber-200 dark:border-amber-800',
          bg: 'bg-amber-50/90 dark:bg-amber-950/90',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-blue-50/90 dark:bg-blue-950/90',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const styles = getVariantStyles(t.variant);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${styles.bg} ${styles.border}`}
            >
              {styles.icon}
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t.title}
                </h5>
                {t.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
