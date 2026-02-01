'use client';

/**
 * CampaignsDashboard - Étape 4.1.2
 * KPIs et graphiques pour le module Campagnes (campagnes email).
 */

import { useEffect, useState } from 'react';
import { KPIWidget, ChartWidget } from '@/components/dashboard';
import { getCampaignsDashboardData } from '@/app/actions/dashboard/getCampaignsDashboardData';
import { Megaphone, Send, FileEdit, Mail } from 'lucide-react';

export interface CampaignsDashboardProps {
  organizationId: string;
}

export function CampaignsDashboard({ organizationId }: CampaignsDashboardProps) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getCampaignsDashboardData>> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    getCampaignsDashboardData(organizationId).then((res) => {
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
          title="Total campagnes"
          value={data.totalCampaigns}
          icon={<Megaphone className="h-5 w-5" />}
        />
        <KPIWidget
          title="Envoyées ce mois"
          value={data.sentThisMonth}
          trend="campagnes"
          trendUp={true}
          icon={<Send className="h-5 w-5" />}
        />
        <KPIWidget
          title="Brouillons"
          value={data.draftCount}
          icon={<FileEdit className="h-5 w-5" />}
        />
        <KPIWidget
          title="Envoyées (total)"
          value={data.sentCount}
          icon={<Mail className="h-5 w-5" />}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget
          title="Campagnes par statut"
          data={data.chartByStatus}
          type="pie"
          height={220}
        />
        <ChartWidget
          title="Campagnes envoyées par mois"
          data={data.chartSentByMonth}
          type="bar"
          height={220}
        />
      </div>
    </div>
  );
}
