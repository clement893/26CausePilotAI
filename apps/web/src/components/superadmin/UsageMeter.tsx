'use client';

/**
 * Usage Meter Component
 * Étape 7.1.2 - Gestion des organisations (Super Admin)
 * Barre de progression montrant l'utilisation par rapport aux limites
 */

interface UsageMeterProps {
  current: number;
  max: number;
  label: string;
  unit?: string;
  className?: string;
  showPercentage?: boolean;
}

export function UsageMeter({
  current,
  max,
  label,
  unit = '',
  className = '',
  showPercentage = true,
}: UsageMeterProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  const barColor = isCritical
    ? 'bg-red-500'
    : isWarning
    ? 'bg-yellow-500'
    : 'bg-green-500';

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">
          {current.toLocaleString()} / {max.toLocaleString()} {unit}
          {showPercentage && ` (${percentage.toFixed(0)}%)`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
