'use client';

/**
 * Rendu d'un bloc dans la zone de travail (Étape 3.1.2)
 */

import type { EmailBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, SeparatorBlockProps } from './types';

export interface BlockRendererProps {
  block: EmailBlock;
  isSelected?: boolean;
  onSelect: () => void;
}

export function BlockRenderer({ block, isSelected, onSelect }: BlockRendererProps) {
  const { type, props } = block;
  const baseClass = 'rounded-lg border p-3 cursor-pointer transition-colors ' + (isSelected ? 'border-[var(--color-primary,#3B82F6)] bg-[var(--color-primary,#3B82F6)]/10' : 'border-white/10 hover:border-white/20');

  if (type === 'text') {
    const p = props as TextBlockProps;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === 'Enter' && onSelect()}
        className={baseClass}
        style={{ fontSize: p.fontSize ?? 16, fontFamily: p.fontFamily ?? 'Arial', color: p.color ?? '#333', textAlign: p.align ?? 'left' }}
      >
        {(p.content ?? '').trim() || 'Votre texte ici'}
      </div>
    );
  }
  if (type === 'image') {
    const p = props as ImageBlockProps;
    return (
      <div role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => e.key === 'Enter' && onSelect()} className={baseClass}>
        {p.src ? (
          <img src={p.src} alt={p.alt ?? ''} style={{ maxWidth: '100%', width: p.width ?? 600, height: 'auto' }} />
        ) : (
          <div className="h-24 flex items-center justify-center bg-white/5 text-[var(--text-secondary,#A0A0B0)] text-sm">[Image]</div>
        )}
      </div>
    );
  }
  if (type === 'button') {
    const p = props as ButtonBlockProps;
    return (
      <div role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => e.key === 'Enter' && onSelect()} className={baseClass + ' text-center'}>
        <span
          className="inline-block px-4 py-2 rounded"
          style={{ backgroundColor: p.backgroundColor ?? '#3B82F6', color: p.color ?? '#fff', fontSize: p.fontSize ?? 16 }}
        >
          {p.label ?? 'Bouton'}
        </span>
      </div>
    );
  }
  if (type === 'separator') {
    const p = props as SeparatorBlockProps;
    return (
      <div role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => e.key === 'Enter' && onSelect()} className={baseClass}>
        <hr style={{ border: 'none', borderTop: `${p.thickness ?? 1}px solid ${p.color ?? '#e5e7eb'}` }} />
      </div>
    );
  }
  if (type === 'columns') {
    return (
      <div role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => e.key === 'Enter' && onSelect()} className={baseClass}>
        <div className="text-sm text-[var(--text-secondary,#A0A0B0)]">[Colonnes]</div>
      </div>
    );
  }
  return null;
}
