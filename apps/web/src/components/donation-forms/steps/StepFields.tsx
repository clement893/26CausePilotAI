'use client';

/**
 * Étape 3 : Champs - Étape 2.1.3
 */

import FieldEditor from '../FieldEditor';
import { REQUIRED_FIELD_OPTIONS, OPTIONAL_FIELD_OPTIONS } from '@/lib/types/donation-form';
import type { DonationFormDraft, CustomFieldConfig } from '@/lib/types/donation-form';

export interface StepFieldsProps {
  data: DonationFormDraft;
  onChange: (patch: Partial<DonationFormDraft>) => void;
}

export default function StepFields({ data, onChange }: StepFieldsProps) {
  const toggleRequired = (id: string) => {
    const next = data.requiredFields.includes(id)
      ? data.requiredFields.filter((x) => x !== id)
      : [...data.requiredFields, id];
    onChange({ requiredFields: next });
  };

  const toggleOptional = (id: string) => {
    const next = data.optionalFields.includes(id)
      ? data.optionalFields.filter((x) => x !== id)
      : [...data.optionalFields, id];
    onChange({ optionalFields: next });
  };

  const setCustomFields = (fields: CustomFieldConfig[]) => onChange({ customFields: fields });

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-sm font-medium text-white/90">Champs obligatoires</p>
        <div className="flex flex-wrap gap-3">
          {REQUIRED_FIELD_OPTIONS.map((f) => (
            <label key={f.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2">
              <input
                type="checkbox"
                checked={data.requiredFields.includes(f.id)}
                onChange={() => toggleRequired(f.id)}
                className="rounded"
              />
              <span className="text-white/90">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-white/90">Champs optionnels</p>
        <div className="flex flex-wrap gap-3">
          {OPTIONAL_FIELD_OPTIONS.map((f) => (
            <label key={f.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2">
              <input
                type="checkbox"
                checked={data.optionalFields.includes(f.id)}
                onChange={() => toggleOptional(f.id)}
                className="rounded"
              />
              <span className="text-white/90">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <FieldEditor
        fields={data.customFields}
        onChange={setCustomFields}
      />
    </div>
  );
}
