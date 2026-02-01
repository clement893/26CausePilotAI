'use client';

/**
 * Création d'un rapport - Étape 4.2.1
 * Configuration métriques, dimensions, période puis génération.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store';
import { createReportAction } from '@/app/actions/reports/createReport';
import { ReportBuilder } from '@/components/reports';
import type { ReportConfig } from '@/app/actions/reports/types';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewReportPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    name: string,
    description: string,
    config: ReportConfig
  ) => {
    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await createReportAction(user.id, name, config, description || undefined);
    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.reportId) {
      router.push(`/dashboard/rapports/${res.reportId}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Connectez-vous pour créer un rapport.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/rapports" className="hover:text-white">Rapports</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Nouveau rapport</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-2">Nouveau rapport</h1>
        <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-8">
          Choisissez la métrique, la dimension et la période pour générer le rapport.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <ReportBuilder onSubmit={handleSubmit} isSubmitting={submitting} />
      </div>
    </div>
  );
}
