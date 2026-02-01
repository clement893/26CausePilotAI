'use client';

/**
 * SubscriptionCard - Étape 2.2.4
 * Carte pour afficher les détails d’un abonnement (don récurrent).
 */

import { Card } from '@/components/ui';
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

export interface SubscriptionCardProps {
  subscription: DonationSubscription;
  onPaused?: () => void;
  onResumed?: () => void;
  onCancelled?: () => void;
  onError?: (message: string) => void;
}

export function SubscriptionCard({
  subscription,
  onPaused,
  onResumed,
  onCancelled,
  onError,
}: SubscriptionCardProps) {
  const frequencyLabel = FREQUENCY_LABELS[subscription.frequency] ?? subscription.frequency;
  const statusLabel = STATUS_LABELS[subscription.status] ?? subscription.status;

  return (
    <Card variant="glass" className="border border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[var(--text-primary,#fff)]">
            {subscription.formTitle}
          </h3>
          <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mt-1">
            {subscription.donatorName} · {subscription.donatorEmail}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <span className="text-lg font-bold text-[var(--text-primary,#fff)]">
              {formatCurrency(subscription.amount, subscription.currency)}
            </span>
            <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">
              / {frequencyLabel}
            </span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              data-status={subscription.status}
              style={{
                backgroundColor:
                  subscription.status === 'ACTIVE'
                    ? 'rgba(34,197,94,0.2)'
                    : subscription.status === 'PAUSED'
                      ? 'rgba(234,179,8,0.2)'
                      : 'rgba(156,163,175,0.2)',
                color:
                  subscription.status === 'ACTIVE'
                    ? 'rgb(74,222,128)'
                    : subscription.status === 'PAUSED'
                      ? 'rgb(250,204,21)'
                      : 'rgb(156,163,175)',
              }}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary,#A0A0B0)] mt-2">
            Prochain prélèvement : {formatDate(subscription.nextPaymentDate)} ·{' '}
            {subscription.donationCount} don(s) effectué(s)
          </p>
        </div>
        <SubscriptionActions
          subscription={subscription}
          onPaused={onPaused}
          onResumed={onResumed}
          onCancelled={onCancelled}
          onError={onError}
        />
      </div>
    </Card>
  );
}
