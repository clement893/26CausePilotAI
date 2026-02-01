'use client';

/**
 * Liste des campagnes email - Étape 3.1.3
 * KPIs, table, filtres par statut, pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { listEmailCampaignsAction } from '@/app/actions/email-campaigns/list';
import { sendEmailCampaignAction } from '@/app/actions/email-campaigns/send';
import type { CampaignRow, CampaignStatus } from '@/app/actions/email-campaigns/list';
import { ChevronRight, Plus, RefreshCw, BarChart3, Mail, MousePointer, Loader2 } from 'lucide-react';

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Brouillon',
  SCHEDULED: 'Planifiée',
  SENDING: 'Envoi en cours',
  SENT: 'Envoyée',
  CANCELED: 'Annulée',
};

const PAGE_SIZE = 10;

export default function CampagnesContent() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [total, setTotal] = useState(0);
  const [kpis, setKpis] = useState({ totalCampaigns: 0, avgOpenRate: 0, avgClickRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [page, setPage] = useState(0);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!activeOrganization) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listEmailCampaignsAction(activeOrganization.id, {
        status: statusFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (result.error) {
        setError(result.error);
        setCampaigns([]);
        setTotal(0);
      } else {
        setCampaigns(result.campaigns ?? []);
        setTotal(result.total ?? 0);
        if (result.kpis) setKpis(result.kpis);
      }
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, statusFilter, page]);

  useEffect(() => {
    if (!activeOrganization) return;
    fetchCampaigns();
  }, [activeOrganization, fetchCampaigns]);

  const handleSend = async (id: string) => {
    if (!activeOrganization) return;
    setSendingId(id);
    setError(null);
    try {
      const result = await sendEmailCampaignAction(id, activeOrganization.id);
      if (result.error) setError(result.error);
      else fetchCampaigns();
    } finally {
      setSendingId(null);
    }
  };

  if (orgLoading || !activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-64 animate-pulse rounded-xl bg-white/10" />
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
          <Link href="/dashboard/marketing/templates" className="hover:text-white">Marketing</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Campagnes email</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Campagnes email</h1>
          <Link
            href="/dashboard/marketing/campagnes/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Créer une campagne
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
            <div className="flex items-center gap-2 text-[var(--text-secondary,#A0A0B0)] text-sm mb-1">
              <BarChart3 className="w-4 h-4" /> Total campagnes
            </div>
            <p className="text-2xl font-bold text-white">{kpis.totalCampaigns}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
            <div className="flex items-center gap-2 text-[var(--text-secondary,#A0A0B0)] text-sm mb-1">
              <Mail className="w-4 h-4" /> Taux d&apos;ouverture moyen
            </div>
            <p className="text-2xl font-bold text-white">{kpis.avgOpenRate}%</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
            <div className="flex items-center gap-2 text-[var(--text-secondary,#A0A0B0)] text-sm mb-1">
              <MousePointer className="w-4 h-4" /> Taux de clics moyen
            </div>
            <p className="text-2xl font-bold text-white">{kpis.avgClickRate}%</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter((e.target.value || '') as CampaignStatus | ''); setPage(0); }}
            className="rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-3 py-2 text-sm text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="DRAFT">Brouillon</option>
            <option value="SCHEDULED">Planifiée</option>
            <option value="SENDING">Envoi en cours</option>
            <option value="SENT">Envoyée</option>
            <option value="CANCELED">Annulée</option>
          </select>
          <button
            type="button"
            onClick={() => fetchCampaigns()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" /> Rafraîchir
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-4">
          {total} campagne(s) au total
        </p>

        {loading ? (
          <div className="h-64 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary,#A0A0B0)]" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-[var(--text-secondary,#A0A0B0)] mb-4" />
            <p className="text-[var(--text-secondary,#A0A0B0)] mb-4">Aucune campagne pour le moment.</p>
            <Link
              href="/dashboard/marketing/campagnes/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Créer une campagne
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Nom</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Statut</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Audience</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Envoyé le</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Ouvertures</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Clics</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-white">{c.name}</td>
                      <td className="p-3">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-white/10 text-[var(--text-secondary,#A0A0B0)]">
                          {STATUS_LABELS[c.status]}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--text-secondary,#A0A0B0)]">{c.audienceName}</td>
                      <td className="p-3 text-[var(--text-secondary,#A0A0B0)]">
                        {c.sentAt ? new Date(c.sentAt).toLocaleDateString('fr-FR') : c.scheduledAt ? `Planifié: ${new Date(c.scheduledAt).toLocaleString('fr-FR')}` : '-'}
                      </td>
                      <td className="p-3 text-[var(--text-secondary,#A0A0B0)]">{c.sent > 0 ? `${c.opened} (${c.openRate}%)` : '-'}</td>
                      <td className="p-3 text-[var(--text-secondary,#A0A0B0)]">{c.sent > 0 ? `${c.clicked} (${c.clickRate}%)` : '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/marketing/campagnes/${c.id}/stats`}
                            className="text-[var(--color-primary,#3B82F6)] hover:underline text-sm"
                          >
                            Stats
                          </Link>
                          {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                            <button
                              type="button"
                              disabled={sendingId === c.id}
                              onClick={() => handleSend(c.id)}
                              className="text-[var(--color-primary,#3B82F6)] hover:underline text-sm disabled:opacity-50"
                            >
                              {sendingId === c.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Envoyer'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">
                  Page {page + 1} / {Math.ceil(total / PAGE_SIZE)}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white disabled:opacity-50 hover:bg-white/5"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    disabled={(page + 1) * PAGE_SIZE >= total}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white disabled:opacity-50 hover:bg-white/5"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
