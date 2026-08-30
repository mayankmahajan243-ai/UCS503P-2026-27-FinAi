import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, X } from "lucide-react";

let toastId = 0;
const listeners = new Set();

export function toast(message, type = "success") {
  const id = ++toastId;
  listeners.forEach(fn => fn({ id, message, type }));
  setTimeout(() => listeners.forEach(fn => fn({ id, remove: true })), 3500);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts(prev => t.remove
        ? prev.filter(x => x.id !== t.id)
        : [...prev, t]);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
          <span>{t.message}</span>
          <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}><X size={14}/></button>
        </div>
      ))}
    </div>
  );
}
