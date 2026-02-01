'use client';

/**
 * Gestion des abonnements (dons récurrents) - Étape 2.2.4
 * Interface admin : liste des abonnements de l’organisation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { listSubscriptionsAction } from '@/app/actions/subscriptions/list';
import { SubscriptionTable } from '@/components/donation-subscriptions';
import type { DonationSubscription } from '@/components/donation-subscriptions';
import { Container, Card, LoadingSkeleton, useToast } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

export default function AbonnementsContent() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { error: showError } = useToast();
  const [subscriptions, setSubscriptions] = useState<DonationSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchSubscriptions = useCallback(async () => {
    if (!activeOrganization) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listSubscriptionsAction(activeOrganization.id, {
        status: statusFilter || undefined,
      });
      if (result.error) {
        setError(result.error);
        setSubscriptions([]);
      } else {
        setSubscriptions(result.subscriptions);
      }
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, statusFilter]);

  useEffect(() => {
    if (!activeOrganization) return;
    fetchSubscriptions();
  }, [activeOrganization, fetchSubscriptions]);

  if (orgLoading || !activeOrganization) {
    return (
      <Container className="py-8">
        <LoadingSkeleton className="h-64 rounded-xl" />
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary,#fff)]">
          Abonnements (dons récurrents)
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-3 py-2 text-sm text-[var(--text-primary,#fff)]"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="PAUSED">En pause</option>
            <option value="CANCELLED">Annulé</option>
            <option value="EXPIRED">Expiré</option>
          </select>
          <button
            type="button"
            onClick={() => fetchSubscriptions()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-sm text-[var(--text-primary,#fff)] hover:bg-white/10"
            aria-label="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <Card variant="glass" className="mb-6 border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {loading ? (
        <LoadingSkeleton className="h-64 rounded-xl" />
      ) : (
        <SubscriptionTable
          subscriptions={subscriptions}
          onPaused={fetchSubscriptions}
          onResumed={fetchSubscriptions}
          onCancelled={fetchSubscriptions}
          onError={(msg) => showError(msg)}
          showDonatorLink
          emptyMessage="Aucun abonnement pour le moment. Les dons récurrents apparaîtront ici après la première contribution."
        />
      )}
    </Container>
  );
}
