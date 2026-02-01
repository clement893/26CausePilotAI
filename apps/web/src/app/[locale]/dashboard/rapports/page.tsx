'use client';

/**
 * Liste des rapports - Étape 4.2.1 + 4.2.2
 * Rapports prédéfinis (4.2.2) et mes rapports personnalisés (4.2.1).
 */

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store';
import { listReportsAction, type ReportListItem } from '@/app/actions/reports/listReports';
import { PredefinedReportsList } from '@/components/reports';
import { Button, Card } from '@/components/ui';
import { ChevronRight, FileText, Loader2, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function RapportsListPage() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    listReportsAction(user.id).then((res) => {
      if (cancelled) return;
      if (res.error) setError(res.error);
      else if (res.reports) setReports(res.reports);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Connectez-vous pour accéder aux rapports.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Rapports</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Rapports</h1>
            <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mt-1">
              Rapports prédéfinis et rapports personnalisés (métriques, dimensions, période).
            </p>
          </div>
          <Link href="/dashboard/rapports/new">
            <Button className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouveau rapport
            </Button>
          </Link>
        </div>

        {/* Rapports prédéfinis - Étape 4.2.2 */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">Rapports prédéfinis</h2>
          <PredefinedReportsList />
        </section>

        {/* Mes rapports - Étape 4.2.1 */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Mes rapports</h2>
        </section>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary,#3B82F6)]" />
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-[var(--text-secondary,#A0A0B0)] mb-4">
                  Aucun rapport pour le moment.
                </p>
                <Link href="/dashboard/rapports/new">
                  <Button>Créer un rapport</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {reports.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/rapports/${r.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-[var(--color-primary,#3B82F6)] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">{r.name}</p>
                        {r.description && (
                          <p className="text-sm text-gray-500 truncate">{r.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(r.createdAt)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-500 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
