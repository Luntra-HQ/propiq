/**
 * Toast Notification System - 2025 Design System
 *
 * Non-blocking feedback notifications with animations.
 * Supports success, error, warning, and info variants.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * useToast - Hook to access toast functions
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * ToastProvider - Provides toast context to the app
 */
interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 5000,
      dismissible: true,
      ...toast,
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      // Limit max toasts
      return updated.slice(-maxToasts);
    });

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [maxToasts, removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 8000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * ToastContainer - Renders toast notifications
 */
interface ToastContainerProps {
  toasts: Toast[];
  position: ToastPosition;
  onRemove: (id: string) => void;
}

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, position, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={`fixed z-50 flex flex-col gap-3 ${positionStyles[position]}`}
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

/**
 * ToastItem - Individual toast notification
 */
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const typeConfig: Record<ToastType, {
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}> = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/30',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
  },
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  const handleRemove = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl
        bg-slate-800/95 backdrop-blur-xl
        border ${config.borderColor}
        shadow-lg shadow-black/20
        min-w-[320px] max-w-[420px]
        ${exiting ? 'animate-slideOutRight' : 'animate-slideInRight'}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-1.5 rounded-lg ${config.bgColor}`}>
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm text-gray-400 mt-0.5">{toast.message}</p>
        )}
      </div>

      {/* Dismiss button */}
      {toast.dismissible && (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ToastProvider;
