'use client';

/**
 * FormsDashboard - Étape 4.1.2
 * KPIs et graphiques pour le module Formulaires (formulaires de don).
 */

import { useEffect, useState } from 'react';
import { KPIWidget, ChartWidget } from '@/components/dashboard';
import { getFormsDashboardData } from '@/app/actions/dashboard/getFormsDashboardData';
import { FileEdit, FileText, DollarSign, Percent } from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export interface FormsDashboardProps {
  organizationId: string;
}

export function FormsDashboard({ organizationId }: FormsDashboardProps) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getFormsDashboardData>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    getFormsDashboardData(organizationId).then((res) => {
      if (!cancelled) setData(res);
    });
    return () => { cancelled = true; };
  }, [organizationId]);

  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.error && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-200">
          {data.error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          title="Formulaires"
          value={data.totalForms}
          icon={<FileEdit className="h-5 w-5" />}
        />
        <KPIWidget
          title="Soumissions"
          value={data.totalSubmissions}
          trend={`Ce mois: ${data.submissionsThisMonth}`}
          trendUp={true}
          icon={<FileText className="h-5 w-5" />}
        />
        <KPIWidget
          title="Total collecté"
          value={formatCurrency(data.totalCollected)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPIWidget
          title="Taux de conversion moyen"
          value={`${data.avgConversionRate}%`}
          icon={<Percent className="h-5 w-5" />}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Soumissions par mois"
          data={data.chartSubmissionsByMonth}
          type="bar"
          height={220}
        />
        <ChartWidget
          title="Soumissions par formulaire"
          data={data.chartByForm}
          type="pie"
          height={220}
        />
      </div>
    </div>
  );
}
