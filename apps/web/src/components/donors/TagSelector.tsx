/**
 * TagSelector Component
 * 
 * Component for selecting and assigning tags to donors.
 * Displays available tags and allows multi-selection.
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge, Button } from '@/components/ui';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { listTags, assignTagToDonor, removeTagFromDonor } from '@/lib/api/donors';
import type { DonorTag } from '@modele/types';
import { useOrganization } from '@/hooks/useOrganization';

interface TagSelectorProps {
  donorId: string;
  assignedTagIds?: string[];
  onTagsChange?: (tagIds: string[]) => void;
  className?: string;
}

export function TagSelector({ donorId, assignedTagIds = [], onTagsChange, className }: TagSelectorProps) {
  const { activeOrganization } = useOrganization();
  const [availableTags, setAvailableTags] = useState<DonorTag[]>([]);
  const [assignedTags, setAssignedTags] = useState<DonorTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (activeOrganization) {
      loadTags();
    }
  }, [activeOrganization]);

  useEffect(() => {
    if (assignedTagIds.length > 0 && availableTags.length > 0) {
      const assigned = availableTags.filter(tag => assignedTagIds.includes(tag.id));
      setAssignedTags(assigned);
    } else {
      setAssignedTags([]);
    }
  }, [assignedTagIds, availableTags]);

  const loadTags = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const response = await listTags({
        organizationId: activeOrganization.id,
        pageSize: 100,
      });
      setAvailableTags(response.items);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTag = async (tagId: string) => {
    if (!activeOrganization) return;

    try {
      await assignTagToDonor(activeOrganization.id, donorId, tagId);
      const tag = availableTags.find(t => t.id === tagId);
      if (tag) {
        const newAssignedTags = [...assignedTags, tag];
        setAssignedTags(newAssignedTags);
        onTagsChange?.(newAssignedTags.map(t => t.id));
      }
      await loadTags(); // Refresh to update counts
    } catch (error) {
      console.error('Error assigning tag:', error);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!activeOrganization) return;

    try {
      await removeTagFromDonor(activeOrganization.id, donorId, tagId);
      const newAssignedTags = assignedTags.filter(t => t.id !== tagId);
      setAssignedTags(newAssignedTags);
      onTagsChange?.(newAssignedTags.map(t => t.id));
      await loadTags(); // Refresh to update counts
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const unassignedTags = availableTags.filter(
    tag => !assignedTags.some(assigned => assigned.id === tag.id)
  );

  if (isLoading) {
    return <div className={className}>Loading tags...</div>;
  }

  return (
    <div className={className}>
      {/* Assigned Tags */}
      {assignedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {assignedTags.map(tag => (
            <Badge
              key={tag.id}
              variant="default"
              style={tag.color ? { backgroundColor: tag.color, color: 'white' } : undefined}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            >
              {tag.icon && <TagIcon className="w-3.5 h-3.5" />}
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag.name} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Tag Button */}
      {unassignedTags.length > 0 && (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Ajouter un tag
          </Button>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-72 glass-effect bg-[#1C1C26] border-2 border-gray-800 rounded-lg shadow-xl p-2 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                {unassignedTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      handleAssignTag(tag.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#252532] hover:text-white rounded-md flex items-center gap-3 transition-all duration-150 group"
                  >
                    {tag.color && (
                      <div
                        className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform border border-gray-700"
                        style={{ backgroundColor: tag.color }}
                      />
                    )}
                    <div className="flex-1">
                      <span className="font-medium text-white">{tag.name}</span>
                      {tag.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{tag.description}</p>
                      )}
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {unassignedTags.length === 0 && assignedTags.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-lg glass-effect bg-[#1C1C26]">
          <TagIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aucun tag disponible</p>
        </div>
      )}
    </div>
  );
}
