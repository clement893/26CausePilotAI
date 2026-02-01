import { ReactNode, memo } from 'react';
import { clsx } from 'clsx';
import { BadgeVariant, BaseComponentProps } from './types';
import { useComponentConfig } from '@/lib/theme/use-component-config';
import { mergeVariantConfig, applyVariantConfigAsStyles } from '@/lib/theme/variant-helpers';

interface BadgeProps extends BaseComponentProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

function Badge({ children, variant = 'default', className }: BadgeProps) {
  const { getVariant } = useComponentConfig('badge');
  const variantConfig = getVariant(variant);

  const defaultVariants = {
    default: 'bg-muted text-foreground',
    success: 'bg-success-50 bg-green-500/20 text-success-900 text-green-300',
    warning: 'bg-warning-50 bg-yellow-500/20 text-warning-900 text-yellow-300',
    error: 'bg-error-50 bg-red-500/20 text-error-900 text-red-300',
    info: 'bg-info-50 bg-blue-500/20 text-info-900 text-blue-300',
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
