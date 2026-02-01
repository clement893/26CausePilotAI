/**
 * ButtonLink Component
 *
 * A Button component that acts as a Link for navigation.
 * Combines Button styling with Link functionality from next-intl.
 *
 * This component solves the issue where Button inside Link doesn't work correctly
 * by rendering the Link directly with Button styles.
 *
 * @example
 * ```tsx
 * <ButtonLink href="/dashboard" variant="primary">
 *   Go to Dashboard
 * </ButtonLink>
 * ```
 */
'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { clsx } from 'clsx';
import type { ButtonVariant, Size } from './types';

// Base styles - same as Button component
const baseStyles = [
  'font-medium',
  'rounded-lg',
  'transition-all',
  'duration-200',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-offset-2',
  'inline-flex',
  'items-center',
  'justify-center',
].join(' ');

// Variant styles - same as Button component
const createVariantStyles = (base: string[], hover: string[], focus: string[], cssVar: string) =>
  [...base, ...hover, ...focus, '[background-color:var(--' + cssVar + ')]'].join(' ');

const variants: Record<string, string> = {
  primary: createVariantStyles(
    ['bg-primary-600', 'bg-blue-500', 'text-background'],
    ['hover:bg-primary-700', 'hover:bg-blue-600'],
    ['focus:ring-primary-500', 'focus:ring-blue-400'],
    'color-primary-500'
  ),
  secondary: createVariantStyles(
    ['bg-secondary-600', 'bg-green-500', 'text-background'],
    ['hover:bg-secondary-700', 'hover:bg-green-600'],
    ['focus:ring-secondary-500', 'focus:ring-green-400'],
    'color-secondary-500'
  ),
  outline: [
    'border-2',
    'border-primary-600',
    'border-blue-500',
    'text-primary-600',
    'text-blue-400',
    'hover:bg-primary-50',
    'hover:bg-blue-500/20',
    'focus:ring-primary-500',
    'focus:ring-blue-400',
    '[border-color:var(--color-primary-500)]',
    '[color:var(--color-primary-500)]',
  ].join(' '),
  ghost: ['text-white', 'hover:bg-[#1C1C26]', 'focus:ring-gray-400'].join(' '),
  danger: createVariantStyles(
    ['bg-error-600', 'bg-red-500', 'text-background'],
    ['hover:bg-error-700', 'hover:bg-red-600'],
    ['focus:ring-error-500', 'focus:ring-red-400'],
    'color-error-500'
  ),
  error: createVariantStyles(
    ['bg-error-600', 'bg-red-500', 'text-background'],
    ['hover:bg-error-700', 'hover:bg-red-600'],
    ['focus:ring-error-500', 'focus:ring-red-400'],
    'color-error-500'
  ),
  // Gradient variant for modern dark UI
  gradient: [
    'bg-gradient-to-r',
    'from-blue-500',
    'to-purple-500',
    'text-white',
    'hover:from-blue-600',
    'hover:to-purple-600',
    'focus:ring-primary-500',
    'focus:ring-blue-400',
  ].join(' '),
};

// Size styles - same as Button component
const sizes: Record<string, string> = {
  sm: 'px-4 py-2 text-sm min-h-[44px]',
  md: 'px-6 py-3 text-base min-h-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[44px]',
};

export interface ButtonLinkProps {
  /** Link href */
  href: string;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: Size;
  /** Show loading spinner */
  loading?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
  /** Open in new tab */
  target?: '_blank' | '_self';
  /** Link rel attribute */
  rel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button content */
  children: ReactNode;
}

/**
 * ButtonLink - A Button that acts as a Link
 *
 * This component combines Button styling with Link navigation.
 * It prevents the common issue of Button inside Link not working correctly.
 */
export default function ButtonLink({
  href,
  target,
  rel,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
}: ButtonLinkProps) {
  // If target is _blank, add rel="noopener noreferrer" for security
  const linkRel = target === '_blank' ? rel || 'noopener noreferrer' : rel;

  // For external links, use regular anchor tag
  const isExternal =
    href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');

  const buttonClasses = clsx(
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  const content = loading ? (
    <span className="flex items-center gap-2">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {children}
    </span>
  ) : (
    children
  );

  // Use regular anchor for external links
  if (isExternal) {
    return (
      <a href={href} target={target} rel={linkRel} className={buttonClasses}>
        {content}
      </a>
    );
  }

  // Use next-intl Link for internal links
  return (
    <Link href={href} className={buttonClasses}>
      {content}
    </Link>
  );
}
