import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Notification } from "@mantine/core";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const TOAST_MS = 4000;
const COLORS: Record<ToastKind, string> = { success: "green", error: "red", info: "blue" };

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

/** Short, non-blocking message (plan §3.5 "Success"): `useToast()(t("..."))`. */
export function useToast() {
  return useContext(ToastContext);
}

/**
 * Shows toasts above the phone's tab bar. The text is announced politely to
 * screen readers and disappears by itself; there is nothing to dismiss.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, kind }]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_MS);
    timers.current.add(timer);
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: "calc(76px + env(safe-area-inset-bottom, 0px))",
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <Notification
            key={toast.id}
            color={COLORS[toast.kind]}
            withCloseButton={false}
            maw={420}
            w="100%"
            style={{ pointerEvents: "auto" }}
          >
            {toast.message}
          </Notification>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
