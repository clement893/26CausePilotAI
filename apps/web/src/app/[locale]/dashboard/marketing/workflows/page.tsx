'use client';

/**
 * Page Liste des workflows - Étape 3.3.2
 */

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { listWorkflowsAction } from '@/app/actions/workflows/list';
import { ChevronRight, Plus, GitBranch, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function WorkflowsPage() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [workflows, setWorkflows] = useState<{ id: string; name: string; status: string; createdAt: Date }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrganization) return;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await listWorkflowsAction(activeOrganization.id);
      if (res.error) setError(res.error);
      else if (res.workflows) setWorkflows(res.workflows);
      setLoading(false);
    })();
  }, [activeOrganization?.id]);

  if (orgLoading || !activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-8 w-64 animate-pulse rounded bg-white/10 mb-6" />
          <div className="h-64 animate-pulse rounded-xl bg-white/10" />
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
          <span className="text-white">Workflows</span>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Workflows (automatisation)</h1>
          <Link
            href="/dashboard/marketing/workflows/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Nouveau workflow
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="h-64 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary,#A0A0B0)]" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
            <GitBranch className="mx-auto h-12 w-12 text-[var(--text-secondary,#A0A0B0)] mb-4" />
            <p className="text-[var(--text-secondary,#A0A0B0)] mb-4">Aucun workflow pour le moment.</p>
            <Link
              href="/dashboard/marketing/workflows/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Créer un workflow
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {workflows.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/dashboard/marketing/workflows/${w.id}/edit`}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/5"
                >
                  <GitBranch className="h-8 w-8 shrink-0 text-[var(--text-secondary,#A0A0B0)]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{w.name}</p>
                    <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">
                      {new Date(w.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-[var(--text-secondary,#A0A0B0)]">
                    {w.status === 'ACTIVE' ? 'Actif' : 'Brouillon'}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--text-secondary,#A0A0B0)]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
