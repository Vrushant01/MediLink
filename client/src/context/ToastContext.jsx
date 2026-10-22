import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

// Toast notification provider: white surface, 1px border, 3px colored left bar, Geist 14px
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = Date.now() + Math.random().toString(36).substring(2, 5);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  const getBarColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-status-safe';
      case 'error':
        return 'border-l-status-expired';
      default:
        return 'border-l-brand';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-status-safe shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-status-expired shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container in bottom right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto bg-surface border border-line border-l-[3px] ${getBarColor(
              t.type
            )} rounded-[6px] shadow-subtle p-3.5 flex items-start gap-3 transition-all duration-150 animate-fade-in`}
          >
            {getIcon(t.type)}
            <div className="text-[14px] font-sans text-ink flex-1 leading-snug">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-ink-soft hover:text-ink transition-colors p-0.5 rounded"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook to access toast functions anywhere in the application
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
