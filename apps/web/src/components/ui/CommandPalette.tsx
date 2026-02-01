/**
 * Command Palette Component
 * Modern ⌘K command palette for SaaS applications
 */

'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useCommandPaletteState } from './CommandPalette.hooks';
import type { Command, CommandPaletteProps } from './CommandPalette.types';

export type { Command, CommandPaletteProps };

export default function CommandPalette({
  commands,
  isOpen,
  onClose,
  placeholder = 'Tapez une commande ou recherchez...',
  emptyState,
  className,
}: CommandPaletteProps) {
  const { search, setSearch, selectedIndex, filteredCommands, groupedCommands } =
    useCommandPaletteState(commands, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsx(
          'glass-effect bg-[#13131A] bg-[#1C1C26] rounded-lg shadow-2xl w-full max-w-2xl',
          'border border-gray-800 border-gray-800',
          'max-h-[60vh] flex flex-col overflow-hidden',
          className
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 border-gray-800">
          <svg
            className="w-5 h-5 text-gray-400 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-white text-white placeholder:text-gray-500 placeholder-gray-400"
            autoFocus
            aria-label="Search commands"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-400 text-gray-400 bg-[#1C1C26] bg-[#1C1C26] border border-gray-800 border-gray-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            emptyState || (
              <div className="text-center py-8 text-gray-400 text-gray-400">
                <p>Aucun résultat trouvé</p>
              </div>
            )
          ) : (
            <div className="space-y-1">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category}>
                  {category !== 'Autres' && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                  )}
                  {categoryCommands.map((command) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={command.id}
                        onClick={() => {
                          command.action();
                          onClose();
                        }}
                        className={clsx(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                          isSelected
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white text-blue-300 border-l-4 border-l-blue-500'
                            : 'text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]'
                        )}
                      >
                        {command.icon && (
                          <span className="flex-shrink-0 text-gray-400 text-gray-400">
                            {command.icon}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{command.label}</div>
                          {command.description && (
                            <div className="text-sm text-gray-400 text-gray-400 truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                        {command.shortcut && (
                          <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-400 text-gray-400 bg-[#1C1C26] bg-[#1C1C26] border border-gray-800 border-gray-800 rounded">
                            {command.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 border-gray-800 text-xs text-gray-400 text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#1C1C26] bg-[#1C1C26] border border-gray-800 border-gray-800 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[#1C1C26] bg-[#1C1C26] border border-gray-800 border-gray-800 rounded">↓</kbd>
              <span>Naviguer</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#1C1C26] bg-[#1C1C26] border border-gray-800 border-gray-800 rounded">Enter</kbd>
              <span>Sélectionner</span>
            </div>
          </div>
          <div>
            {filteredCommands.length} résultat{filteredCommands.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using Command Palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
