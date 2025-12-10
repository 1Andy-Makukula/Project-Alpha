
import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XIcon } from './icons/NavigationIcons';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none md:top-24 md:right-8 md:left-auto md:translate-x-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
    info: <CheckCircleIcon className="w-6 h-6 text-blue-500" />, // Reusing check for info for now
  };

  const bgColors = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100',
  };

  return (
    <div className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-lg border ${bgColors[toast.type]} animate-modal-scale-in`}>
      <div className="flex-shrink-0 mr-3">{icons[toast.type]}</div>
      <div className="flex-grow mr-2">
        <p className="text-sm font-medium text-gray-800">{toast.message}</p>
      </div>
      <button onClick={onRemove} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
