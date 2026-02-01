'use client';

/**
 * StatusBadge - Étape 1.1.4
 * Actif : vert, Inactif : gris
 */

import { clsx } from 'clsx';

interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function StatusBadge({ isActive, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        isActive ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400',
        className
      )}
    >
      {isActive ? 'Actif' : 'Inactif'}
    </span>
  );
}
