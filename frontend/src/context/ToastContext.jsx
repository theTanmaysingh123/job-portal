import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  // type: "success" | "error" | "info"
  const showToast = useCallback(
    (message, type = "info", duration = 3500) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);

      timers.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const iconFor = (type) => {
    if (type === "success") return "bi-check-circle-fill";
    if (type === "error") return "bi-x-circle-fill";
    return "bi-info-circle-fill";
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="jp-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`jp-toast jp-toast-${t.type}`}>
            <i className={`bi ${iconFor(t.type)}`}></i>
            <span className="jp-toast-message">{t.message}</span>
            <button
              className="jp-toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
