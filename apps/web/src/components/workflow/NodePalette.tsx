'use client';

/**
 * NodePalette - Panneau déclencheurs et actions (Étape 3.3.2)
 * Liste des nœuds à glisser sur le canvas.
 */

import { TRIGGERS, ACTIONS } from '@/lib/workflow/types';
import { Zap, Mail } from 'lucide-react';

export interface NodePaletteProps {
  onAddTrigger: (triggerType: string, label: string) => void;
  onAddAction: (actionType: string, label: string) => void;
}

export function NodePalette({ onAddTrigger, onAddAction }: NodePaletteProps) {
  return (
    <div className="flex flex-col gap-4 w-52 shrink-0 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" /> Déclencheurs
        </h3>
        <div className="space-y-1">
          {TRIGGERS.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => onAddTrigger(t.type, t.label)}
              className="flex w-full items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left text-sm text-white hover:bg-amber-500/20 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" /> Actions
        </h3>
        <div className="space-y-1">
          {ACTIONS.map((a) => (
            <button
              key={a.type}
              type="button"
              onClick={() => onAddAction(a.type, a.label)}
              className="flex w-full items-center gap-2 rounded-lg border border-[var(--color-primary,#3B82F6)]/30 bg-[var(--color-primary,#3B82F6)]/10 px-3 py-2 text-left text-sm text-white hover:bg-[var(--color-primary,#3B82F6)]/20 transition-colors"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
