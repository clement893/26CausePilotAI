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
      bg: 'glass-effect bg-[#13131A] dark:bg-secondary-900',
      border: 'border-l-4 border-l-green-500 dark:border-secondary-800 border-gray-800 dark:border-secondary-800',
      text: 'text-gray-300 dark:text-secondary-200',
      icon: 'text-green-500 dark:text-secondary-400',
    },
    error: {
      bg: 'glass-effect bg-[#13131A] dark:bg-error-900',
      border: 'border-l-4 border-l-red-500 dark:border-error-800 border-gray-800 dark:border-error-800',
      text: 'text-gray-300 dark:text-error-200',
      icon: 'text-red-500 dark:text-error-400',
    },
    warning: {
      bg: 'glass-effect bg-[#13131A] dark:bg-warning-900',
      border: 'border-l-4 border-l-yellow-500 dark:border-warning-800 border-gray-800 dark:border-warning-800',
      text: 'text-gray-300 dark:text-warning-200',
      icon: 'text-yellow-500 dark:text-warning-400',
    },
    info: {
      bg: 'glass-effect bg-[#13131A] dark:bg-primary-900',
      border: 'border-l-4 border-l-blue-500 dark:border-primary-800 border-gray-800 dark:border-primary-800',
      text: 'text-gray-300 dark:text-primary-200',
      icon: 'text-blue-500 dark:text-primary-400',
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
            'ml-4 flex-shrink-0 p-1 rounded-md hover:bg-[#1C1C26] dark:hover:bg-opacity-20 transition-colors',
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
