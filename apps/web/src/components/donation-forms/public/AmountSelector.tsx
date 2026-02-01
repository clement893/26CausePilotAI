'use client';

/**
 * AmountSelector - Étape 2.1.4
 * Sélection du montant et toggle dons récurrents.
 */

import { useState } from 'react';
import { Input } from '@/components/ui';
import type { DonationFormDraft, FrequencyKey } from '@/lib/types/donation-form';

const FREQUENCY_LABELS: Record<FrequencyKey, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

export interface AmountSelectorProps {
  form: DonationFormDraft;
  amount: number | null;
  customAmount: string;
  isRecurring: boolean;
  frequency: FrequencyKey | null;
  onAmountChange: (amount: number | null, customAmount: string) => void;
  onRecurringChange: (isRecurring: boolean, frequency: FrequencyKey | null) => void;
  primaryColor: string;
  buttonStyle: string;
}

export default function AmountSelector({
  form,
  amount,
  customAmount,
  isRecurring,
  frequency,
  onAmountChange,
  onRecurringChange,
  primaryColor,
  buttonStyle,
}: AmountSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);

  const handleSuggested = (val: number) => {
    onAmountChange(val, '');
    setShowCustom(false);
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onAmountChange(null, v);
    setShowCustom(true);
  };

  const customNum = customAmount ? parseFloat(customAmount.replace(/,/, '.')) : null;
  const displayAmount = amount ?? customNum;
  const currency = form.currency;

  const btnClass =
    buttonStyle === 'outline'
      ? 'border-2 bg-transparent text-white'
      : buttonStyle === 'gradient'
        ? 'border-0 text-white'
        : 'border-0 text-white';

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-white/90">Choisissez un montant</p>
      <div className="flex flex-wrap gap-2">
        {form.suggestedAmounts.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => handleSuggested(val)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${btnClass}`}
            style={{
              borderColor: primaryColor,
              backgroundColor: buttonStyle === 'outline' ? 'transparent' : primaryColor,
              background: buttonStyle === 'gradient' ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` : undefined,
              opacity: amount === val ? 1 : 0.85,
            }}
          >
            {val} {currency}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${btnClass}`}
          style={{
            borderColor: primaryColor,
            backgroundColor: buttonStyle === 'outline' ? 'transparent' : primaryColor,
            background: buttonStyle === 'gradient' ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` : undefined,
            opacity: showCustom || customAmount ? 1 : 0.85,
          }}
        >
          Autre
        </button>
      </div>
      {(showCustom || customAmount) && (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={form.minAmount ?? 1}
            max={form.maxAmount ?? undefined}
            step="0.01"
            value={customAmount}
            onChange={handleCustomInput}
            placeholder="Montant personnalisé"
            className="max-w-[180px]"
          />
          <span className="text-white/70">{currency}</span>
        </div>
      )}
      {form.allowRecurring && form.frequencies.length > 0 && (
        <div className="space-y-2 rounded-lg border border-white/20 bg-white/5 p-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => onRecurringChange(e.target.checked, e.target.checked ? (frequency ?? form.frequencies[0] ?? null) : null)}
              className="rounded"
            />
            <span className="text-sm text-white/90">Don récurrent</span>
          </label>
          {isRecurring && (
            <div className="flex flex-wrap gap-2 pl-6">
              {form.frequencies.map((f) => (
                <label key={f} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="frequency"
                    checked={frequency === f}
                    onChange={() => onRecurringChange(true, f)}
                    className="rounded-full"
                  />
                  <span className="text-sm text-white/80">{FREQUENCY_LABELS[f]}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      {displayAmount != null && displayAmount > 0 && (
        <p className="text-sm text-white/70">
          Montant sélectionné : {displayAmount} {currency}
          {isRecurring && frequency && ` (${FREQUENCY_LABELS[frequency]})`}
        </p>
      )}
    </div>
  );
}
