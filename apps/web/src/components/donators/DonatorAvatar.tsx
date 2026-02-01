'use client';

/**
 * DonatorAvatar - Étape 1.2.1
 * Avatar: image si dispo, sinon initiales + gradient basé sur le nom (hash). Tailles sm, md, lg, xl.
 */

import { clsx } from 'clsx';
import type { Donor } from '@modele/types';

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const gradients = [
  'from-blue-500 to-purple-500',
  'from-green-500 to-cyan-500',
  'from-orange-500 to-pink-500',
  'from-amber-500 to-rose-500',
  'from-indigo-500 to-violet-500',
  'from-teal-500 to-emerald-500',
];

function getGradientForName(name: string): string {
  const idx = hashString(name) % gradients.length;
  return gradients[idx] ?? gradients[0] ?? 'from-blue-500 to-purple-500';
}

function getInitials(donor: Donor): string {
  if (donor.first_name && donor.last_name) {
    return `${donor.first_name[0] ?? ''}${donor.last_name[0] ?? ''}`.toUpperCase() || '?';
  }
  if (donor.first_name) return (donor.first_name[0] ?? '?').toUpperCase();
  if (donor.last_name) return (donor.last_name[0] ?? '?').toUpperCase();
  return (donor.email[0] ?? '?').toUpperCase();
}

function getDisplayName(donor: Donor): string {
  if (donor.first_name || donor.last_name) {
    return `${donor.first_name ?? ''} ${donor.last_name ?? ''}`.trim();
  }
  return donor.email;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export interface DonatorAvatarProps {
  donor: Donor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** URL d'avatar personnalisée (si le type Donor n'a pas d'avatar) */
  avatarUrl?: string | null;
}

export function DonatorAvatar({
  donor,
  size = 'md',
  className,
  avatarUrl,
}: DonatorAvatarProps) {
  const name = getDisplayName(donor);
  const initials = getInitials(donor);
  const gradient = getGradientForName(name);
  const src = avatarUrl ?? (donor as { avatar_url?: string }).avatar_url;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx(
          'rounded-full object-cover flex-shrink-0',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white flex-shrink-0',
        gradient,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
