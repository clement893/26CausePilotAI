'use client';

/**
 * ChartWidget - Widget avec graphique (bar, line, pie) et filtre optionnel.
 */

import { useState, type ReactNode } from 'react';
import { Widget } from './Widget';
import Chart from '@/components/ui/Chart';
import type { ChartDataPoint } from '@/components/ui/Chart';

export type ChartType = 'bar' | 'line' | 'pie';

export interface ChartWidgetProps {
  title: string;
  data: ChartDataPoint[];
  type?: ChartType;
  height?: number;
  icon?: ReactNode;
  showHandle?: boolean;
  /** Options de filtre (ex: 7j, 30j, 90j) */
  filterOptions?: { label: string; value: string }[];
  onFilterChange?: (value: string) => void;
}

export function ChartWidget({
  title,
  data,
  type = 'bar',
  height = 200,
  icon,
  showHandle,
  filterOptions,
  onFilterChange,
}: ChartWidgetProps) {
  const [filter, setFilter] = useState(filterOptions?.[0]?.value);

  const handleFilter = (value: string) => {
    setFilter(value);
    onFilterChange?.(value);
  };

  return (
    <Widget title={title} icon={icon} showHandle={showHandle}>
      <div className="space-y-3">
        {filterOptions && filterOptions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleFilter(opt.value)}
                className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-[var(--color-primary,#3B82F6)] text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ height }} className="w-full">
          <Chart data={data} type={type} height={height} />
        </div>
      </div>
    </Widget>
  );
}
