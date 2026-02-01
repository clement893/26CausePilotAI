/**
 * Textarea Component
 *
 * Multi-line text input component
 */
'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { useComponentConfig } from '@/lib/theme/use-component-config';
import Text from './Text';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, className, fullWidth = false, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substring(7)}`;

    const { getSize } = useComponentConfig('textarea');
    const sizeConfig = getSize('md');

    const paddingX = sizeConfig?.paddingX || '0.75rem';
    const paddingY = sizeConfig?.paddingY || '0.5rem';
    const fontSize = sizeConfig?.fontSize || '0.875rem';

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-300 dark:text-foreground mb-2">
            {label}
            {props.required && (
              <span className="text-error-500 dark:text-error-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative form-input-glow">
          {leftIcon && (
            <div className="absolute left-3 top-3 text-gray-400 dark:text-muted-foreground">{leftIcon}</div>
          )}

          <textarea
            ref={ref}
            id={textareaId}
            className={clsx(
              'block w-full border rounded-lg transition-all duration-200',
              'bg-[#1C1C26] dark:bg-[var(--color-input)]',
              'text-white dark:text-[var(--color-foreground)]',
              'placeholder:text-gray-500 dark:placeholder:text-[var(--color-muted-foreground)]',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'resize-y',
              error
                ? 'border-error-500 dark:border-error-400 focus:ring-error-500/20'
                : 'border-gray-700 dark:border-[var(--color-border)] focus:ring-primary/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            style={{
              paddingLeft: paddingX,
              paddingRight: paddingX,
              paddingTop: paddingY,
              paddingBottom: paddingY,
              fontSize,
            }}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-3 text-gray-400 dark:text-muted-foreground">{rightIcon}</div>
          )}
        </div>

        {error && (
          <Text variant="small" className="mt-2 text-error-600 dark:text-error-400" role="alert">
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text variant="small" className="mt-2 text-muted-foreground">
            {helperText}
          </Text>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
