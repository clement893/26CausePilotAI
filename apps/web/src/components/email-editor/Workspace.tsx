'use client';

/**
 * Workspace - Zone de travail centrale (Étape 3.1.2)
 * Liste des blocs avec drag & drop pour réordonner.
 */

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { BlockRenderer } from './BlockRenderer';
import type { EmailBlock } from './types';

export interface WorkspaceProps {
  blocks: EmailBlock[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReorder: (blocks: EmailBlock[]) => void;
  onUpdateBlock: (id: string, props: EmailBlock['props']) => void;
}

export function Workspace({ blocks, selectedId, onSelect, onReorder }: WorkspaceProps) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    const next = [...blocks];
    const [removed] = next.splice(from, 1);
    if (removed == null) return;
    next.splice(to, 0, removed);
    onReorder(next);
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)] mb-2">Zone de travail</h3>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workspace">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4 min-h-[320px] space-y-2"
            >
              {blocks.length === 0 ? (
                <div
                  className="flex items-center justify-center h-64 text-[var(--text-secondary,#A0A0B0)] text-sm border border-dashed border-white/20 rounded-lg"
                  onClick={() => onSelect(null)}
                >
                  Ajoutez des blocs depuis la palette à gauche
                </div>
              ) : (
                blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'opacity-80' : ''}
                      >
                        <BlockRenderer
                          block={block}
                          isSelected={selectedId === block.id}
                          onSelect={() => onSelect(block.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
