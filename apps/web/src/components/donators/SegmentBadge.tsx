'use client';

/**
 * SegmentBadge - Étape 1.2.1
 * VIP: bleu-violet, Active: vert-cyan, Inactive: gris, New: orange-rose, Custom: couleur personnalisée
 */

import { clsx } from 'clsx';

export type DonatorSegment = 'VIP' | 'Active' | 'Inactive' | 'New' | 'Custom';

const segmentClasses: Record<DonatorSegment, string> = {
  VIP: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
  Active: 'bg-gradient-to-r from-green-500 to-cyan-500 text-white',
  Inactive: 'bg-gray-600/30 text-gray-400',
  New: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white',
  Custom: 'bg-[var(--background-elevated,#252532)] text-[var(--text-secondary,#A0A0B0)]',
};

export interface SegmentBadgeProps {
  segment: DonatorSegment | string;
  className?: string;
}

export function SegmentBadge({ segment, className }: SegmentBadgeProps) {
  const s = segment as DonatorSegment;
  const styleClass = segmentClasses[s] ?? segmentClasses.Custom;
  const label = segment === 'Custom' ? 'Custom' : segment;

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styleClass,
        className
      )}
    >
      {label}
    </span>
  );
}
