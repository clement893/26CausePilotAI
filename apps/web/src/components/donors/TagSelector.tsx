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
      <div className="flex flex-wrap gap-2 mb-3">
        {assignedTags.map(tag => (
          <Badge
            key={tag.id}
            variant="default"
            style={tag.color ? { backgroundColor: tag.color, color: 'white' } : undefined}
            className="flex items-center gap-1"
          >
            {tag.icon && <TagIcon className="w-3 h-3" />}
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-1 hover:bg-black/20 rounded-full p-0.5"
              aria-label={`Remove ${tag.name} tag`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add Tag Button */}
      {unassignedTags.length > 0 && (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tag
          </Button>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 max-h-64 overflow-y-auto">
              {unassignedTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    handleAssignTag(tag.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                >
                  {tag.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  <span>{tag.name}</span>
                  {tag.description && (
                    <span className="text-xs text-gray-500 ml-auto">{tag.description}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {unassignedTags.length === 0 && assignedTags.length === 0 && (
        <p className="text-sm text-gray-500">No tags available</p>
      )}
    </div>
  );
}
