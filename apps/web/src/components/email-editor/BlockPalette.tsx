'use client';

/**
 * BlockPalette - Liste des blocs disponibles (Étape 3.1.2)
 * Colonne gauche : Texte, Image, Bouton, Séparateur, Colonnes
 */

import { Type, Image, MousePointer, Minus, Columns } from 'lucide-react';
import type { BlockType } from './types';

const BLOCKS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Texte', icon: <Type className="w-4 h-4" /> },
  { type: 'image', label: 'Image', icon: <Image className="w-4 h-4" /> },
  { type: 'button', label: 'Bouton', icon: <MousePointer className="w-4 h-4" /> },
  { type: 'separator', label: 'Séparateur', icon: <Minus className="w-4 h-4" /> },
  { type: 'columns', label: 'Colonnes', icon: <Columns className="w-4 h-4" /> },
];

export interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div className="flex flex-col gap-1 w-48 shrink-0">
      <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-2">Blocs</h3>
      {BLOCKS.map(({ type, label, icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => onAddBlock(type)}
          className="flex items-center gap-2 w-full rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-3 py-2 text-left text-sm text-[var(--text-primary,#FFF)] hover:bg-white/5 hover:border-[var(--color-primary,#3B82F6)] transition-colors"
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
}
