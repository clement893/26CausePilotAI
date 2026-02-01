import { ReactNode, memo } from 'react';
import { clsx } from 'clsx';
import { ColorVariant, BaseComponentProps, ColorVariantProps } from './types';
import { useComponentConfig } from '@/lib/theme/use-component-config';
import { mergeVariantConfig, applyVariantConfigAsStyles } from '@/lib/theme/variant-helpers';

interface BadgeProps extends BaseComponentProps, ColorVariantProps {
  children: ReactNode;
  variant?: ColorVariant;
}

function Badge({ children, variant = 'default', className }: BadgeProps) {
  const { getVariant } = useComponentConfig('badge');
  const variantConfig = getVariant(variant);

  const defaultVariants = {
    default: 'bg-muted text-foreground',
    success: 'bg-success-50 dark:bg-success-900 text-success-900 dark:text-success-300',
    warning: 'bg-warning-50 dark:bg-warning-900 text-warning-900 dark:text-warning-300',
    error: 'bg-error-50 dark:bg-error-900 text-error-900 dark:text-error-300',
    info: 'bg-info-50 dark:bg-info-900 text-info-900 dark:text-info-300',
    // Gradient variants for modern dark UI
    'gradient-primary': 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
    'gradient-success': 'bg-gradient-to-r from-green-500 to-cyan-500 text-white',
    'gradient-warning': 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
    'gradient-info': 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
  };

  // Merge theme variant with default variant
  const variantClasses = variantConfig
    ? mergeVariantConfig(defaultVariants[variant] || defaultVariants.default, variantConfig)
    : defaultVariants[variant] || defaultVariants.default;

  // Get variant styles for inline application
  const variantStyles = variantConfig ? applyVariantConfigAsStyles(variantConfig) : {};

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium',
        variantClasses,
        className
      )}
      style={variantStyles}
    >
      {children}
    </span>
  );
}

export default memo(Badge);
