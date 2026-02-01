'use client';

/**
 * Page Liste des segments (audiences) - Étape 3.2.1
 */

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { listAudiencesAction } from '@/app/actions/audiences/list';
import { ChevronRight, Plus, Users, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SegmentsPage() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [audiences, setAudiences] = useState<{ id: string; name: string; description: string | null; type: string; donatorCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrganization) return;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await listAudiencesAction(activeOrganization.id);
      if (res.error) setError(res.error);
      else if (res.audiences) setAudiences(res.audiences);
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
          <span className="text-white">Segments</span>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Segments (audiences)</h1>
          <Link
            href="/dashboard/marketing/segments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Nouveau segment
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
        ) : audiences.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-[var(--text-secondary,#A0A0B0)] mb-4" />
            <p className="text-[var(--text-secondary,#A0A0B0)] mb-4">Aucun segment pour le moment.</p>
            <Link
              href="/dashboard/marketing/segments/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Créer un segment
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {audiences.map((a) => (
              <li key={a.id}>
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 text-left">
                  <Users className="h-8 w-8 shrink-0 text-[var(--text-secondary,#A0A0B0)]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{a.name}</p>
                    {a.description && (
                      <p className="text-sm text-[var(--text-secondary,#A0A0B0)] truncate">{a.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-[var(--text-secondary,#A0A0B0)]">
                    {a.type === 'DYNAMIC' ? 'Dynamique' : 'Statique'} · {a.donatorCount} contact(s)
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
