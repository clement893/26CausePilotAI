'use client';

/**
 * DonatorInfoForm - Étape 2.1.4
 * Formulaire dynamique pour les informations du donateur (champs configurés dans le Form Builder).
 */

import { Input, Textarea } from '@/components/ui';
import type { DonationFormDraft, CustomFieldConfig } from '@/lib/types/donation-form';
import { REQUIRED_FIELD_OPTIONS, OPTIONAL_FIELD_OPTIONS } from '@/lib/types/donation-form';

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  firstName: 'Prénom',
  lastName: 'Nom',
  phone: 'Téléphone',
  address: 'Adresse',
  city: 'Ville',
  province: 'Province',
  postalCode: 'Code postal',
  country: 'Pays',
  message: 'Message',
  dedication: 'Dédicace',
};

export interface DonatorInfoFormProps {
  form: DonationFormDraft;
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
  errors?: Record<string, string>;
}

export default function DonatorInfoForm({ form, data, onChange, errors = {} }: DonatorInfoFormProps) {
  const set = (key: string, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const requiredIds = form.requiredFields;
  const optionalIds = form.optionalFields;

  const renderField = (id: string, label: string) => {
    if (id === 'message' || id === 'dedication') {
      return (
        <Textarea
          key={id}
          label={label}
          value={data[id] ?? ''}
          onChange={(e) => set(id, e.target.value)}
          placeholder={label}
          rows={2}
          error={errors[id]}
        />
      );
    }
    return (
      <Input
        key={id}
        label={label}
        value={data[id] ?? ''}
        onChange={(e) => set(id, e.target.value)}
        type={id === 'email' ? 'email' : 'text'}
        placeholder={label}
        required={requiredIds.includes(id)}
        error={errors[id]}
      />
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-white/90">Vos informations</p>
      {REQUIRED_FIELD_OPTIONS.filter((f) => requiredIds.includes(f.id)).map((f) =>
        renderField(f.id, f.label)
      )}
      {OPTIONAL_FIELD_OPTIONS.filter((f) => optionalIds.includes(f.id)).map((f) =>
        renderField(f.id, FIELD_LABELS[f.id] ?? f.label)
      )}
      {form.customFields.map((field: CustomFieldConfig) => (
        <div key={field.id}>
          {field.type === 'textarea' ? (
            <Textarea
              label={field.label}
              value={data[field.id] ?? ''}
              onChange={(e) => set(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              required={field.required}
              error={errors[field.id]}
            />
          ) : field.type === 'select' ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-white/90">
                {field.label}
                {field.required && <span className="text-red-400"> *</span>}
              </label>
              <select
                value={data[field.id] ?? ''}
                onChange={(e) => set(field.id, e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                required={field.required}
              >
                <option value="">Choisir...</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors[field.id] && (
                <p className="mt-1 text-sm text-red-400">{errors[field.id]}</p>
              )}
            </div>
          ) : (
            <Input
              label={field.label}
              value={data[field.id] ?? ''}
              onChange={(e) => set(field.id, e.target.value)}
              type={field.type === 'number' ? 'number' : 'text'}
              placeholder={field.placeholder}
              required={field.required}
              error={errors[field.id]}
            />
          )}
        </div>
      ))}
    </div>
  );
}
