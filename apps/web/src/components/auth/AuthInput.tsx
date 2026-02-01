'use client';

/**
 * AuthInput - Étape 1.1.3
 * Input avec label, erreur, glow au focus, toggle password
 */

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  {
    label,
    error,
    leftIcon,
    fullWidth,
    type: initialType = 'text',
    id,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = initialType === 'password';
  const type = isPassword && showPassword ? 'text' : initialType;
  const inputId = id ?? `auth-input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-[var(--text-secondary,#A0A0B0)]"
      >
        {label}
      </label>
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary,#6B6B7B)]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            'w-full rounded-lg border bg-[var(--background-tertiary,#1C1C26)] px-4 py-3 text-[var(--text-primary,#FFFFFF)] placeholder-[var(--text-disabled,#4A4A5A)] transition-all duration-200',
            'focus:border-[var(--color-info,#3B82F6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info,#3B82F6)]/30',
            'border-[var(--background-elevated,#252532)]',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
            leftIcon && 'pl-10',
            isPassword && 'pr-12'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary,#A0A0B0)] hover:text-[var(--text-primary,#FFFFFF)]"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? 'Masquer' : 'Afficher'}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
