'use client';

/**
 * DonatorsDashboard - Étape 4.1.2
 * KPIs et graphiques pour le module Donateurs (LTV, nouveaux, etc.).
 */

import { useEffect, useState } from 'react';
import { KPIWidget, ChartWidget } from '@/components/dashboard';
import { getDonatorsDashboardData } from '@/app/actions/dashboard/getDonatorsDashboardData';
import { Users, UserPlus, DollarSign, TrendingUp } from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export interface DonatorsDashboardProps {
  organizationId: string;
}

export function DonatorsDashboard({ organizationId }: DonatorsDashboardProps) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDonatorsDashboardData>> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    getDonatorsDashboardData(organizationId).then((res) => {
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
          title="Total donateurs"
          value={data.totalDonators}
          icon={<Users className="h-5 w-5" />}
        />
        <KPIWidget
          title="Nouveaux ce mois"
          value={data.newThisMonth}
          trend="donateurs"
          trendUp={true}
          icon={<UserPlus className="h-5 w-5" />}
        />
        <KPIWidget
          title="LTV moyen"
          value={formatCurrency(data.avgLtv)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPIWidget
          title="Total dons"
          value={formatCurrency(data.totalDonationsValue)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Nouveaux donateurs par mois"
          data={data.chartNewByMonth}
          type="bar"
          height={220}
        />
        <ChartWidget
          title="Dons par mois"
          data={data.chartDonationsByMonth}
          type="line"
          height={220}
        />
      </div>
    </div>
  );
}
