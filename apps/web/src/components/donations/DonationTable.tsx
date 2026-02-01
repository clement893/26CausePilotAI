'use client';

/**
 * DonationTable - Étape 2.2.5
 * Table pour lister tous les dons avec statut et bouton Rembourser.
 */

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui';
import { RotateCcw } from 'lucide-react';

export interface DonationRow {
  id: string;
  donatorId: string;
  donatorEmail: string;
  donatorName: string;
  formId: string | null;
  formTitle: string | null;
  amount: number;
  currency: string;
  status: string;
  donatedAt: Date;
  canRefund: boolean;
  gateway: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Complété',
  pending: 'En attente',
  failed: 'Échoué',
  refunded: 'Remboursé',
};

const STATUS_CLASSES: Record<string, string> = {
  completed: 'bg-green-600/20 text-green-400',
  pending: 'bg-yellow-600/20 text-yellow-400',
  failed: 'bg-red-600/20 text-red-400',
  refunded: 'bg-gray-600/20 text-gray-400',
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(amount);
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface DonationTableProps {
  donations: DonationRow[];
  onRefund: (donation: DonationRow) => void;
  showDonatorLink?: boolean;
  emptyMessage?: string;
}

export function DonationTable({
  donations,
  onRefund,
  showDonatorLink = true,
  emptyMessage = 'Aucun don pour le moment.',
}: DonationTableProps) {
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
              Donateur / Formulaire
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Montant
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Statut
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {donations.map((d) => (
            <tr key={d.id} className="hover:bg-white/5">
              <td className="px-4 py-3 text-[var(--text-secondary,#A0A0B0)] text-sm">
                {formatDate(d.donatedAt)}
              </td>
              <td className="px-4 py-3">
                <div>
                  {showDonatorLink ? (
                    <Link
                      href={`/dashboard/base-donateur/donateurs/${d.donatorId}`}
                      className="font-medium text-[var(--text-primary,#fff)] hover:underline"
                    >
                      {d.donatorName}
                    </Link>
                  ) : (
                    <span className="font-medium text-[var(--text-primary,#fff)]">{d.donatorName}</span>
                  )}
                  {d.formTitle && (
                    <p className="text-xs text-[var(--text-secondary,#A0A0B0)]">{d.formTitle}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--text-primary,#fff)]">
                {formatCurrency(d.amount, d.currency)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[d.status] ?? 'bg-gray-600/20 text-gray-400'}`}
                >
                  {STATUS_LABELS[d.status] ?? d.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {d.canRefund && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRefund(d)}
                    aria-label="Rembourser"
                    className="text-amber-400 border-amber-400/50 hover:bg-amber-500/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Rembourser
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
