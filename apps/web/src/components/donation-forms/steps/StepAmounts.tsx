'use client';

/**
 * Étape 2 : Montants - Étape 2.1.3
 */

import { useState } from 'react';
import { Input, Select, Switch, Checkbox, Button } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';
import type { DonationFormDraft, Currency, FrequencyKey } from '@/lib/types/donation-form';

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'CAD', label: 'CAD' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

const FREQUENCY_OPTIONS: { value: FrequencyKey; label: string }[] = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'quarterly', label: 'Trimestriel' },
  { value: 'yearly', label: 'Annuel' },
];

export interface StepAmountsProps {
  data: DonationFormDraft;
  onChange: (patch: Partial<DonationFormDraft>) => void;
}

export default function StepAmounts({ data, onChange }: StepAmountsProps) {
  const [newAmount, setNewAmount] = useState('');

  const addAmount = () => {
    const n = parseFloat(newAmount.replace(/,/, '.'));
    if (!Number.isNaN(n) && n > 0 && !data.suggestedAmounts.includes(n)) {
      onChange({ suggestedAmounts: [...data.suggestedAmounts, n].sort((a, b) => a - b) });
      setNewAmount('');
    }
  };

  const removeAmount = (val: number) => {
    onChange({ suggestedAmounts: data.suggestedAmounts.filter((a) => a !== val) });
  };

  const toggleFrequency = (f: FrequencyKey) => {
    const next = data.frequencies.includes(f)
      ? data.frequencies.filter((x) => x !== f)
      : [...data.frequencies, f];
    onChange({ frequencies: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-white/90">Type de don</p>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="amountType"
              checked={data.amountType === 'flexible'}
              onChange={() => onChange({ amountType: 'flexible' })}
              className="rounded-full"
            />
            <span className="text-white/90">Flexible</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="amountType"
              checked={data.amountType === 'fixed'}
              onChange={() => onChange({ amountType: 'fixed' })}
              className="rounded-full"
            />
            <span className="text-white/90">Fixe</span>
          </label>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-white/90">Montants suggérés</p>
        <div className="flex flex-wrap gap-2">
          {data.suggestedAmounts.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm"
            >
              {a} <button type="button" onClick={() => removeAmount(a)} className="text-red-400 hover:text-red-300" aria-label="Supprimer"><Trash2 className="h-3 w-3" /></button>
            </span>
          ))}
          <div className="flex gap-1">
            <Input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Montant"
              className="w-24"
            />
            <Button type="button" size="sm" onClick={addAmount}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Montant minimum"
          type="number"
          min={0}
          step={0.01}
          value={data.minAmount ?? ''}
          onChange={(e) => onChange({ minAmount: e.target.value ? parseFloat(e.target.value) : null })}
          placeholder="Optionnel"
        />
        <Input
          label="Montant maximum"
          type="number"
          min={0}
          step={0.01}
          value={data.maxAmount ?? ''}
          onChange={(e) => onChange({ maxAmount: e.target.value ? parseFloat(e.target.value) : null })}
          placeholder="Optionnel"
        />
      </div>

      <Select
        label="Devise"
        value={data.currency}
        onChange={(e) => onChange({ currency: e.target.value as Currency })}
        options={CURRENCIES.map((c) => ({ value: c.value, label: c.label }))}
      />

      <Switch
        label="Autoriser les dons récurrents"
        checked={data.allowRecurring}
        onChange={(e) => onChange({ allowRecurring: e.target.checked })}
      />

      {data.allowRecurring && (
        <div>
          <p className="mb-2 text-sm font-medium text-white/90">Fréquences disponibles</p>
          <div className="flex flex-wrap gap-4">
            {FREQUENCY_OPTIONS.map((f) => (
              <label key={f.value} className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={data.frequencies.includes(f.value)}
                  onChange={() => toggleFrequency(f.value)}
                />
                <span className="text-white/90">{f.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
