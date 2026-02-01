'use client';

/**
 * AuthButton - Étape 1.1.3
 * Bouton primary (gradient), outline, google + loading, full width, icon
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

type AuthButtonVariant = 'primary' | 'outline' | 'google';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AuthButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function AuthButton({
  variant = 'primary',
  loading = false,
  fullWidth,
  icon,
  children,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary,#0A0A0F)]';

  const variants = {
    primary: [
      'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
      'hover:from-blue-600 hover:to-purple-600 focus:ring-blue-500/50',
      'shadow-[0_0_20px_rgba(102,126,234,0.4)]',
    ].join(' '),
    outline: [
      'border border-white/20 bg-transparent text-[var(--text-primary,#FFF)]',
      'hover:bg-white/5 focus:ring-white/30',
    ].join(' '),
    google: [
      'border border-white/20 bg-transparent text-[var(--text-primary,#FFF)]',
      'hover:bg-white/10 hover:border-white/30 focus:ring-white/30',
    ].join(' '),
  };

  return (
    <button
      type={props.type ?? 'button'}
      className={clsx(base, variants[variant], fullWidth && 'w-full', className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
