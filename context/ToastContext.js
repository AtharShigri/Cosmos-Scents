"use client";

import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);
let nextId = 0;

/**
 * Small themed toast system -- replaces browser alert()/confirm() popups
 * (e.g. "Added to cart") with an on-brand notification instead. Any
 * client component can call useToast().showToast("message") from
 * anywhere in the tree once this provider wraps it.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, duration = 2500) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="bg-ink text-paper rounded-md px-4 py-3 text-sm animate-[toast-in_0.2s_ease-out]"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
