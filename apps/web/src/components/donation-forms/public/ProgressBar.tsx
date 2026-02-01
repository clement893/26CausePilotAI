'use client';

/**
 * ProgressBar - Étape 2.1.4
 * Barre de progression pour l'objectif de collecte.
 */

export interface ProgressBarProps {
  current: number;
  goal: number;
  currency: string;
  className?: string;
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(amount);
}

export default function ProgressBar({ current, goal, currency, className }: ProgressBarProps) {
  const percent = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <div className={className}>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/80">{formatAmount(current, currency)} collectés</span>
        <span className="text-white/80">Objectif : {formatAmount(goal, currency)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[var(--color-primary,#3B82F6)] transition-all duration-500"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={goal}
        />
      </div>
    </div>
  );
}
