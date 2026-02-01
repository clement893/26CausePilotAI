'use client';

/**
 * Étape 1 : Informations - Étape 2.1.3
 */

import { Input, Textarea } from '@/components/ui';
import ImageUploader from '../ImageUploader';
import type { DonationFormDraft } from '@/lib/types/donation-form';

export interface StepInformationsProps {
  data: DonationFormDraft;
  onChange: (patch: Partial<DonationFormDraft>) => void;
  onUpload: (formData: FormData) => Promise<{ url?: string; error?: string }>;
}

export default function StepInformations({ data, onChange, onUpload }: StepInformationsProps) {
  const slugFromTitle = (t: string) =>
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  return (
    <div className="space-y-6">
      <Input
        label="Titre du formulaire"
        value={data.title}
        onChange={(e) => {
          onChange({ title: e.target.value });
          if (!data.slug || data.slug === slugFromTitle(data.title)) {
            onChange({ slug: slugFromTitle(e.target.value) });
          }
        }}
        placeholder="Ex: Campagne Noël 2026"
        required
      />
      <Textarea
        label="Description"
        value={data.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description optionnelle du formulaire"
        rows={3}
      />
      <Input
        label="Slug (URL)"
        value={data.slug}
        onChange={(e) => onChange({ slug: e.target.value })}
        placeholder="campagne-noel-2026"
      />
      <ImageUploader
        label="Image de couverture"
        value={data.coverImage}
        onChange={(url) => onChange({ coverImage: url })}
        onUpload={onUpload}
      />
    </div>
  );
}
