'use client';

/**
 * NotesList - Étape 1.2.2
 * Liste des notes avec empty state et bouton "Ajouter une note".
 */

import { StickyNote } from 'lucide-react';

export interface DonatorNote {
  id: string;
  content: string;
  author_name?: string;
  author_avatar?: string;
  created_at: string;
  is_pinned?: boolean;
}

export interface NotesListProps {
  notes: DonatorNote[];
  onAddNote?: () => void;
  onEditNote?: (note: DonatorNote) => void;
  onDeleteNote?: (note: DonatorNote) => void;
  emptyMessage?: string;
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 1) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
  return d.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function NotesList({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  emptyMessage = "Aucune note pour ce donateur. Ajoutez la première !",
}: NotesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAddNote}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-info,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <StickyNote className="h-4 w-4" />
          Ajouter une note
        </button>
      </div>
      {notes.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <StickyNote className="mx-auto h-12 w-12 text-[var(--text-tertiary,#6B6B7B)]" />
          <p className="mt-4 text-[var(--text-secondary,#A0A0B0)]">{emptyMessage}</p>
          {onAddNote && (
            <button
              type="button"
              onClick={onAddNote}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-[var(--text-primary,#FFF)] hover:bg-white/10"
            >
              <StickyNote className="h-4 w-4" /> Ajouter une note
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--background-tertiary,#1C1C26)] flex items-center justify-center text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                    {note.author_name?.[0] ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary,#FFF)]">
                      {note.author_name ?? 'Auteur'}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary,#6B6B7B)]">
                      {formatRelative(note.created_at)}
                    </p>
                    <div className="mt-2 text-sm text-[var(--text-secondary,#A0A0B0)] whitespace-pre-wrap">
                      {note.content}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {onEditNote && (
                    <button
                      type="button"
                      onClick={() => onEditNote(note)}
                      className="text-xs text-[var(--text-tertiary,#6B6B7B)] hover:text-white"
                    >
                      Modifier
                    </button>
                  )}
                  {onDeleteNote && (
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
