import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: 'border-brand-600 bg-brand-50 text-brand-900',
  error: 'border-red-600 bg-red-50 text-red-900',
  info: 'border-slate-500 bg-white text-slate-800',
};

/** Lightweight, accessible notification area (no external dependency). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, tone = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      notify,
      success: (message) => notify(message, 'success'),
      error: (message) => notify(message, 'error'),
      info: (message) => notify(message, 'info'),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto w-full max-w-sm rounded-md border-l-4 px-4 py-3 text-sm shadow-lg ${
              TONE_STYLES[toast.tone] ?? TONE_STYLES.info
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded px-1 text-lg leading-none opacity-70 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast() must be used inside <ToastProvider>.');
  return context;
}
