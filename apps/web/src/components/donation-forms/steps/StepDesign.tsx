'use client';

/**
 * Étape 4 : Design - Étape 2.1.3
 */

import { ColorPicker, Select } from '@/components/ui';
import ImageUploader from '../ImageUploader';
import type { DonationFormDraft, FontOption, ButtonStyle } from '@/lib/types/donation-form';

const FONTS: { value: FontOption; label: string }[] = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Poppins', label: 'Poppins' },
];

const BUTTON_STYLES: { value: ButtonStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'outline', label: 'Outline' },
  { value: 'gradient', label: 'Gradient' },
];

export interface StepDesignProps {
  data: DonationFormDraft;
  onChange: (patch: Partial<DonationFormDraft>) => void;
  onUpload: (formData: FormData) => Promise<{ url?: string; error?: string }>;
}

export default function StepDesign({ data, onChange, onUpload }: StepDesignProps) {
  return (
    <div className="space-y-6">
      <ColorPicker
        label="Couleur principale"
        value={data.primaryColor}
        onChange={(c) => onChange({ primaryColor: c })}
      />
      <ImageUploader
        label="Logo"
        value={data.logo}
        onChange={(url) => onChange({ logo: url })}
        onUpload={onUpload}
      />
      <ImageUploader
        label="Image de fond"
        value={data.coverImageDesign ?? data.coverImage}
        onChange={(url) => onChange({ coverImageDesign: url })}
        onUpload={onUpload}
      />
      <Select
        label="Police de caractères"
        value={data.font}
        onChange={(e) => onChange({ font: e.target.value as FontOption })}
        options={FONTS.map((f) => ({ value: f.value, label: f.label }))}
      />
      <Select
        label="Style de bouton"
        value={data.buttonStyle}
        onChange={(e) => onChange({ buttonStyle: e.target.value as ButtonStyle })}
        options={BUTTON_STYLES.map((b) => ({ value: b.value, label: b.label }))}
      />
    </div>
  );
}
