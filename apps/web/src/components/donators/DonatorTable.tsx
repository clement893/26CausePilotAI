'use client';

/**
 * DonatorTable - Étape 1.2.1
 * Table : checkbox, avatar+nom, email, téléphone, segment, total dons, nb dons, dernier don, score, actions.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Mail,
  Phone,
  MoreVertical,
  Eye,
  Pencil,
  MailPlus,
  StickyNote,
  Star,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Donor } from '@modele/types';
import { DonatorAvatar } from './DonatorAvatar';
import { SegmentBadge } from './SegmentBadge';
import { ScoreBar } from './ScoreBar';
import type { DonatorSegment } from './SegmentBadge';

function getDisplayName(d: Donor): string {
  if (d.first_name || d.last_name) return `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim();
  return d.email;
}

function getSegment(d: Donor): DonatorSegment {
  const tags = d.tags ?? [];
  if (tags.some((t) => String(t).toLowerCase() === 'vip')) return 'VIP';
  const total = parseFloat(d.total_donated ?? '0');
  if (total >= 5000) return 'VIP';
  const created = d.created_at ? new Date(d.created_at).getTime() : 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (created >= thirtyDaysAgo) return 'New';
  if (!d.is_active) return 'Inactive';
  return 'Active';
}

function getScore(d: Donor): number {
  const count = d.donation_count ?? 0;
  const total = parseFloat(d.total_donated ?? '0');
  let score = Math.min(50, count * 5);
  if (total >= 10000) score += 30;
  else if (total >= 1000) score += 20;
  else if (total >= 100) score += 10;
  return Math.min(100, score);
}

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(
    parseFloat(amount || '0')
  );
}

function formatRelative(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays < 1) return "aujourd'hui";
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
    if (diffDays < 365) return `il y a ${Math.floor(diffDays / 30)} mois`;
    return `il y a ${Math.floor(diffDays / 365)} an(s)`;
  } catch {
    return dateStr;
  }
}

export interface DonatorTableProps {
  donators: Donor[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSort: (column: string, order: 'asc' | 'desc') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSelect: (donatorIds: string[]) => void;
  selectedIds: string[];
  isLoading?: boolean;
  basePath?: string;
}

const LIMIT_OPTIONS = [10, 25, 50, 100, 500];

export function DonatorTable({
  donators,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onSort,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSelect,
  selectedIds,
  isLoading = false,
  basePath = '/dashboard/donateurs',
}: DonatorTableProps) {
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const allSelected =
    donators.length > 0 && donators.every((d) => selectedIds.includes(d.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      onSelect([]);
    } else {
      onSelect(donators.map((d) => d.id));
    }
  };
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelect(selectedIds.filter((x) => x !== id));
    } else {
      onSelect([...selectedIds, id]);
    }
  };

  const SortHeader = ({
    column,
    label,
  }: {
    column: string;
    label: string;
  }) => (
    <th
      className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)] hover:text-white"
      onClick={() =>
        onSort(column, sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc')
      }
    >
      <div className="flex items-center gap-1">
        {label}
        {sortBy !== column ? (
          <ChevronsUpDown className="h-4 w-4" />
        ) : sortOrder === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)]">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-[var(--background-tertiary,#1C1C26)]">
            <tr>
              <th className="w-12 px-4 py-3" />
              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
                Nom
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Segment</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Dons</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Dernier don</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-3">
                  <div className="h-4 w-4 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-8 w-32 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-24 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 w-16 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-8 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-2 w-16 rounded bg-white/10" />
                </td>
                <td className="px-4 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (donators.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
        <p className="text-[var(--text-secondary,#A0A0B0)]">
          Aucun donateur trouvé. Essayez d&apos;autres filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)]">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-[var(--background-tertiary,#1C1C26)]">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="rounded border-white/20 bg-[var(--background-tertiary,#1C1C26)]"
                aria-label="Tout sélectionner"
              />
            </th>
            <SortHeader column="last_name" label="Nom" />
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Contact
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Segment
            </th>
            <SortHeader column="total_donated" label="Total dons" />
            <SortHeader column="donation_count" label="Nb dons" />
            <SortHeader column="last_donation_date" label="Dernier don" />
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Score
            </th>
            <th className="w-12 px-4 py-3 text-right text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {donators.map((d, i) => (
            <tr
              key={d.id}
              className={clsx(
                'transition-colors hover:bg-white/5',
                i % 2 === 1 && 'bg-white/[0.02]'
              )}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(d.id)}
                  onChange={() => toggleSelect(d.id)}
                  className="rounded border-white/20 bg-[var(--background-tertiary,#1C1C26)]"
                  aria-label={`Sélectionner ${getDisplayName(d)}`}
                />
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`${basePath}/${d.id}`}
                  className="flex items-center gap-3 hover:opacity-90"
                >
                  <DonatorAvatar donor={d} size="md" />
                  <span className="font-medium text-white">{getDisplayName(d)}</span>
                </Link>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-sm text-[var(--text-primary,#FFF)]">
                    {d.opt_in_email && <Mail className="h-3.5 w-3.5 text-green-500" />}
                    {d.email}
                  </span>
                  {d.phone && (
                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary,#A0A0B0)]">
                      {d.opt_in_sms && <Phone className="h-3 w-3 text-green-500" />}
                      {d.phone}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <SegmentBadge segment={getSegment(d)} />
              </td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary,#FFF)]">
                {formatCurrency(d.total_donated)}
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary,#A0A0B0)]">
                {d.donation_count ?? 0}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-secondary,#A0A0B0)]">
                {formatRelative(d.last_donation_date)}
              </td>
              <td className="px-4 py-3 w-28">
                <ScoreBar score={getScore(d)} showLabel />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() =>
                      setActionMenuId(actionMenuId === d.id ? null : d.id)
                    }
                    className="rounded p-2 text-[var(--text-tertiary,#6B6B7B)] hover:bg-white/10 hover:text-white"
                    aria-label="Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {actionMenuId === d.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActionMenuId(null)}
                        aria-hidden
                      />
                      <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] py-1 shadow-xl">
                        <Link
                          href={`${basePath}/${d.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                          onClick={() => setActionMenuId(null)}
                        >
                          <Eye className="h-4 w-4" /> Voir le profil
                        </Link>
                        <Link
                          href={`${basePath}/${d.id}/edit`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                          onClick={() => setActionMenuId(null)}
                        >
                          <Pencil className="h-4 w-4" /> Modifier
                        </Link>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                        >
                          <MailPlus className="h-4 w-4" /> Envoyer un email
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                        >
                          <StickyNote className="h-4 w-4" /> Ajouter une note
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                        >
                          <Star className="h-4 w-4" /> Marquer comme VIP
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                        >
                          <UserX className="h-4 w-4" /> Désactiver
                        </button>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" /> Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex flex-col gap-4 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">
          Affichage de {start} à {end} sur {total.toLocaleString('fr-FR')} donateurs
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">Par page :</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-2 py-1 text-sm text-white"
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              className="rounded p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Première page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm text-[var(--text-primary,#FFF)]">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="rounded p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Dernière page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
