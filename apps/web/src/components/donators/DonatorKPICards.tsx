'use client';

/**
 * DonatorKPICards - Étape 1.2.1
 * 4 cartes : Total actifs, Nouveaux ce mois, Taux rétention, Valeur moyenne. Gradient subtle, icône, tendance.
 */

import { Users, UserPlus, TrendingUp, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';

export interface KPICardItem {
  value: number | string;
  label: string;
  trend?: number;
  icon: React.ReactNode;
  gradient: string;
}

export interface DonatorKPICardsProps {
  totalActive: KPICardItem;
  newThisMonth: KPICardItem;
  retentionRate: KPICardItem;
  averageValue: KPICardItem;
  className?: string;
}

export function DonatorKPICards({
  totalActive,
  newThisMonth,
  retentionRate,
  averageValue,
  className,
}: DonatorKPICardsProps) {
  const cards: KPICardItem[] = [
    { ...totalActive, icon: <Users className="h-5 w-5" /> },
    { ...newThisMonth, icon: <UserPlus className="h-5 w-5" /> },
    { ...retentionRate, icon: <TrendingUp className="h-5 w-5" /> },
    { ...averageValue, icon: <DollarSign className="h-5 w-5" /> },
  ];

  return (
    <div
      className={clsx(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          className={clsx(
            'rounded-xl border border-white/10 p-4 bg-[var(--background-secondary,#13131A)]',
            'bg-gradient-to-br from-white/[0.03] to-transparent'
          )}
        >
          <div className="flex items-start justify-between">
            <div className={clsx('rounded-lg p-2', card.gradient)}>{card.icon}</div>
            {card.trend != null && (
              <span
                className={clsx(
                  'text-xs font-medium',
                  card.trend >= 0 ? 'text-green-400' : 'text-red-400'
                )}
              >
                {card.trend >= 0 ? '+' : ''}
                {card.trend.toFixed(1)}%
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
          </p>
          <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
