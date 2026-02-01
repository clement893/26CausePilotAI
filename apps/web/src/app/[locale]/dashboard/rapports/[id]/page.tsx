'use client';

/**
 * Visualisation d'un rapport - Étape 4.2.1
 * Affiche le rapport (tableau + graphique) selon la config sauvegardée.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store';
import { useOrganization } from '@/hooks/useOrganization';
import { getReportAction } from '@/app/actions/reports/getReport';
import { getReportData } from '@/app/actions/reports/getReportData';
import { ReportView } from '@/components/reports';
import { REPORT_METRICS } from '@/app/actions/reports/types';
import { ChevronRight, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function getMetricLabel(metric: string): string {
  const m = REPORT_METRICS.find((x) => x.value === metric);
  return m?.label ?? metric;
}

export default function ReportViewPage() {
  const params = useParams();
  const reportId = params?.id as string;
  const { user } = useAuthStore();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string | null>(null);
  const [config, setConfig] = useState<{ metric: string; dimension: string; dateFrom: string; dateTo: string } | null>(null);
  const [rows, setRows] = useState<{ label: string; value: number }[]>([]);
  const [summary, setSummary] = useState<number | undefined>();
  const [metricLabel, setMetricLabel] = useState<string>('');
  const [dataError, setDataError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId || reportId === 'new' || !user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const res = await getReportAction(reportId, user.id);
      if (cancelled) return;
      if (res.error) {
        setLoadError(res.error);
        setConfig(null);
      } else if (res.report) {
        setTitle(res.report.name);
        setDescription(res.report.description);
        setConfig(res.report.config);
        setMetricLabel(getMetricLabel(res.report.config.metric));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [reportId, user?.id]);

  useEffect(() => {
    if (!activeOrganization?.id || !config) return;
    let cancelled = false;
    getReportData(activeOrganization.id, config).then((res) => {
      if (cancelled) return;
      if (res.error) setDataError(res.error);
      else {
        setDataError(null);
        setRows(res.rows ?? []);
        setSummary(res.summary);
      }
    });
    return () => { cancelled = true; };
  }, [activeOrganization?.id, config?.metric, config?.dimension, config?.dateFrom, config?.dateTo]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Connectez-vous pour voir ce rapport.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (reportId === 'new') {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Créez un rapport depuis la liste.</p>
          <Link href="/dashboard/rapports" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Voir les rapports
          </Link>
        </div>
      </div>
    );
  }

  if (loadError && !config) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-red-400">{loadError}</p>
          <Link href="/dashboard/rapports" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !config) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary,#3B82F6)]" />
      </div>
    );
  }

  if (orgLoading || !activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-64 animate-pulse rounded bg-white/10 mb-6" />
          <div className="h-96 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/rapports" className="hover:text-white">Rapports</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white truncate">{title || 'Rapport'}</span>
        </nav>

        <ReportView
          title={title}
          description={description}
          rows={rows}
          summary={summary}
          metricLabel={metricLabel}
          error={dataError ?? undefined}
        />
      </div>
    </div>
  );
}
