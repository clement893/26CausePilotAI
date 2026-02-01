'use client';

/**
 * DonatorStatsCards - Étape 1.2.2
 * 4 cartes profil : Total collecté, Nb dons, Don moyen, Score propension (barre).
 */

import { Target } from 'lucide-react';
import { ScoreBar } from './ScoreBar';
import { clsx } from 'clsx';

export interface DonatorStatCard {
  value: string | number;
  label: string;
  trend?: string;
  icon: React.ReactNode;
  gradient: string;
}

export interface DonatorStatsCardsProps {
  totalCollected: DonatorStatCard;
  donationCount: DonatorStatCard;
  averageDonation: DonatorStatCard;
  score: { value: number; max?: number; label: string };
  className?: string;
}

export function DonatorStatsCards({
  totalCollected,
  donationCount,
  averageDonation,
  score,
  className,
}: DonatorStatsCardsProps) {
  return (
    <div
      className={clsx(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      <div className="rounded-xl border border-white/10 p-4 bg-[var(--background-secondary,#13131A)]">
        <div className="flex items-center gap-3">
          <div className={clsx('rounded-lg p-2', totalCollected.gradient)}>{totalCollected.icon}</div>
          <div>
            <p className="text-2xl font-bold text-white">{totalCollected.value}</p>
            <p className="text-sm text-white/80">{totalCollected.label}</p>
            {totalCollected.trend && (
              <p className="text-xs text-green-400 mt-0.5">{totalCollected.trend}</p>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-4 bg-[var(--background-secondary,#13131A)]">
        <div className="flex items-center gap-3">
          <div className={clsx('rounded-lg p-2', donationCount.gradient)}>{donationCount.icon}</div>
          <div>
            <p className="text-2xl font-bold text-white">{donationCount.value}</p>
            <p className="text-sm text-white/80">{donationCount.label}</p>
            {donationCount.trend && (
              <p className="text-xs text-green-400 mt-0.5">{donationCount.trend}</p>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-4 bg-[var(--background-secondary,#13131A)]">
        <div className="flex items-center gap-3">
          <div className={clsx('rounded-lg p-2', averageDonation.gradient)}>{averageDonation.icon}</div>
          <div>
            <p className="text-2xl font-bold text-white">{averageDonation.value}</p>
            <p className="text-sm text-white/80">{averageDonation.label}</p>
            {averageDonation.trend && (
              <p className="text-xs text-green-400 mt-0.5">{averageDonation.trend}</p>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-4 bg-[var(--background-secondary,#13131A)] bg-gradient-to-br from-amber-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-amber-500/20">
            <Target className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white/80">{score.label}</p>
            <p className="text-xl font-bold text-white">{score.value}/{score.max ?? 100}</p>
            <ScoreBar score={score.value} max={score.max ?? 100} showLabel className="mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
