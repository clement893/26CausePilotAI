'use client';

/**
 * Visualisation d'un rapport prédéfini - Étape 4.2.2 + 4.2.3 (export, planification)
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store';
import { useOrganization } from '@/hooks/useOrganization';
import { getPredefinedReportData } from '@/app/actions/reports/getPredefinedReportData';
import { PREDEFINED_REPORT_TYPES } from '@/app/actions/reports/types';
import type { PredefinedReportType } from '@/app/actions/reports/types';
import { ReportView, ExportButtons, ScheduleReportModal } from '@/components/reports';
import { Button } from '@/components/ui';
import { ChevronRight, Loader2, CalendarClock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const PREDEFINED_METRICS: Record<PredefinedReportType, string> = {
  annual_donations: 'total_donations',
  monthly_performance: 'total_donations',
  donations_by_form: 'total_donations',
  donors_by_country: 'donor_count',
  campaign_summary: 'total_donations',
};

export default function PredefinedReportViewPage() {
  const params = useParams();
  const type = params?.type as string;
  const { user } = useAuthStore();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [rows, setRows] = useState<{ label: string; value: number }[]>([]);
  const [summary, setSummary] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const definition = PREDEFINED_REPORT_TYPES.find((r) => r.type === type);
  const metricLabel = definition ? PREDEFINED_METRICS[definition.type as PredefinedReportType] : 'total_donations';

  useEffect(() => {
    if (!type || !activeOrganization?.id) {
      setLoading(false);
      return;
    }
    const validTypes = PREDEFINED_REPORT_TYPES.map((r) => r.type);
    if (!validTypes.includes(type as PredefinedReportType)) {
      setError('Type de rapport inconnu');
      setLoading(false);
      return;
    }
    let cancelled = false;
    getPredefinedReportData(type as PredefinedReportType, activeOrganization.id).then((res) => {
      if (cancelled) return;
      if (res.error) setError(res.error);
      else {
        setError(null);
        setRows(res.rows ?? []);
        setSummary(res.summary);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [type, activeOrganization?.id]);

  if (!definition) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-red-400">Rapport prédéfini introuvable.</p>
          <Link href="/dashboard/rapports" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour aux rapports
          </Link>
        </div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary,#3B82F6)]" />
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
          <span className="text-white truncate">{definition.label}</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <ExportButtons
            title={definition.label}
            description={definition.description}
            rows={rows}
            summary={summary}
            metricLabel={metricLabel}
          />
          {user?.id && (
            <>
              <Button
                type="button"
                variant="outline"
                className="inline-flex items-center gap-2"
                onClick={() => setScheduleModalOpen(true)}
              >
                <CalendarClock className="h-4 w-4" />
                Planifier
              </Button>
              <ScheduleReportModal
                isOpen={scheduleModalOpen}
                onClose={() => setScheduleModalOpen(false)}
                predefinedReportType={type}
                reportName={definition.label}
                userId={user.id}
              />
            </>
          )}
        </div>

        <ReportView
          title={definition.label}
          description={definition.description}
          rows={rows}
          summary={summary}
          metricLabel={metricLabel}
          error={error ?? undefined}
        />
      </div>
    </div>
  );
}
