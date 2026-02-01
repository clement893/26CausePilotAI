'use client';

/**
 * ConsentCheckboxes - Étape 2.1.4
 * Cases à cocher pour les consentements configurés.
 */

import { Checkbox } from '@/components/ui';

export interface ConsentCheckboxesProps {
  consentText?: string;
  consentEmail: boolean;
  consentPhone: boolean;
  consentSMS: boolean;
  consentMail: boolean;
  onConsentEmail: (v: boolean) => void;
  onConsentPhone: (v: boolean) => void;
  onConsentSMS: (v: boolean) => void;
  onConsentMail: (v: boolean) => void;
  errors?: Record<string, string>;
}

export default function ConsentCheckboxes({
  consentText,
  consentEmail,
  consentPhone,
  consentSMS,
  consentMail,
  onConsentEmail,
  onConsentPhone,
  onConsentSMS,
  onConsentMail,
  errors = {},
}: ConsentCheckboxesProps) {
  return (
    <div className="space-y-4 rounded-lg border border-white/20 bg-white/5 p-4">
      {consentText && (
        <p className="text-sm text-white/80 whitespace-pre-wrap">{consentText}</p>
      )}
      <div className="space-y-3">
        <Checkbox
          label="J'accepte de recevoir des communications par email"
          checked={consentEmail}
          onChange={(e) => onConsentEmail(e.target.checked)}
          error={errors.consentEmail}
        />
        <Checkbox
          label="J'accepte d'être contacté par téléphone"
          checked={consentPhone}
          onChange={(e) => onConsentPhone(e.target.checked)}
          error={errors.consentPhone}
        />
        <Checkbox
          label="J'accepte de recevoir des SMS"
          checked={consentSMS}
          onChange={(e) => onConsentSMS(e.target.checked)}
          error={errors.consentSMS}
        />
        <Checkbox
          label="J'accepte de recevoir du courrier postal"
          checked={consentMail}
          onChange={(e) => onConsentMail(e.target.checked)}
          error={errors.consentMail}
        />
      </div>
    </div>
  );
}
