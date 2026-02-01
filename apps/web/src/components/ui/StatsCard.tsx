import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon?: ReactNode;
  className?: string;
  trend?: ReactNode;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  className,
  trend,
}: StatsCardProps) {
  return (
    <div
      className={clsx(
        'glass-effect bg-[#13131A] dark:bg-background rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-800 dark:border-border hover-lift',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 dark:text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-white dark:text-foreground">{value}</p>
          {change && (
            <div className="mt-2 flex items-center">
              <span
                className={clsx(
                  'text-sm font-medium',
                  change.type === 'increase'
                    ? 'text-green-400 dark:text-success-400'
                    : 'text-red-400 dark:text-error-400'
                )}
              >
                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              {change.period && (
                <span className="ml-2 text-sm text-gray-400 dark:text-muted-foreground">vs {change.period}</span>
              )}
            </div>
          )}
          {trend && <div className="mt-2">{trend}</div>}
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0 text-blue-400 dark:text-primary-400">{icon}</div>
        )}
      </div>
    </div>
  );
}
