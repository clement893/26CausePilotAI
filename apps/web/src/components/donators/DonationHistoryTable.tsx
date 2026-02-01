'use client';

/**
 * DonationHistoryTable - Étape 1.2.2
 * Table : Date, Campagne, Montant, Méthode, Statut, Reçu, Actions.
 */

import { useState } from 'react';
import { Download, MoreVertical, Eye, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import type { Donation } from '@modele/types';

function formatCurrency(amount: string, currency = 'CAD'): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(parseFloat(amount || '0'));
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusLabels: Record<string, string> = {
  completed: 'Complété',
  pending: 'En attente',
  failed: 'Échoué',
  refunded: 'Remboursé',
  cancelled: 'Annulé',
};

const statusClasses: Record<string, string> = {
  completed: 'bg-green-600/20 text-green-400',
  pending: 'bg-yellow-600/20 text-yellow-400',
  failed: 'bg-red-600/20 text-red-400',
  refunded: 'bg-gray-600/20 text-gray-400',
  cancelled: 'bg-gray-600/20 text-gray-400',
};

export interface DonationHistoryTableProps {
  donations: Donation[];
  onViewDetails?: (donation: Donation) => void;
  onRefund?: (donation: Donation) => void;
  onDownloadReceipt?: (donation: Donation) => void;
  emptyMessage?: string;
}

export function DonationHistoryTable({
  donations,
  onViewDetails,
  onRefund,
  onDownloadReceipt,
  emptyMessage = "Ce donateur n'a pas encore effectué de don. Invitez-le à contribuer !",
}: DonationHistoryTableProps) {
  const [menuId, setMenuId] = useState<string | null>(null);

  if (donations.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
        <p className="text-[var(--text-secondary,#A0A0B0)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)]">
      <table className="w-full">
        <thead className="bg-[var(--background-tertiary,#1C1C26)]">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Campagne
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Montant
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Méthode
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Reçu
            </th>
            <th className="w-12 px-4 py-3 text-right text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {donations.map((d) => (
            <tr key={d.id} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-sm text-[var(--text-primary,#FFF)]">
                {formatDate(d.payment_date || d.created_at)}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-secondary,#A0A0B0)]">
                {(d as { campaign_name?: string }).campaign_name ?? d.campaign_id ?? '—'}
              </td>
              <td className="px-4 py-3 font-medium text-[var(--text-primary,#FFF)]">
                {formatCurrency(d.amount, d.currency)}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-secondary,#A0A0B0)] capitalize">
                {(d as { payment_method?: string }).payment_method ?? d.donation_type?.replace('_', ' ') ?? '—'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={clsx(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    statusClasses[d.payment_status] ?? 'bg-gray-600/20 text-gray-400'
                  )}
                >
                  {statusLabels[d.payment_status] ?? d.payment_status}
                </span>
              </td>
              <td className="px-4 py-3">
                {d.receipt_sent ? (
                  <button
                    type="button"
                    onClick={() => onDownloadReceipt?.(d)}
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--color-info,#3B82F6)] hover:underline"
                  >
                    <Download className="h-4 w-4" /> Télécharger PDF
                  </button>
                ) : (
                  <span className="text-sm text-[var(--text-tertiary,#6B6B7B)]">Non envoyé</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setMenuId(menuId === d.id ? null : d.id)}
                    className="rounded p-2 text-[var(--text-tertiary,#6B6B7B)] hover:bg-white/10 hover:text-white"
                    aria-label="Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuId === d.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} aria-hidden />
                      <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] py-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => { onViewDetails?.(d); setMenuId(null); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" /> Voir détails
                        </button>
                        {d.payment_status === 'completed' && (
                          <button
                            type="button"
                            onClick={() => { onRefund?.(d); setMenuId(null); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10"
                          >
                            <RotateCcw className="h-4 w-4" /> Émettre remboursement
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
