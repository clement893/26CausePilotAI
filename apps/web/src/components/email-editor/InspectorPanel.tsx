'use client';

/**
 * InspectorPanel - Panneau des propriétés du bloc sélectionné (Étape 3.1.2)
 */

import { useState, useEffect } from 'react';
import type { EmailBlock, TextBlockProps, ImageBlockProps, ButtonBlockProps, SeparatorBlockProps } from './types';
import { AIGenerateButton } from '@/components/ai/AIGenerateButton';

export interface InspectorPanelProps {
  block: EmailBlock | null;
  onUpdate: (id: string, props: EmailBlock['props']) => void;
  onUnsplashSearch?: (query: string) => Promise<{ url: string }[]>;
}

export function InspectorPanel({ block, onUpdate, onUnsplashSearch }: InspectorPanelProps) {
  const [localProps, setLocalProps] = useState<EmailBlock['props'] | null>(null);
  const [imageSearch, setImageSearch] = useState('');
  const [imageResults, setImageResults] = useState<{ url: string }[]>([]);

  useEffect(() => {
    if (block) setLocalProps(block.props);
    else setLocalProps(null);
  }, [block?.id, block?.props]);

  const handleImageSearch = async () => {
    if (!onUnsplashSearch || !imageSearch.trim()) return;
    const results = await onUnsplashSearch(imageSearch.trim());
    setImageResults(results);
  };

  if (!block) {
    return (
      <div className="w-64 shrink-0">
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-2">Propriétés</h3>
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 text-sm text-[var(--text-secondary,#A0A0B0)]">
          Sélectionnez un bloc pour modifier ses propriétés
        </div>
      </div>
    );
  }

  const update = (partial: Partial<EmailBlock['props']>) => {
    if (!localProps || !block) return;
    const next = { ...localProps, ...partial };
    setLocalProps(next);
    onUpdate(block.id, next);
  };

  if (block.type === 'text') {
    const p = localProps as TextBlockProps;
    return (
      <div className="w-64 shrink-0 space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Texte</h3>
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Contenu</label>
            <AIGenerateButton
              contentType="email"
              onGenerated={(content) => {
                // Nettoyer le HTML et extraire le texte si nécessaire
                const textContent = content.replace(/<[^>]*>/g, '').trim() || content;
                update({ content: textContent });
              }}
              context="Email marketing pour collecte de fonds"
              size="sm"
            />
          </div>
          <textarea
            value={p?.content ?? ''}
            onChange={(e) => update({ content: e.target.value })}
            rows={4}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Taille (px)</label>
          <input
            type="number"
            value={p?.fontSize ?? 16}
            onChange={(e) => update({ fontSize: Number(e.target.value) || 16 })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Couleur</label>
          <input
            type="color"
            value={p?.color ?? '#333333'}
            onChange={(e) => update({ color: e.target.value })}
            className="w-full h-8 rounded border border-white/10"
          />
          <select
            value={p?.align ?? 'left'}
            onChange={(e) => update({ align: e.target.value as 'left' | 'center' | 'right' })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>
      </div>
    );
  }

  if (block.type === 'image') {
    const p = localProps as ImageBlockProps;
    return (
      <div className="w-64 shrink-0 space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Image</h3>
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 space-y-3">
          {onUnsplashSearch && (
            <>
              <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Recherche Unsplash</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="flex-1 rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
                />
                <button type="button" onClick={handleImageSearch} className="rounded bg-[var(--color-primary,#3B82F6)] px-2 py-1.5 text-sm text-white">
                  OK
                </button>
              </div>
              {imageResults.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {imageResults.slice(0, 6).map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        update({ src: r.url });
                        setImageResults([]);
                      }}
                      className="aspect-square rounded border border-white/10 overflow-hidden"
                    >
                      <img src={r.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">URL</label>
          <input
            type="url"
            value={p?.src ?? ''}
            onChange={(e) => update({ src: e.target.value })}
            placeholder="https://..."
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Alt</label>
          <input
            type="text"
            value={p?.alt ?? ''}
            onChange={(e) => update({ alt: e.target.value })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Largeur (px)</label>
          <input
            type="number"
            value={p?.width ?? 600}
            onChange={(e) => update({ width: Number(e.target.value) || 600 })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
        </div>
      </div>
    );
  }

  if (block.type === 'button') {
    const p = localProps as ButtonBlockProps;
    return (
      <div className="w-64 shrink-0 space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Bouton</h3>
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 space-y-3">
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Libellé</label>
          <input
            type="text"
            value={p?.label ?? ''}
            onChange={(e) => update({ label: e.target.value })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Lien (href)</label>
          <input
            type="url"
            value={p?.href ?? ''}
            onChange={(e) => update({ href: e.target.value })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Couleur fond</label>
          <input
            type="color"
            value={p?.backgroundColor ?? '#3B82F6'}
            onChange={(e) => update({ backgroundColor: e.target.value })}
            className="w-full h-8 rounded border border-white/10"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Couleur texte</label>
          <input
            type="color"
            value={p?.color ?? '#ffffff'}
            onChange={(e) => update({ color: e.target.value })}
            className="w-full h-8 rounded border border-white/10"
          />
        </div>
      </div>
    );
  }

  if (block.type === 'separator') {
    const p = localProps as SeparatorBlockProps;
    return (
      <div className="w-64 shrink-0 space-y-3">
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Séparateur</h3>
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 space-y-3">
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Couleur</label>
          <input
            type="color"
            value={p?.color ?? '#e5e7eb'}
            onChange={(e) => update({ color: e.target.value })}
            className="w-full h-8 rounded border border-white/10"
          />
          <label className="block text-xs text-[var(--text-secondary,#A0A0B0)]">Épaisseur (px)</label>
          <input
            type="number"
            min={1}
            value={p?.thickness ?? 1}
            onChange={(e) => update({ thickness: Number(e.target.value) || 1 })}
            className="w-full rounded bg-white/5 border border-white/10 px-2 py-1.5 text-sm text-[var(--text-primary,#FFF)]"
          />
        </div>
      </div>
    );
  }

  if (block.type === 'columns') {
    return (
      <div className="w-64 shrink-0">
        <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Colonnes</h3>
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 text-sm text-[var(--text-secondary,#A0A0B0)]">
          Éditez le contenu des colonnes dans la zone de travail.
        </div>
      </div>
    );
  }

  return null;
}
