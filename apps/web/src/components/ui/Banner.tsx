'use client';
import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import Button from './Button';
export type BannerVariant = 'info' | 'success' | 'warning' | 'error';
interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
  icon?: ReactNode;
  className?: string;
  fullWidth?: boolean;
}
const variantStyles: Record<
  BannerVariant,
  { bg: string; border: string; text: string; icon: ReactNode }
> = {
  info: {
    bg: 'bg-[#13131A] dark:bg-info-900',
    border: 'border-l-4 border-l-blue-500 border-gray-800 dark:border-info-800',
    text: 'text-white dark:text-info-200',
    icon: <Info className="w-5 h-5" />,
  },
  success: {
    bg: 'bg-[#13131A] dark:bg-success-900',
    border: 'border-l-4 border-l-green-500 border-gray-800 dark:border-success-800',
    text: 'text-white dark:text-success-200',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  warning: {
    bg: 'bg-[#13131A] dark:bg-warning-900',
    border: 'border-l-4 border-l-yellow-500 border-gray-800 dark:border-warning-800',
    text: 'text-white dark:text-warning-200',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  error: {
    bg: 'bg-[#13131A] dark:bg-error-900',
    border: 'border-l-4 border-l-red-500 border-gray-800 dark:border-error-800',
    text: 'text-white dark:text-error-200',
    icon: <AlertCircle className="w-5 h-5" />,
  },
};
export default function Banner({
  variant = 'info',
  title,
  children,
  onClose,
  dismissible = false,
  icon,
  className,
  fullWidth = false,
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) {
    return null;
  }
  const styles = variantStyles[variant];
  const displayIcon = icon || styles.icon;
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };
  return (
    <div
      className={clsx(
        'glass-effect border rounded-lg p-4',
        styles.bg,
        styles.border,
        fullWidth ? 'w-full' : '',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className={clsx('flex-shrink-0', styles.text)}>{displayIcon}</div>
        <div className="flex-1 min-w-0">
          {title && <h3 className={clsx('font-semibold mb-1', styles.text)}>{title}</h3>}
          <div className={clsx('text-sm', styles.text)}>{children}</div>
        </div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-white dark:hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
