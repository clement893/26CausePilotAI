'use client';

/**
 * ReportBuilder - Étape 4.2.1
 * Configuration d'un rapport : métriques, dimensions, période.
 */

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import {
  REPORT_METRICS,
  REPORT_DIMENSIONS,
  type ReportConfig,
  type ReportMetric,
  type ReportDimension,
} from '@/app/actions/reports/types';

export interface ReportBuilderProps {
  defaultConfig?: Partial<ReportConfig>;
  onSubmit: (name: string, description: string, config: ReportConfig) => void;
  isSubmitting?: boolean;
}

function getDefaultDates(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    .toISOString()
    .slice(0, 10);
  return { dateFrom: from, dateTo: to };
}

export function ReportBuilder({
  defaultConfig,
  onSubmit,
  isSubmitting = false,
}: ReportBuilderProps) {
  const { dateFrom: defaultFrom, dateTo: defaultTo } = getDefaultDates();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metric, setMetric] = useState<ReportMetric>(defaultConfig?.metric ?? 'total_donations');
  const [dimension, setDimension] = useState<ReportDimension>(defaultConfig?.dimension ?? 'none');
  const [dateFrom, setDateFrom] = useState(defaultConfig?.dateFrom ?? defaultFrom);
  const [dateTo, setDateTo] = useState(defaultConfig?.dateTo ?? defaultTo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim(), {
      metric,
      dimension,
      dateFrom,
      dateTo,
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Configuration du rapport</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Nom du rapport *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Dons du dernier trimestre"
            className="bg-[#1C1C26] border-gray-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Description (optionnel)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brève description du rapport"
            className="bg-[#1C1C26] border-gray-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Métrique</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as ReportMetric)}
              className="w-full rounded-lg border border-gray-700 bg-[#1C1C26] px-4 py-2 text-white"
            >
              {REPORT_METRICS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Dimension</label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as ReportDimension)}
              className="w-full rounded-lg border border-gray-700 bg-[#1C1C26] px-4 py-2 text-white"
            >
              {REPORT_DIMENSIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Du</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-[#1C1C26] border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Au</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-[#1C1C26] border-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Génération…' : 'Générer le rapport'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
