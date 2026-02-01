'use client';

/**
 * Page Liste des segments (audiences) - Étape 3.2.2
 * Header total, table (Nom, Type, Nombre de donateurs, Créé le, Actions), filtres par type, pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { getSegmentsAction } from '@/app/actions/segments/list';
import { deleteSegmentAction } from '@/app/actions/segments/delete';
import { refreshSegmentAction } from '@/app/actions/segments/refresh';
import type { SegmentRow, SegmentTypeFilter } from '@/app/actions/segments/list';
import { ChevronRight, Plus, Users, Loader2, RefreshCw, Trash2 } from 'lucide-react';

const PAGE_SIZE = 10;

export const dynamic = 'force-dynamic';

export default function SegmentsPage() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [segments, setSegments] = useState<SegmentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<SegmentTypeFilter>('');
  const [page, setPage] = useState(0);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<SegmentRow | null>(null);

  const fetchSegments = useCallback(async () => {
    if (!activeOrganization) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSegmentsAction(activeOrganization.id, {
        type: typeFilter || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (res.error) {
        setError(res.error);
        setSegments([]);
        setTotal(0);
      } else {
        setSegments(res.segments ?? []);
        setTotal(res.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, typeFilter, page]);

  useEffect(() => {
    if (!activeOrganization) return;
    fetchSegments();
  }, [activeOrganization, fetchSegments]);

  const handleRefresh = async (segment: SegmentRow) => {
    if (!activeOrganization || segment.type !== 'DYNAMIC') return;
    setRefreshingId(segment.id);
    setError(null);
    try {
      const res = await refreshSegmentAction(segment.id, activeOrganization.id);
      if (res.error) setError(res.error);
      else fetchSegments();
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDeleteClick = (segment: SegmentRow) => {
    setConfirmDelete(segment);
  };

  const handleDeleteConfirm = async () => {
    if (!activeOrganization || !confirmDelete) return;
    setDeletingId(confirmDelete.id);
    setError(null);
    try {
      const res = await deleteSegmentAction(confirmDelete.id, activeOrganization.id);
      if (res.error) setError(res.error);
      else {
        setConfirmDelete(null);
        fetchSegments();
      }
    } finally {
      setDeletingId(null);
    }
  };

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

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Segments (audiences)</h1>
            <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mt-1">
              {total} segment{total !== 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            href="/dashboard/marketing/segments/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Créer un segment
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as SegmentTypeFilter);
              setPage(0);
            }}
            className="rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-3 py-2 text-sm text-white"
          >
            <option value="">Tous les types</option>
            <option value="STATIC">Statique</option>
            <option value="DYNAMIC">Dynamique</option>
          </select>
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
        ) : segments.length === 0 ? (
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
          <>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Nom</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Type</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Nombre de donateurs</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Créé le</th>
                    <th className="p-3 font-medium text-[var(--text-secondary,#A0A0B0)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        <p className="font-medium text-white truncate max-w-[200px]">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-[var(--text-secondary,#A0A0B0)] truncate max-w-[200px]">{s.description}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-white/10 text-[var(--text-secondary,#A0A0B0)]">
                          {s.type === 'DYNAMIC' ? 'Dynamique' : 'Statique'}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--text-secondary,#A0A0B0)]">
                        {s.donatorCount != null ? `${s.donatorCount} contact(s)` : '—'}
                      </td>
                      <td className="p-3 text-[var(--text-secondary,#A0A0B0)]">
                        {new Date(s.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {s.type === 'DYNAMIC' && (
                            <button
                              type="button"
                              disabled={refreshingId === s.id}
                              onClick={() => handleRefresh(s)}
                              className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-xs text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5 disabled:opacity-50"
                              title="Recalculer le nombre de donateurs"
                            >
                              {refreshingId === s.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              Rafraîchir
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={deletingId === s.id}
                            onClick={() => handleDeleteClick(s)}
                            className="inline-flex items-center gap-1 rounded border border-red-500/30 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                            title="Supprimer le segment"
                          >
                            {deletingId === s.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Supprimer
                          </button>
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

        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setConfirmDelete(null)}>
            <div
              className="max-w-sm w-full rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white font-medium mb-2">Supprimer le segment ?</p>
              <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-4">
                « {confirmDelete.name} » sera définitivement supprimé.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deletingId === confirmDelete.id}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === confirmDelete.id ? <Loader2 className="w-4 h-4 animate-spin inline" /> : null}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
