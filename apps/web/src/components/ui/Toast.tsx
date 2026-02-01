'use client';
import { ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import Text from './Text';
export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
  icon?: ReactNode;
}
export default function Toast({
  id,
  message,
  type = 'info',
  duration = 5000,
  onClose,
  icon,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [id, duration, onClose]);
  const variants = {
    success: {
      bg: 'glass-effect bg-[#13131A] bg-green-500/20',
      border: 'border-l-4 border-l-green-500 border-green-500/30 border-gray-800 border-green-500/30',
      text: 'text-gray-300 text-green-200',
      icon: 'text-green-500 text-green-400',
    },
    error: {
      bg: 'glass-effect bg-[#13131A] bg-red-500/20',
      border: 'border-l-4 border-l-red-500 border-red-500/30 border-gray-800 border-red-500/30',
      text: 'text-gray-300 text-red-200',
      icon: 'text-red-500 text-red-400',
    },
    warning: {
      bg: 'glass-effect bg-[#13131A] bg-yellow-500/20',
      border: 'border-l-4 border-l-yellow-500 border-yellow-500/30 border-gray-800 border-yellow-500/30',
      text: 'text-gray-300 text-yellow-200',
      icon: 'text-yellow-500 text-yellow-400',
    },
    info: {
      bg: 'glass-effect bg-[#13131A] bg-blue-500/20',
      border: 'border-l-4 border-l-blue-500 border-blue-500/30 border-gray-800 border-blue-500/30',
      text: 'text-gray-300 text-blue-200',
      icon: 'text-blue-500 text-blue-400',
    },
  };
  const styles = variants[type];
  return (
    <div
      className={clsx(
        'rounded-lg p-lg shadow-lg min-w-[300px] max-w-md',
        'animate-slide-in-right',
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start">
        {icon && <div className={clsx('flex-shrink-0 mr-4', styles.icon)}>{icon}</div>}
        <Text variant="small" className={clsx('flex-1 font-medium', styles.text)}>
          {message}
        </Text>
        <button
          onClick={() => onClose(id)}
          className={clsx(
            'ml-4 flex-shrink-0 p-1 rounded-md hover:bg-[#1C1C26] hover:bg-opacity-20 transition-colors',
            styles.text
          )}
          aria-label="Close toast"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
