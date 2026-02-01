'use client';

/**
 * Dashboard Principal - Étape 4.1.1
 * Vue d'ensemble avec grille de widgets (KPIs, graphique, activité récente).
 * Layout personnalisable (drag & drop), sauvegardé par utilisateur.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store';
import { useOrganization } from '@/hooks/useOrganization';
import { PageHeader } from '@/components/layout';
import { Button, LoadingSkeleton } from '@/components/ui';
import {
  DashboardGrid,
  KPIWidget,
  ChartWidget,
  RecentActivityWidget,
} from '@/components/dashboard';
import { getDashboardData } from '@/app/actions/dashboard/getDashboardData';
import { getDashboardLayoutAction } from '@/app/actions/dashboard/getDashboardLayout';
import { saveDashboardLayoutAction } from '@/app/actions/dashboard/saveDashboardLayout';
import type { Layout } from 'react-grid-layout';
import { Users, DollarSign, TrendingUp, UserPlus, LayoutGrid } from 'lucide-react';

const DEFAULT_LAYOUT: Layout = [
  { i: 'kpi-donors', x: 0, y: 0, w: 3, h: 2 },
  { i: 'kpi-donations', x: 3, y: 0, w: 3, h: 2 },
  { i: 'kpi-month', x: 6, y: 0, w: 3, h: 2 },
  { i: 'kpi-new', x: 9, y: 0, w: 3, h: 2 },
  { i: 'chart-donations', x: 0, y: 2, w: 8, h: 3 },
  { i: 'recent-activity', x: 8, y: 2, w: 4, h: 3 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export default function DashboardMainContent() {
  const { user } = useAuthStore();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardData>> | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!activeOrganization?.id) return;
    let cancelled = false;
    getDashboardData(activeOrganization.id).then((res) => {
      if (!cancelled) setData(res);
    });
    return () => { cancelled = true; };
  }, [activeOrganization?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getDashboardLayoutAction(user.id).then((res) => {
      if (!cancelled && res.layout.length > 0) setLayout(res.layout as Layout);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      setLayout(newLayout);
      if (!user?.id) return;
      if (saveTimeout) clearTimeout(saveTimeout);
      const t = setTimeout(() => {
        saveDashboardLayoutAction(
          user.id,
          newLayout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
        ).then((res) => {
          if (res.error) console.warn('[Dashboard] saveLayout:', res.error);
        });
      }, 500);
      setSaveTimeout(t);
    },
    [user?.id, saveTimeout]
  );

  useEffect(() => () => { if (saveTimeout) clearTimeout(saveTimeout); }, [saveTimeout]);

  if (orgLoading || !activeOrganization) {
    return (
      <div className="space-y-6">
        <div>
          <LoadingSkeleton variant="custom" className="h-10 w-64 mb-2" />
          <LoadingSkeleton variant="custom" className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
        <LoadingSkeleton variant="card" count={2} className="h-48" />
      </div>
    );
  }

  const kpis = data?.kpis ?? {
    totalDonors: 0,
    totalDonations: 0,
    donationsThisMonth: 0,
    newDonorsThisMonth: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title={`Tableau de bord, ${user?.name || 'Utilisateur'} !`}
          description="Vue d'ensemble de l'activité de votre organisation"
          breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Dashboard' }]}
        />
        <Button
          variant={isEditable ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setIsEditable((e) => !e)}
          className="gap-2 shrink-0"
        >
          <LayoutGrid className="h-4 w-4" />
          {isEditable ? 'Terminer' : 'Modifier la disposition'}
        </Button>
      </div>

      {data?.error && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-200">
          {data.error}
        </div>
      )}

      <DashboardGrid
        initialLayout={layout}
        onLayoutChange={handleLayoutChange}
        isEditable={isEditable}
      >
        <div key="kpi-donors" className={isEditable ? 'cursor-move' : ''}>
          <KPIWidget
            title="Donateurs"
            value={kpis.totalDonors}
            trend={`Ce mois: +${kpis.newDonorsThisMonth}`}
            trendUp={true}
            icon={<Users className="h-5 w-5" />}
            showHandle={isEditable}
          />
        </div>
        <div key="kpi-donations" className={isEditable ? 'cursor-move' : ''}>
          <KPIWidget
            title="Total dons"
            value={formatCurrency(kpis.totalDonations)}
            icon={<DollarSign className="h-5 w-5" />}
            showHandle={isEditable}
          />
        </div>
        <div key="kpi-month" className={isEditable ? 'cursor-move' : ''}>
          <KPIWidget
            title="Dons ce mois"
            value={formatCurrency(kpis.donationsThisMonth)}
            trend={kpis.donationsThisMonth >= 0 ? 'vs mois dernier' : undefined}
            trendUp={true}
            icon={<TrendingUp className="h-5 w-5" />}
            showHandle={isEditable}
          />
        </div>
        <div key="kpi-new" className={isEditable ? 'cursor-move' : ''}>
          <KPIWidget
            title="Nouveaux donateurs"
            value={kpis.newDonorsThisMonth}
            trend="ce mois"
            trendUp={true}
            icon={<UserPlus className="h-5 w-5" />}
            showHandle={isEditable}
          />
        </div>
        <div key="chart-donations" className={isEditable ? 'cursor-move' : ''}>
          <ChartWidget
            title="Dons par mois"
            data={data?.chartDonationsByMonth ?? []}
            type="bar"
            height={180}
            showHandle={isEditable}
            filterOptions={[
              { label: '6 mois', value: '6m' },
              { label: '12 mois', value: '12m' },
            ]}
          />
        </div>
        <div key="recent-activity" className={isEditable ? 'cursor-move' : ''}>
          <RecentActivityWidget
            title="Activité récente"
            items={data?.recentActivity ?? []}
            showHandle={isEditable}
            emptyMessage="Aucune activité récente"
          />
        </div>
      </DashboardGrid>
    </div>
  );
}
