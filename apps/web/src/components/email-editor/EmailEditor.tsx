'use client';

/**
 * EmailEditor - Éditeur d'emails drag & drop (Étape 3.1.2)
 * Layout 3 colonnes : BlockPalette | Workspace | InspectorPanel
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { BlockPalette } from './BlockPalette';
import { Workspace } from './Workspace';
import { InspectorPanel } from './InspectorPanel';
import { createBlock } from './types';
import { blocksToHtml } from './blocksToHtml';
import type { EmailBlock, BlockType, EmailEditorContent } from './types';

export interface EmailEditorProps {
  initialContent: EmailEditorContent | null;
  onContentChange?: (content: EmailEditorContent, html: string) => void;
  onSave?: (content: EmailEditorContent, html: string) => Promise<void>;
  unsplashSearch?: (query: string) => Promise<{ url: string }[]>;
  /** Auto-save debounce ms; 0 = disabled */
  autoSaveMs?: number;
}

const DEFAULT_CONTENT: EmailEditorContent = { blocks: [] };

export function EmailEditor({
  initialContent,
  onContentChange,
  onSave,
  unsplashSearch,
  autoSaveMs = 5000,
}: EmailEditorProps) {
  const [content, setContent] = useState<EmailEditorContent>(initialContent ?? DEFAULT_CONTENT);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const blocks = content.blocks ?? [];
  const selectedBlock = selectedId ? blocks.find((b) => b.id === selectedId) ?? null : null;

  const setBlocks = useCallback(
    (next: EmailBlock[]) => {
      const nextContent = { blocks: next };
      setContent(nextContent);
      const html = blocksToHtml(next);
      onContentChange?.(nextContent, html);
      if (autoSaveMs > 0 && onSave) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          onSave(nextContent, html)
            .catch(() => {})
            .finally(() => {
              saveTimeoutRef.current = null;
            });
        }, autoSaveMs);
      }
    },
    [onContentChange, onSave, autoSaveMs]
  );

  useEffect(() => () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); }, []);

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      const newBlock = createBlock(type);
      setBlocks([...blocks, newBlock]);
      setSelectedId(newBlock.id);
    },
    [blocks, setBlocks]
  );

  const handleUpdateBlock = useCallback(
    (id: string, props: EmailBlock['props']) => {
      const next = blocks.map((b) => (b.id === id ? { ...b, props } : b));
      setBlocks(next);
    },
    [blocks, setBlocks]
  );

  const handleReorder = useCallback(
    (next: EmailBlock[]) => {
      setBlocks(next);
    },
    [setBlocks]
  );

  return (
    <div className="flex gap-4 h-full min-h-0">
      <BlockPalette onAddBlock={handleAddBlock} />
      <Workspace
        blocks={blocks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onReorder={handleReorder}
        onUpdateBlock={handleUpdateBlock}
      />
      <InspectorPanel
        block={selectedBlock}
        onUpdate={handleUpdateBlock}
        onUnsplashSearch={unsplashSearch}
      />
    </div>
  );
}

export { blocksToHtml };
