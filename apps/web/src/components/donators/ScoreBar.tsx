'use client';

/**
 * ScoreBar - Étape 1.2.1
 * Barre 0-100 : 0-30 rouge, 31-60 orange, 61-80 jaune, 81-100 vert. Tooltip score exact.
 */

import { clsx } from 'clsx';
import { useState } from 'react';

function getColorClass(score: number): string {
  if (score <= 30) return 'bg-red-500';
  if (score <= 60) return 'bg-orange-500';
  if (score <= 80) return 'bg-yellow-500';
  return 'bg-green-500';
}

export interface ScoreBarProps {
  score: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ScoreBar({
  score,
  max = 100,
  className,
  showLabel = false,
}: ScoreBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const value = Math.min(max, Math.max(0, score));
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div
      className={clsx('flex items-center gap-2', className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative h-2 flex-1 min-w-[60px] overflow-hidden rounded-full bg-[var(--background-elevated,#252532)]">
        <div
          className={clsx('h-full rounded-full transition-all duration-300', getColorClass(value))}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[var(--text-tertiary,#6B6B7B)] w-6">{value}</span>
      )}
      {showTooltip && (
        <div className="absolute z-10 mt-6 rounded px-2 py-1 text-xs bg-[var(--background-secondary,#13131A)] border border-white/10 shadow-lg">
          Score : {value} / {max}
        </div>
      )}
    </div>
  );
}
