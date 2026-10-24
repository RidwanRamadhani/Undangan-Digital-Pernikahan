import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = 'text-botanical-gold';
        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-blue-500';
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-botanical-emerald text-white p-4 rounded-xl shadow-2xl border border-botanical-gold/30 animate-fade-in transition-all duration-300"
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm">
              {toast.title && <p className="font-semibold text-botanical-gold-light">{toast.title}</p>}
              <p className="text-gray-200 text-xs leading-relaxed mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
