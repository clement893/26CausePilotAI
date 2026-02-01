'use client';

/**
 * ConditionRow - Une ligne pour une condition (champ, opérateur, valeur) - Étape 3.2.1
 */

import { SEGMENT_FIELDS, OPERATORS_BY_TYPE } from '@/lib/segmentation/types';
import type { SegmentCondition, SegmentField, SegmentOperator } from '@/lib/segmentation/types';
import { Trash2 } from 'lucide-react';

export interface ConditionRowProps {
  condition: SegmentCondition;
  onChange: (condition: SegmentCondition) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function ConditionRow({ condition, onChange, onRemove, canRemove }: ConditionRowProps) {
  const fieldMeta = SEGMENT_FIELDS.find((f) => f.value === condition.field);
  const valueType = fieldMeta?.valueType ?? 'number';
  const operators = (OPERATORS_BY_TYPE[valueType] ?? OPERATORS_BY_TYPE.number) ?? [];

  const handleFieldChange = (field: SegmentField) => {
    const meta = SEGMENT_FIELDS.find((f) => f.value === field);
    const ops = OPERATORS_BY_TYPE[meta?.valueType ?? 'number'] ?? OPERATORS_BY_TYPE.number;
    const defaultOp = (ops && ops[0]) ? ops[0].value : 'eq';
    let defaultVal: string | number | boolean = 0;
    if (meta?.valueType === 'string') defaultVal = '';
    if (meta?.valueType === 'date') defaultVal = new Date().toISOString().slice(0, 10);
    if (meta?.valueType === 'boolean') defaultVal = false;
    onChange({ ...condition, field, operator: defaultOp, value: defaultVal });
  };

  const handleOperatorChange = (operator: SegmentOperator) => {
    onChange({ ...condition, operator });
  };

  const handleValueChange = (value: string | number | boolean) => {
    if (fieldMeta?.valueType === 'number') {
      const n = typeof value === 'string' ? parseFloat(value) : value;
      onChange({ ...condition, value: Number.isNaN(n) ? 0 : n });
    } else if (fieldMeta?.valueType === 'boolean') {
      onChange({ ...condition, value: value === true || value === 'true' });
    } else {
      onChange({ ...condition, value: String(value) });
    }
  };

  const valueInput = () => {
    if (valueType === 'boolean') {
      return (
        <select
          value={condition.value === true ? 'true' : 'false'}
          onChange={(e) => handleValueChange(e.target.value === 'true')}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white min-w-[100px]"
        >
          <option value="false">Non</option>
          <option value="true">Oui</option>
        </select>
      );
    }
    if (valueType === 'date') {
      const isWithinDays = condition.operator === 'within_days';
      if (isWithinDays) {
        return (
          <input
            type="number"
            min={0}
            value={typeof condition.value === 'number' ? condition.value : Number(condition.value) || 0}
            onChange={(e) => handleValueChange(Number(e.target.value) || 0)}
            placeholder="30"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white w-24"
          />
        );
      }
      return (
        <input
          type="date"
          value={typeof condition.value === 'string' ? condition.value.slice(0, 10) : ''}
          onChange={(e) => handleValueChange(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
      );
    }
    if (valueType === 'number') {
      return (
        <input
          type="number"
          value={condition.value as number}
          onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white w-32"
        />
      );
    }
    return (
      <input
        type="text"
        value={String(condition.value)}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Valeur"
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white min-w-[120px]"
      />
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] p-3">
      <select
        value={condition.field}
        onChange={(e) => handleFieldChange(e.target.value as SegmentField)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white min-w-[180px]"
      >
        {SEGMENT_FIELDS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        value={condition.operator}
        onChange={(e) => handleOperatorChange(e.target.value as SegmentOperator)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white min-w-[140px]"
      >
        {operators.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {valueInput()}
      {condition.operator === 'within_days' && valueType === 'date' && (
        <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">jours</span>
      )}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1.5 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-red-400"
          aria-label="Supprimer la condition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
