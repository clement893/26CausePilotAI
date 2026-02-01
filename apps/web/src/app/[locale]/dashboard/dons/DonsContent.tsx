'use client';

/**
 * Gestion des dons - Étape 2.2.5
 * Liste des dons avec bouton Rembourser et modal de confirmation.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { listDonationsAction } from '@/app/actions/donations/list';
import { refundDonationAction } from '@/app/actions/donations/refund';
import { DonationTable, RefundModal } from '@/components/donations';
import type { DonationRow } from '@/components/donations';
import { Container, LoadingSkeleton, useToast } from '@/components/ui';
import { RefreshCw } from 'lucide-react';

export default function DonsContent() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { error: showError, info } = useToast();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [refundDonation, setRefundDonation] = useState<DonationRow | null>(null);

  const fetchDonations = useCallback(async () => {
    if (!activeOrganization) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listDonationsAction(activeOrganization.id, {
        status: statusFilter || undefined,
        limit: 100,
      });
      if (result.error) {
        setError(result.error);
        setDonations([]);
        setTotal(0);
      } else {
        setDonations(result.donations);
        setTotal(result.total);
      }
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, statusFilter]);

  useEffect(() => {
    if (!activeOrganization) return;
    fetchDonations();
  }, [activeOrganization, fetchDonations]);

  const handleRefundClick = (donation: DonationRow) => {
    setRefundDonation(donation);
  };

  const handleRefundConfirm = async (options: {
    reason?: string;
    note?: string;
    amount?: number;
  }) => {
    if (!refundDonation) return;
    const result = await refundDonationAction(refundDonation.id, options);
    if (result.error) {
      showError(result.error);
      return;
    }
    info('Remboursement effectué.');
    setRefundDonation(null);
    fetchDonations();
  };

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
          Gestion des dons
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-3 py-2 text-sm text-[var(--text-primary,#fff)]"
          >
            <option value="">Tous les statuts</option>
            <option value="completed">Complété</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
          </select>
          <button
            type="button"
            onClick={() => fetchDonations()}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-sm text-[var(--text-primary,#fff)] hover:bg-white/10"
            aria-label="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-4">
        {total} don(s) au total
      </p>

      {loading ? (
        <LoadingSkeleton className="h-64 rounded-xl" />
      ) : (
        <DonationTable
          donations={donations}
          onRefund={handleRefundClick}
          showDonatorLink
          emptyMessage="Aucun don pour le moment."
        />
      )}

      {refundDonation && (
        <RefundModal
          isOpen={!!refundDonation}
          onClose={() => setRefundDonation(null)}
          onConfirm={handleRefundConfirm}
          donationAmount={refundDonation.amount}
          currency={refundDonation.currency}
          donationId={refundDonation.id}
          allowPartial
        />
      )}
    </Container>
  );
}
