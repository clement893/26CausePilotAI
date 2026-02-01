'use client';

/**
 * Étape 6 : Paramètres - Étape 2.1.3
 */

import { Switch, Textarea, Input } from '@/components/ui';
import type { DonationFormDraft } from '@/lib/types/donation-form';

export interface StepParamsProps {
  data: DonationFormDraft;
  onChange: (patch: Partial<DonationFormDraft>) => void;
}

export default function StepParams({ data, onChange }: StepParamsProps) {
  return (
    <div className="space-y-6">
      <Switch
        label="Activer les consentements (RGPD)"
        checked={data.enableConsents}
        onChange={(e) => onChange({ enableConsents: e.target.checked })}
      />
      {data.enableConsents && (
        <Textarea
          label="Texte des consentements"
          value={data.consentText}
          onChange={(e) => onChange({ consentText: e.target.value })}
          placeholder="Texte personnalisé pour les cases à cocher"
          rows={3}
        />
      )}
      <Switch
        label="Activer reCAPTCHA"
        checked={data.enableCaptcha}
        onChange={(e) => onChange({ enableCaptcha: e.target.checked })}
      />
      <Input
        label="Limite de dons (optionnel)"
        type="number"
        min={0}
        value={data.maxDonations ?? ''}
        onChange={(e) => onChange({ maxDonations: e.target.value ? parseInt(e.target.value, 10) : null })}
        placeholder="Nombre max de dons"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/90">Date de début</label>
          <Input
            type="date"
            value={data.startDate ?? ''}
            onChange={(e) => onChange({ startDate: e.target.value || null })}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/90">Date de fin</label>
          <Input
            type="date"
            value={data.endDate ?? ''}
            onChange={(e) => onChange({ endDate: e.target.value || null })}
          />
        </div>
      </div>
      <Input
        label="Objectif de collecte (optionnel)"
        type="number"
        min={0}
        step={0.01}
        value={data.goalAmount ?? ''}
        onChange={(e) => onChange({ goalAmount: e.target.value ? parseFloat(e.target.value) : null })}
        placeholder="Montant cible"
      />
    </div>
  );
}
