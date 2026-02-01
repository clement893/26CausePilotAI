'use client';

/**
 * ReportView - Étape 4.2.1
 * Affichage d'un rapport : tableau + graphique.
 */

import { Card } from '@/components/ui';
import Chart from '@/components/ui/Chart';
import type { ReportDataRow } from '@/app/actions/reports/types';

export interface ReportViewProps {
  title: string;
  description?: string | null;
  rows: ReportDataRow[];
  summary?: number;
  metricLabel?: string;
  error?: string;
}

function formatValue(value: number, metricLabel?: string): string {
  if (metricLabel === 'total_donations' || metricLabel === 'avg_donation') {
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(value);
  }
  return new Intl.NumberFormat('fr-CA').format(value);
}

export function ReportView({
  title,
  description,
  rows,
  summary,
  metricLabel,
  error,
}: ReportViewProps) {
  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  const chartData = rows.map((r) => ({ label: r.label, value: r.value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-gray-400 mt-1">{description}</p>}
        {summary != null && (
          <p className="text-lg text-[var(--color-primary,#3B82F6)] mt-2">
            Total : {formatValue(summary, metricLabel)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Tableau</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-gray-400 font-medium">Libellé</th>
                    <th className="text-right py-2 px-3 text-gray-400 font-medium">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-gray-500">
                        Aucune donnée pour la période sélectionnée.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2 px-3 text-white">{row.label}</td>
                        <td className="py-2 px-3 text-right text-white">
                          {formatValue(row.value, metricLabel)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Graphique</h2>
            {rows.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Aucune donnée à afficher.
              </div>
            ) : (
              <div className="h-64">
                <Chart
                  data={chartData}
                  type={rows.length <= 6 ? 'bar' : 'line'}
                  height={240}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
