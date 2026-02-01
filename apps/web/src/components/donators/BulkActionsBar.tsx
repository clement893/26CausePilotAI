'use client';

/**
 * BulkActionsBar - Étape 1.2.1
 * Barre sticky en bas quand sélection active : compteur, Envoyer email, Ajouter à segment, Exporter, Supprimer, Annuler
 */

import { Mail, Layers, Download, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface BulkActionsBarProps {
  selectedCount: number;
  onSendEmail?: () => void;
  onAddToSegment?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onClearSelection: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  onSendEmail,
  onAddToSegment,
  onExport,
  onDelete,
  onClearSelection,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[var(--background-secondary,#13131A)] shadow-lg animate-in slide-in-from-bottom duration-200',
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <p className="text-sm font-medium text-[var(--text-primary,#FFF)]">
          {selectedCount} donateur{selectedCount > 1 ? 's' : ''} sélectionné
          {selectedCount > 1 ? 's' : ''}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onSendEmail && (
            <button
              type="button"
              onClick={onSendEmail}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-sm font-medium text-[var(--text-primary,#FFF)] hover:bg-white/10"
            >
              <Mail className="h-4 w-4" />
              Envoyer un email
            </button>
          )}
          {onAddToSegment && (
            <button
              type="button"
              onClick={onAddToSegment}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-sm font-medium text-[var(--text-primary,#FFF)] hover:bg-white/10"
            >
              <Layers className="h-4 w-4" />
              Ajouter à un segment
            </button>
          )}
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-sm font-medium text-[var(--text-primary,#FFF)] hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Exporter la sélection
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          )}
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
            Annuler la sélection
          </button>
        </div>
      </div>
    </div>
  );
}
