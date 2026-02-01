'use client';

/**
 * KPIWidget - Affiche un KPI avec valeur, tendance et sparkline optionnel.
 */

import { type ReactNode } from 'react';
import { Widget } from './Widget';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface KPIWidgetProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  sparklineData?: number[];
  icon?: ReactNode;
  showHandle?: boolean;
}

export function KPIWidget({
  title,
  value,
  trend,
  trendUp = true,
  sparklineData,
  icon,
  showHandle,
}: KPIWidgetProps) {
  return (
    <Widget title={title} icon={icon} showHandle={showHandle}>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-400' : 'text-red-400'}`}
          >
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{trend}</span>
          </div>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-2 h-8 flex items-end gap-0.5">
            {sparklineData.map((v, i) => {
              const max = Math.max(...sparklineData);
              const h = max > 0 ? (v / max) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 min-w-[2px] rounded-t bg-[var(--color-primary,#3B82F6)]/60"
                  style={{ height: `${Math.max(4, h)}%` }}
                  title={`${v}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </Widget>
  );
}
