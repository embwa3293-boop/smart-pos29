// ============================================================
//  ConfirmContext.tsx — بدل alert() و confirm() على موبايل
// ============================================================
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showToast: (message: string, type?: ToastType) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  // ── Toast ────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // ── Confirm Modal ────────────────────────────────────────
  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ isOpen: true, options, resolve });
    });
  }, []);

  const handleConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  // ── أيقونات التوست ────────────────────────────────────────
  const toastIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-400 shrink-0" />;
      case 'error':   return <XCircle     size={16} className="text-red-400 shrink-0" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
      case 'info':    return <Info         size={16} className="text-blue-400 shrink-0" />;
    }
  };

  const toastBorder = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-emerald-500/30';
      case 'error':   return 'border-red-500/30';
      case 'warning': return 'border-amber-500/30';
      case 'info':    return 'border-blue-500/30';
    }
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm, showToast }}>
      {children}

      {/* ── Toasts ── */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 bg-surface/95 backdrop-blur-md border ${toastBorder(toast.type)} rounded-xl px-4 py-3 shadow-modal animate-slide-up pointer-events-auto`}
          >
            {toastIcon(toast.type)}
            <span className="text-sm text-silver font-body flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts(p => p.filter(t => t.id !== toast.id))}
              className="text-silver/30 hover:text-silver transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Confirm Modal ── */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            onClick={() => handleConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-surface border border-[rgba(192,192,192,0.15)] rounded-2xl shadow-modal animate-slide-up overflow-hidden">
            <div className="p-6">
              {confirmState.options.danger && (
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={22} className="text-red-400" />
                </div>
              )}
              {confirmState.options.title && (
                <h3 className="text-base font-semibold text-silver font-body text-center mb-2">
                  {confirmState.options.title}
                </h3>
              )}
              <p className="text-sm text-silver/60 font-body text-center">
                {confirmState.options.message}
              </p>
            </div>
            <div className="flex border-t border-[rgba(192,192,192,0.1)]">
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 py-4 text-sm text-silver/60 font-body hover:text-silver hover:bg-[rgba(192,192,192,0.05)] transition-all border-l border-[rgba(192,192,192,0.1)]"
              >
                {confirmState.options.cancelLabel || 'إلغاء'}
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className={`flex-1 py-4 text-sm font-semibold font-body transition-all
                  ${confirmState.options.danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-silver hover:bg-[rgba(192,192,192,0.05)]'
                  }`}
              >
                {confirmState.options.confirmLabel || 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
