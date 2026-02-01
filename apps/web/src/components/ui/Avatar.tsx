/**
 * Avatar Component
 * User avatar component with fallback
 */
'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string; // Name for generating initials fallback
  fallback?: string | ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'busy' | 'offline';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusClasses = {
  online: 'bg-success-500 bg-green-500',
  away: 'bg-warning-500 bg-yellow-500',
  busy: 'bg-error-500 bg-red-500',
  offline: 'bg-gray-500/60',
};

const statusSizeClasses = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
};

export default function Avatar({
  src,
  alt = 'Avatar',
  name,
  fallback,
  size = 'md',
  status,
  className,
  onClick,
}: AvatarProps) {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Use name as fallback if fallback is not provided
  const fallbackText = fallback
    ? typeof fallback === 'string'
      ? getInitials(fallback)
      : fallback
    : name
      ? getInitials(name)
      : '?';

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center',
        'rounded-full bg-[#1C1C26]',
        'text-white text-gray-400',
        'overflow-hidden',
        'border-2 border-transparent',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt || name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium">{fallbackText}</span>
      )}
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-[#13131A]',
            statusClasses[status],
            statusSizeClasses[size]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

export function AvatarImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={clsx('w-full h-full object-cover', className)} />;
}

export function AvatarFallback({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={clsx('font-medium flex items-center justify-center w-full h-full', className)}>
      {children}
    </span>
  );
}
