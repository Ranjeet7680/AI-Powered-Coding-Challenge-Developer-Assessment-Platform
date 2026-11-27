import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext, ToastVariant } from './useContexts';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev.slice(-3), { id, message, variant }]);
      setTimeout(() => {
        dismiss(id);
      }, 4200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0 no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl bg-[#19191b] border border-white/[0.12] shadow-xl text-xs text-[#ededed] animate-fadeIn"
          >
            {toast.variant === 'success' && <CheckCircle2 strokeWidth={1.5} className="w-4 h-4 text-[#4cc38a] shrink-0 mt-0.5" />}
            {toast.variant === 'error' && <AlertCircle strokeWidth={1.5} className="w-4 h-4 text-[#e5484d] shrink-0 mt-0.5" />}
            {toast.variant === 'info' && <Info strokeWidth={1.5} className="w-4 h-4 text-[#e5a00d] shrink-0 mt-0.5" />}
            <span className="flex-1 leading-relaxed">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-[#85858b] hover:text-[#ededed] transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X strokeWidth={1.5} className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
