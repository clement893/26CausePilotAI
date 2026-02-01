'use client';

/**
 * Liste des templates email - Étape 3.1.2
 * Page: /dashboard/marketing/templates
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { listEmailTemplatesAction } from '@/app/actions/email-templates/list';
import { createEmailTemplateAction } from '@/app/actions/email-templates/create';
import { ChevronRight, Plus, Mail, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MarketingTemplatesPage() {
  const router = useRouter();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrganization) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await listEmailTemplatesAction(activeOrganization.id);
      if (cancelled) return;
      if (res.error) setError(res.error);
      else if (res.templates) setTemplates(res.templates);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [activeOrganization?.id]);

  const handleCreate = async () => {
    if (!activeOrganization) return;
    setCreating(true);
    setError(null);
    const res = await createEmailTemplateAction(activeOrganization.id, 'Nouveau template');
    setCreating(false);
    if (res.error) setError(res.error);
    else if (res.id) router.push(`/dashboard/marketing/templates/${res.id}/edit`);
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-64 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Aucune organisation active</p>
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
          <span className="text-white">Templates email</span>
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Templates email</h1>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Nouveau template
          </button>
        </div>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}
        {loading ? (
          <div className="h-64 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary,#A0A0B0)]" />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-[var(--text-secondary,#A0A0B0)] mb-4" />
            <p className="text-[var(--text-secondary,#A0A0B0)] mb-4">Aucun template pour le moment.</p>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Créer un template
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {templates.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/marketing/templates/${t.id}/edit`}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/5"
                >
                  <Mail className="h-8 w-8 shrink-0 text-[var(--text-secondary,#A0A0B0)]" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{t.name}</p>
                    {t.description && (
                      <p className="text-sm text-[var(--text-secondary,#A0A0B0)] truncate">{t.description}</p>
                    )}
                  </div>
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
