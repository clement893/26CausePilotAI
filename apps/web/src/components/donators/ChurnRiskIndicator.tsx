'use client';

/**
 * ChurnRiskIndicator - Étape 5.3.1
 * Indicateur visuel du risque de churn d'un donateur
 */

import { AlertTriangle, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui';

export interface ChurnRiskIndicatorProps {
  churnProbability: number | null | undefined;
  className?: string;
}

export type ChurnRiskLevel = 'high' | 'medium' | 'low' | 'none';

/**
 * Détermine le niveau de risque de churn
 */
function getChurnRiskLevel(probability: number | null | undefined): ChurnRiskLevel {
  if (probability === null || probability === undefined) {
    return 'none';
  }
  
  if (probability >= 0.75) return 'high';
  if (probability >= 0.5) return 'medium';
  if (probability >= 0.25) return 'low';
  return 'none';
}

/**
 * Obtient la configuration pour un niveau de risque
 */
function getRiskConfig(level: ChurnRiskLevel) {
  switch (level) {
    case 'high':
      return {
        label: 'Risque élevé',
        variant: 'error' as const,
        icon: AlertTriangle,
        color: 'text-red-400',
        bgColor: 'bg-red-500/15',
        borderColor: 'border-red-500/30',
      };
    case 'medium':
      return {
        label: 'Risque modéré',
        variant: 'warning' as const,
        icon: AlertCircle,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/15',
        borderColor: 'border-yellow-500/30',
      };
    case 'low':
      return {
        label: 'Risque faible',
        variant: 'info' as const,
        icon: TrendingDown,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/15',
        borderColor: 'border-blue-500/30',
      };
    case 'none':
      return {
        label: 'Aucun risque',
        variant: 'success' as const,
        icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/15',
        borderColor: 'border-green-500/30',
      };
  }
}

export function ChurnRiskIndicator({ churnProbability, className }: ChurnRiskIndicatorProps) {
  const riskLevel = getChurnRiskLevel(churnProbability);
  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  // Ne pas afficher si aucun risque
  if (riskLevel === 'none' && (churnProbability === null || churnProbability === undefined)) {
    return null;
  }

  const percentage = churnProbability !== null && churnProbability !== undefined
    ? (churnProbability * 100).toFixed(0)
    : '0';

  return (
    <div className={`inline-flex items-center gap-2 ${className || ''}`}>
      <Badge variant={config.variant} className="inline-flex items-center gap-1.5">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      {churnProbability !== null && churnProbability !== undefined && (
        <span className={`text-xs font-medium ${config.color}`}>
          {percentage}%
        </span>
      )}
    </div>
  );
}

/**
 * Barre de progression pour le risque de churn
 */
export function ChurnRiskBar({ churnProbability, className }: ChurnRiskIndicatorProps) {
  const riskLevel = getChurnRiskLevel(churnProbability);
  const config = getRiskConfig(riskLevel);

  if (churnProbability === null || churnProbability === undefined) {
    return null;
  }

  const percentage = Math.min(100, Math.max(0, churnProbability * 100));

  return (
    <div className={`space-y-1 ${className || ''}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-secondary,#A0A0B0)]">Risque de churn</span>
        <span className={`font-medium ${config.color}`}>{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--background-tertiary,#1C1C26)] overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${config.bgColor} ${config.borderColor} border-r`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
