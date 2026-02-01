'use client';

/**
 * Étape 5 : Messages - Étape 2.1.3
 */

import { Textarea, Input } from '@/components/ui';
import type { DonationFormDraft } from '@/lib/types/donation-form';

export interface StepMessagesProps {
  data: DonationFormDraft;
  onChange: (patch: Partial<DonationFormDraft>) => void;
}

export default function StepMessages({ data, onChange }: StepMessagesProps) {
  return (
    <div className="space-y-6">
      <Textarea
        label="Message de bienvenue"
        value={data.welcomeMessage}
        onChange={(e) => onChange({ welcomeMessage: e.target.value })}
        placeholder="Message affiché au-dessus du formulaire"
        rows={3}
      />
      <Textarea
        label="Message de remerciement"
        value={data.thankYouMessage}
        onChange={(e) => onChange({ thankYouMessage: e.target.value })}
        placeholder="Message affiché après le don"
        rows={3}
      />
      <Textarea
        label="Email de confirmation (template)"
        value={data.emailTemplate}
        onChange={(e) => onChange({ emailTemplate: e.target.value })}
        placeholder="Contenu de l'email de confirmation"
        rows={5}
      />
      <Input
        label="Redirection après don (URL)"
        type="url"
        value={data.redirectUrl}
        onChange={(e) => onChange({ redirectUrl: e.target.value })}
        placeholder="https://..."
      />
    </div>
  );
}
