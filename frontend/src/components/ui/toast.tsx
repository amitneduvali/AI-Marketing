"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

let globalToastHandler: ((opts: Omit<ToastItem, "id">) => void) | null = null;

export function toast(options: {
  title: string;
  description?: string;
  variant?: ToastVariant | "destructive";
  duration?: number;
}) {
  const normalizedVariant = options.variant === "destructive" ? "error" : options.variant;
  if (globalToastHandler) {
    globalToastHandler({ ...options, variant: normalizedVariant });
  } else {
    // Fallback if provider not yet mounted
    console.log(`[Toast ${normalizedVariant || "default"}]: ${options.title} - ${options.description || ""}`);
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    ({ title, description, variant = "default", duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  React.useEffect(() => {
    globalToastHandler = showToast;
    return () => {
      globalToastHandler = null;
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toast: showToast, removeToast }}>
      {children}
      {/* Toast container portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all",
                t.variant === "success" &&
                  "border-emerald-500/40 bg-slate-900/90 text-slate-100 shadow-emerald-950/20",
                t.variant === "error" &&
                  "border-rose-500/40 bg-slate-900/90 text-slate-100 shadow-rose-950/20",
                t.variant === "warning" &&
                  "border-amber-500/40 bg-slate-900/90 text-slate-100 shadow-amber-950/20",
                t.variant === "info" &&
                  "border-cyan-500/40 bg-slate-900/90 text-slate-100 shadow-cyan-950/20",
                t.variant === "default" &&
                  "border-slate-700/80 bg-slate-900/90 text-slate-100 shadow-indigo-950/20"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {t.variant === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                {t.variant === "error" && (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
                {t.variant === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                )}
                {t.variant === "info" && (
                  <Info className="w-5 h-5 text-cyan-400" />
                )}
                {t.variant === "default" && (
                  <Info className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-white">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-slate-400">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
