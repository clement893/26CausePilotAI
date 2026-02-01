'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import Button from './Button';
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
}
export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color?: string;
}
export interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onCardMove?: (cardId: string, newStatus: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCardAdd?: (status: string) => void;
  className?: string;
}
export default function KanbanBoard({
  columns,
  cards,
  onCardMove,
  onCardClick,
  onCardAdd,
  className,
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const handleDragStart = (cardId: string) => {
    setDraggedCard(cardId);
  };
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };
  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    if (draggedCard) {
      onCardMove?.(draggedCard, columnStatus);
    }
    setDraggedCard(null);
    setDragOverColumn(null);
  };
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30';
      case 'medium':
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border border-yellow-500/30';
      case 'low':
        return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-500/30';
      default:
        return 'bg-[#1C1C26] bg-[#1C1C26] text-gray-300 text-white';
    }
  };
  return (
    <div className={clsx('flex gap-4 overflow-x-auto pb-4', className)}>
      {' '}
      {columns.map((column) => {
        const columnCards = cards.filter((card) => card.status === column.status);
        return (
          <div
            key={column.id}
            className={clsx(
              'flex-shrink-0 w-80 glass-effect bg-[#13131A] bg-[#1C1C26] rounded-lg p-4 border border-gray-800 border-gray-800',
              dragOverColumn === column.id && 'ring-2 ring-blue-500'
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {' '}
            {/* Column Header */}{' '}
            <div className="flex items-center justify-between mb-4">
              {' '}
              <div className="flex items-center gap-2">
                {' '}
                <div
                  className={clsx('w-3 h-3 rounded-full', column.color || 'bg-primary-500')}
                  style={column.color ? { backgroundColor: column.color } : undefined}
                />{' '}
                <h3 className="font-semibold text-white text-white">{column.title}</h3>
                <span className="text-sm text-gray-400 text-gray-400 bg-[#1C1C26] bg-[#13131A] px-2 py-1 rounded-full">
                  {columnCards.length}
                </span>
              </div>{' '}
              {onCardAdd && (
                <Button variant="ghost" size="sm" onClick={() => onCardAdd(column.status)}>
                  {' '}
                  +{' '}
                </Button>
              )}{' '}
            </div>{' '}
            {/* Cards */}{' '}
            <div className="space-y-3 min-h-[200px]">
              {' '}
              {columnCards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card.id)}
                  onClick={() => onCardClick?.(card)}
                  className={clsx(
                    'glass-effect bg-[#1C1C26] bg-[#13131A] rounded-lg p-4 shadow-sm cursor-move hover:shadow-md hover-lift transition-all border border-gray-800 border-gray-800',
                    draggedCard === card.id && 'opacity-50'
                  )}
                >
                  <h4 className="font-medium text-white text-white mb-2">
                    {card.title}
                  </h4>
                  {card.description && (
                    <p className="text-sm text-gray-400 text-gray-400 mb-3 line-clamp-2">
                      {card.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {' '}
                    {card.priority && (
                      <span
                        className={clsx(
                          'text-xs px-2 py-1 rounded',
                          getPriorityColor(card.priority)
                        )}
                      >
                        {' '}
                        {card.priority}{' '}
                      </span>
                    )}{' '}
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {' '}
                        {card.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-gray-300 text-gray-400 rounded border border-gray-700 border-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {card.dueDate && (
                    <div className="mt-2 text-xs text-gray-400 text-gray-400">
                      {new Date(card.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}{' '}
            </div>{' '}
          </div>
        );
      })}{' '}
    </div>
  );
}
