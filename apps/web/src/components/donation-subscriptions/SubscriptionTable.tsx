'use client';

/**
 * SubscriptionTable - Étape 2.2.4
 * Table pour lister les abonnements (dons récurrents).
 */

import { Link } from '@/i18n/routing';
import { SubscriptionActions } from './SubscriptionActions';
import { FREQUENCY_LABELS, STATUS_LABELS, type DonationSubscription } from './types';

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(amount);
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export interface SubscriptionTableProps {
  subscriptions: DonationSubscription[];
  onPaused?: () => void;
  onResumed?: () => void;
  onCancelled?: () => void;
  onError?: (message: string) => void;
  showDonatorLink?: boolean;
  emptyMessage?: string;
}

export function SubscriptionTable({
  subscriptions,
  onPaused,
  onResumed,
  onCancelled,
  onError,
  showDonatorLink = true,
  emptyMessage = 'Aucun abonnement pour le moment.',
}: SubscriptionTableProps) {
  if (subscriptions.length === 0) {
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
              Donateur / Formulaire
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Montant
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Fréquence
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Prochain prélèvement
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-secondary,#A0A0B0)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-white/5">
              <td className="px-4 py-3">
                <div>
                  {showDonatorLink ? (
                    <Link
                      href={`/dashboard/donateurs/${sub.donatorId}`}
                      className="font-medium text-[var(--text-primary,#fff)] hover:underline"
                    >
                      {sub.donatorName}
                    </Link>
                  ) : (
                    <span className="font-medium text-[var(--text-primary,#fff)]">
                      {sub.donatorName}
                    </span>
                  )}
                  <p className="text-xs text-[var(--text-secondary,#A0A0B0)]">
                    {sub.formTitle}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--text-primary,#fff)]">
                {formatCurrency(sub.amount, sub.currency)}
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary,#A0A0B0)]">
                {FREQUENCY_LABELS[sub.frequency] ?? sub.frequency}
              </td>
              <td className="px-4 py-3">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  data-status={sub.status}
                  style={{
                    backgroundColor:
                      sub.status === 'ACTIVE'
                        ? 'rgba(34,197,94,0.2)'
                        : sub.status === 'PAUSED'
                          ? 'rgba(234,179,8,0.2)'
                          : 'rgba(156,163,175,0.2)',
                    color:
                      sub.status === 'ACTIVE'
                        ? 'rgb(74,222,128)'
                        : sub.status === 'PAUSED'
                          ? 'rgb(250,204,21)'
                          : 'rgb(156,163,175)',
                  }}
                >
                  {STATUS_LABELS[sub.status] ?? sub.status}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary,#A0A0B0)]">
                {formatDate(sub.nextPaymentDate)}
              </td>
              <td className="px-4 py-3 text-right">
                <SubscriptionActions
                  subscription={sub}
                  onPaused={onPaused}
                  onResumed={onResumed}
                  onCancelled={onCancelled}
                  onError={onError}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
