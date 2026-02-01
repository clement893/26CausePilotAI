'use client';

/**
 * RefundModal - Étape 2.2.5
 * Modal de confirmation pour les remboursements.
 */

import { useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/components/ui';

export interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { reason?: string; note?: string; amount?: number }) => Promise<void>;
  donationAmount: number;
  currency: string;
  donationId: string;
  allowPartial?: boolean;
}

const REFUND_REASONS = [
  { value: 'requested_by_customer', label: 'Demande du donateur' },
  { value: 'duplicate', label: 'Doublon' },
  { value: 'fraudulent', label: 'Fraude' },
] as const;

export function RefundModal({
  isOpen,
  onClose,
  onConfirm,
  donationAmount,
  currency,
  allowPartial = false,
}: RefundModalProps) {
  const [reason, setReason] = useState<string>('requested_by_customer');
  const [note, setNote] = useState('');
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const amount =
        allowPartial && partialAmount.trim() ? parseFloat(partialAmount.replace(',', '.')) : undefined;
      if (amount != null && (isNaN(amount) || amount <= 0 || amount > donationAmount)) {
        setError('Montant partiel invalide');
        setLoading(false);
        return;
      }
      await onConfirm({
        reason,
        note: note.trim() || undefined,
        amount,
      });
      onClose();
      setNote('');
      setPartialAmount('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors du remboursement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmer le remboursement"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-[var(--text-secondary,#A0A0B0)]">
          Montant du don :{' '}
          <strong className="text-[var(--text-primary,#fff)]">
            {new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(donationAmount)}
          </strong>
        </p>

        {allowPartial && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-1">
              Remboursement partiel (optionnel)
            </label>
            <Input
              type="text"
              placeholder={donationAmount.toFixed(2)}
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              className="bg-[var(--background-secondary,#13131A)] border-white/10"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-1">
            Motif
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-3 py-2 text-sm text-[var(--text-primary,#fff)]"
          >
            {REFUND_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-1">
            Note (optionnel)
          </label>
          <Textarea
            placeholder="Détails supplémentaires..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="bg-[var(--background-secondary,#13131A)] border-white/10"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'En cours…' : 'Rembourser'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
