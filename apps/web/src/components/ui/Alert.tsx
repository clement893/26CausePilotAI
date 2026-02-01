/**
 * Alert Component
 *
 * Alert/notification component for displaying messages to users.
 * Supports multiple variants (info, success, warning, error) and can be dismissible.
 *
 * @example
 * ```tsx
 * // Basic alert
 * <Alert variant="success">Operation completed successfully</Alert>
 *
 * // Alert with title
 * <Alert variant="error" title="Error" onClose={handleClose}>
 *   Something went wrong
 * </Alert>
 *
 * // Dismissible alert
 * <Alert variant="info" dismissible onClose={handleDismiss}>
 *   New feature available
 * </Alert>
 * ```
 */
'use client';

import { type ReactNode, memo } from 'react';
import { clsx } from 'clsx';
import { AlertVariant, BaseComponentProps, ClosableProps, IconProps } from './types';
import { useComponentConfig } from '@/lib/theme/use-component-config';
import { applyVariantConfigAsStyles } from '@/lib/theme/variant-helpers';
import Text from './Text';

export interface AlertProps extends BaseComponentProps, ClosableProps, IconProps {
  /** Alert variant style */
  variant?: AlertVariant;
  /** Alert title */
  title?: string;
  /** Alert content */
  children: ReactNode;
}

const variantClasses = {
  info: {
    container: 'bg-[#13131A] bg-blue-500/20 border-l-4 border-l-blue-500 border-blue-500/30 border-gray-800 border-blue-500/30',
    text: 'text-gray-300 text-blue-300',
    title: 'text-white text-white font-semibold',
    icon: 'text-blue-500 text-blue-400',
  },
  success: {
    container: 'bg-[#13131A] bg-green-500/20 border-l-4 border-l-green-500 border-green-500/30 border-gray-800 border-green-500/30',
    text: 'text-gray-300 text-green-300',
    title: 'text-white text-white font-semibold',
    icon: 'text-green-500 text-green-400',
  },
  warning: {
    container: 'bg-[#13131A] bg-yellow-500/20 border-l-4 border-l-yellow-500 border-yellow-500/30 border-gray-800 border-yellow-500/30',
    text: 'text-gray-300 text-yellow-300',
    title: 'text-white text-white font-semibold',
    icon: 'text-yellow-500 text-yellow-400',
  },
  error: {
    container: 'bg-[#13131A] bg-red-500/20 border-l-4 border-l-red-500 border-red-500/30 border-gray-800 border-red-500/30',
    text: 'text-gray-300 text-red-300',
    title: 'text-white text-white font-semibold',
    icon: 'text-red-500 text-red-400',
  },
};

const defaultIcons = {
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

function Alert({ variant = 'info', title, children, onClose, className, icon }: AlertProps) {
  const { getVariant } = useComponentConfig('alert');
  const variantConfig = getVariant(variant);
  const classes = variantClasses[variant];
  const displayIcon = icon ?? defaultIcons[variant];

  // Get variant styles for inline application
  const variantStyles = variantConfig ? applyVariantConfigAsStyles(variantConfig) : {};

  return (
    <div className={clsx('rounded-lg p-lg', classes.container, className)} style={variantStyles}>
      <div className="flex">
        <div className="flex-shrink-0">{displayIcon}</div>
        <div className="ml-4 flex-1">
          {title && <h3 className={clsx('text-sm font-medium mb-2', classes.title)}>{title}</h3>}
          <Text variant="small" className={classes.text}>
            {children}
          </Text>
        </div>
        {onClose && (
          <div className="ml-auto pl-4">
            <button
              onClick={onClose}
              className={clsx('inline-flex rounded-md p-1.5 hover:bg-opacity-20 transition-colors', classes.text)}
              aria-label="Close alert"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Alert);
