'use client';

/**
 * PreviewPanel - Étape 2.1.3
 * Preview en temps réel du formulaire de don (Desktop / Mobile).
 */

import { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import type { DonationFormDraft } from '@/lib/types/donation-form';

export interface PreviewPanelProps {
  data: DonationFormDraft;
  className?: string;
}

export default function PreviewPanel({ data, className }: PreviewPanelProps) {
  const [isMobile, setIsMobile] = useState(false);

  const primaryColor = data.primaryColor || '#3B82F6';
  const fontFamily = data.font || 'Inter';

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-white/90">Aperçu</span>
        <div className="flex gap-1 rounded-lg border border-white/20 p-1">
          <button
            type="button"
            onClick={() => setIsMobile(false)}
            className={`rounded px-2 py-1 text-sm ${!isMobile ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
            aria-label="Vue desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsMobile(true)}
            className={`rounded px-2 py-1 text-sm ${isMobile ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
            aria-label="Vue mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-xl border border-white/20 bg-white/5 ${isMobile ? 'max-w-[320px]' : 'max-w-full'}`}
        style={{ fontFamily }}
      >
        <div
          className="p-6"
          style={{
            background: data.coverImageDesign || data.coverImage ? `url(${data.coverImageDesign || data.coverImage}) center/cover` : undefined,
            backgroundColor: data.coverImageDesign || data.coverImage ? 'transparent' : 'var(--background-secondary, #13131A)',
          }}
        >
          {data.logo && (
            <img src={data.logo} alt="" className="mb-4 h-12 object-contain" />
          )}
          <h2 className="mb-2 text-xl font-bold text-white">
            {data.title || 'Titre du formulaire'}
          </h2>
          {data.description && (
            <p className="mb-4 text-sm text-white/80">{data.description}</p>
          )}
          {data.welcomeMessage && (
            <p className="mb-4 text-sm text-white/70">{data.welcomeMessage}</p>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium text-white/90">Montant</p>
            <div className="flex flex-wrap gap-2">
              {data.suggestedAmounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: data.buttonStyle === 'outline' ? 'transparent' : primaryColor,
                    border: data.buttonStyle === 'outline' ? `2px solid ${primaryColor}` : 'none',
                    background: data.buttonStyle === 'gradient' ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` : undefined,
                  }}
                >
                  {a} {data.currency}
                </button>
              ))}
            </div>
            {data.allowRecurring && data.frequencies.length > 0 && (
              <p className="text-xs text-white/60">
                Dons récurrents : {data.frequencies.join(', ')}
              </p>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {data.requiredFields.includes('email') && (
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
                readOnly
                disabled
              />
            )}
            {data.requiredFields.includes('firstName') && (
              <input
                type="text"
                placeholder="Prénom"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
                readOnly
                disabled
              />
            )}
            {data.requiredFields.includes('lastName') && (
              <input
                type="text"
                placeholder="Nom"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50"
                readOnly
                disabled
              />
            )}
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-lg py-3 text-sm font-medium text-white"
            style={{
              backgroundColor: data.buttonStyle === 'outline' ? 'transparent' : primaryColor,
              border: data.buttonStyle === 'outline' ? `2px solid ${primaryColor}` : 'none',
              background: data.buttonStyle === 'gradient' ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` : undefined,
            }}
          >
            Faire un don
          </button>
        </div>
      </div>
    </div>
  );
}
