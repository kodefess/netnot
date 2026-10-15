"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

type ToastTone = "default" | "success" | "error";

type ToastInput = {
  message: string;
  tone?: ToastTone;
  action?: { label: string; onClick: () => void };
  duration?: number;
};

type ToastEntry = ToastInput & { id: number };

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

export const useToast = () => useContext(ToastContext);

/** Toast minimalis pengganti alert() — tidak memblokir dan bisa punya aksi (mis. Undo). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback(
    (id: number) => setToasts((current) => current.filter((t) => t.id !== id)),
    [],
  );

  const show = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      setTimeout(() => dismiss(id), toast.duration ?? 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-in items-center gap-3 rounded-xl border border-border-strong bg-foreground py-2.5 pr-2 pl-3.5 text-sm text-background shadow-lg fade-in-0 slide-in-from-bottom-2"
          >
            {toast.tone === "success" && <CircleCheck className="size-4 shrink-0 text-success" />}
            {toast.tone === "error" && <CircleAlert className="size-4 shrink-0 text-danger" />}
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
                className="rounded-md px-2 py-1 font-semibold underline underline-offset-2 hover:bg-background/10"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
              className="rounded-md p-1 opacity-60 hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
