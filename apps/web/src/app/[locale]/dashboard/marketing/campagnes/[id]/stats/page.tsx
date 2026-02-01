'use client';

/**
 * Page Statistiques de campagne email - Étape 3.1.3
 * Graphiques ouvertures/clics, carte des clics (placeholder), liste donateurs ouverts/clics
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { getCampaignStatsAction } from '@/app/actions/email-campaigns/get-stats';
import type { CampaignStatsResult } from '@/app/actions/email-campaigns/get-stats';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChevronRight, Loader2, Mail, MousePointer, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function CampaignStatsPage() {
  const params = useParams();
  const campaignId = params?.id as string;
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [stats, setStats] = useState<CampaignStatsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId || !activeOrganization) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getCampaignStatsAction(campaignId, activeOrganization.id);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        setStats(null);
      } else if (res.stats) {
        setStats(res.stats);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [campaignId, activeOrganization?.id]);

  if (orgLoading || !activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-64 animate-pulse rounded bg-white/10 mb-6" />
          <div className="h-96 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || (!loading && !stats)) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-red-400">{error ?? 'Campagne introuvable'}</p>
          <Link href="/dashboard/marketing/campagnes" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour aux campagnes
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary,#A0A0B0)]" />
        </div>
      </div>
    );
  }

  const chartData = stats.opensByDay.map((o, i) => ({
    date: o.date.slice(5),
    ouvertures: o.count,
    clics: stats.clicksByDay[i]?.count ?? 0,
  }));

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/marketing/campagnes" className="hover:text-white">Campagnes email</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{stats.name}</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-2">Statistiques</h1>
        <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-6">{stats.subject}</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
            <div className="flex items-center gap-2 text-[var(--text-secondary,#A0A0B0)] text-sm mb-1">
              <Mail className="w-4 h-4" /> Envoyés
            </div>
            <p className="text-xl font-bold text-white">{stats.sent}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
            <div className="flex items-center gap-2 text-[var(--text-secondary,#A0A0B0)] text-sm mb-1">
              Ouvertures
            </div>
            <p className="text-xl font-bold text-white">{stats.opened} ({stats.openRate}%)</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
            <div className="flex items-center gap-2 text-[var(--text-secondary,#A0A0B0)] text-sm mb-1">
              <MousePointer className="w-4 h-4" /> Clics
            </div>
            <p className="text-xl font-bold text-white">{stats.clicked} ({stats.clickRate}%)</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
            <div className="flex items-center gap-2 text-[var(--text-secondary,#A0A0B0)] text-sm mb-1">
              Envoyé le
            </div>
            <p className="text-lg font-bold text-white">
              {stats.sentAt ? new Date(stats.sentAt).toLocaleDateString('fr-FR') : '-'}
            </p>
          </div>
        </div>

        {/* Graphiques évolution */}
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6 mb-8">
          <h2 className="font-medium text-white mb-4">Évolution des ouvertures et clics</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background-secondary,#13131A)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="ouvertures" stroke="#3B82F6" strokeWidth={2} name="Ouvertures" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="clics" stroke="#10B981" strokeWidth={2} name="Clics" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carte des clics (heatmap placeholder) */}
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6 mb-8">
          <h2 className="font-medium text-white mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Carte des clics
          </h2>
          <div className="h-48 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-[var(--text-secondary,#A0A0B0)] text-sm">
            Heatmap des zones cliquées (à brancher sur les données de tracking)
          </div>
        </div>

        {/* Liste des donateurs ouverts / cliqués */}
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
          <h2 className="font-medium text-white mb-4">Destinataires (ouvert / cliqué)</h2>
          {stats.recipients.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">Aucun destinataire enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Email</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Nom</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Ouvert</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Cliqué</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recipients.map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="p-3 text-white">{r.email}</td>
                      <td className="p-3 text-[var(--text-secondary,#A0A0B0)]">
                        {[r.firstName, r.lastName].filter(Boolean).join(' ') || '-'}
                      </td>
                      <td className="p-3">{r.opened ? 'Oui' : 'Non'}</td>
                      <td className="p-3">{r.clicked ? 'Oui' : 'Non'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
