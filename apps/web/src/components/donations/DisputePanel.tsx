'use client';

/**
 * DisputePanel - Étape 2.2.5
 * Panneau pour gérer un litige (chargeback) : saisie des preuves et soumission.
 */

import { useState } from 'react';
import { Card, Button, Textarea } from '@/components/ui';
import { handleDisputeAction } from '@/app/actions/donations/dispute';
import { AlertCircle } from 'lucide-react';

export interface DisputePanelProps {
  disputeId: string;
  onSubmitted?: () => void;
  onError?: (message: string) => void;
}

export function DisputePanel({
  disputeId,
  onSubmitted,
  onError,
}: DisputePanelProps) {
  const [customerCommunication, setCustomerCommunication] = useState('');
  const [uncategorizedText, setUncategorizedText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!uncategorizedText.trim()) {
      onError?.('Veuillez décrire les preuves ou la situation.');
      return;
    }
    setLoading(true);
    try {
      const result = await handleDisputeAction(disputeId, {
        customer_communication: customerCommunication.trim() || undefined,
        uncategorized_text: uncategorizedText.trim(),
      });
      if (result.error) {
        onError?.(result.error);
        return;
      }
      onSubmitted?.();
      setCustomerCommunication('');
      setUncategorizedText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" className="border-amber-500/30">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-[var(--text-primary,#fff)]">
            Répondre au litige (chargeback)
          </h3>
        </div>
        <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-4">
          ID du litige : <code className="bg-white/10 px-1 rounded">{disputeId}</code>. Renseignez les preuves
          pour contester le litige auprès de Stripe.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-1">
              Communication avec le client (optionnel)
            </label>
            <Textarea
              placeholder="Résumé des échanges avec le donateur..."
              value={customerCommunication}
              onChange={(e) => setCustomerCommunication(e.target.value)}
              rows={2}
              className="bg-[var(--background-secondary,#13131A)] border-white/10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-1">
              Preuves / Explication <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Décrivez les preuves (reçu, email de confirmation, etc.)..."
              value={uncategorizedText}
              onChange={(e) => setUncategorizedText(e.target.value)}
              rows={4}
              className="bg-[var(--background-secondary,#13131A)] border-white/10"
              required
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !uncategorizedText.trim()}
          >
            {loading ? 'Envoi…' : 'Soumettre les preuves'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
