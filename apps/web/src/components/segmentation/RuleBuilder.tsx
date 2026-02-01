'use client';

/**
 * RuleBuilder - Interface pour construire les règles de segmentation - Étape 3.2.1
 * Groupes de conditions (ET/OU), ajout/suppression de conditions.
 */

import { useCallback } from 'react';
import { ConditionRow } from './ConditionRow';
import { createEmptyCondition, type SegmentRuleGroup, type SegmentCondition } from '@/lib/segmentation/types';
import { Plus } from 'lucide-react';

export interface RuleBuilderProps {
  group: SegmentRuleGroup;
  onChange: (group: SegmentRuleGroup) => void;
}

export function RuleBuilder({ group, onChange }: RuleBuilderProps) {
  const updateLogic = useCallback(
    (logic: 'AND' | 'OR') => {
      onChange({ ...group, logic });
    },
    [group, onChange]
  );

  const updateCondition = useCallback(
    (index: number, condition: SegmentCondition) => {
      const next = [...group.conditions];
      next[index] = condition;
      onChange({ ...group, conditions: next });
    },
    [group, onChange]
  );

  const addCondition = useCallback(() => {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()],
    });
  }, [group, onChange]);

  const removeCondition = useCallback(
    (index: number) => {
      const next = group.conditions.filter((_, i) => i !== index);
      if (next.length === 0) next.push(createEmptyCondition());
      onChange({ ...group, conditions: next });
    },
    [group, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">Toutes les conditions suivantes doivent être remplies :</span>
        <select
          value={group.logic}
          onChange={(e) => updateLogic(e.target.value as 'AND' | 'OR')}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="AND">ET (AND)</option>
          <option value="OR">OU (OR)</option>
        </select>
      </div>
      <div className="space-y-2">
        {group.conditions.map((cond, index) => (
          <ConditionRow
            key={cond.id}
            condition={cond}
            onChange={(c) => updateCondition(index, c)}
            onRemove={() => removeCondition(index)}
            canRemove={group.conditions.length > 1}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addCondition}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5 hover:border-[var(--color-primary,#3B82F6)]"
      >
        <Plus className="w-4 h-4" /> Ajouter une condition
      </button>
    </div>
  );
}
