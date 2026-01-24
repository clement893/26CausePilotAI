/**
 * TagManager Component
 * 
 * Component for managing tags (create, edit, delete).
 * Used in settings or tag management pages.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import { Plus, Edit, Trash2, Tag as TagIcon, Save, X } from 'lucide-react';
import { listTags, createTag, updateTag, deleteTag } from '@/lib/api/donors';
import type { DonorTag, DonorTagCreate, DonorTagUpdate } from '@modele/types';
import { useOrganization } from '@/hooks/useOrganization';

interface TagManagerProps {
  className?: string;
}

export function TagManager({ className }: TagManagerProps) {
  const { activeOrganization } = useOrganization();
  const [tags, setTags] = useState<DonorTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<DonorTag | null>(null);
  const [formData, setFormData] = useState<DonorTagCreate>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '',
  });

  useEffect(() => {
    if (activeOrganization) {
      loadTags();
    }
  }, [activeOrganization]);

  const loadTags = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const response = await listTags({
        organizationId: activeOrganization.id,
        pageSize: 100,
      });
      setTags(response.items);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (tag: DonorTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#3B82F6',
      icon: tag.icon || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!activeOrganization) return;

    try {
      if (editingTag) {
        const updateData: DonorTagUpdate = {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        };
        await updateTag(activeOrganization.id, editingTag.id, updateData);
      } else {
        await createTag(activeOrganization.id, formData);
      }
      setIsModalOpen(false);
      await loadTags();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!activeOrganization) return;
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      await deleteTag(activeOrganization.id, tagId);
      await loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  if (isLoading) {
    return <div className={className}>Loading tags...</div>;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Manage Tags</h2>
        <Button onClick={handleCreate} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Tag
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map(tag => (
          <Card key={tag.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1">
                {tag.color && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{tag.name}</h3>
                  {tag.description && (
                    <p className="text-sm text-gray-500 mt-1">{tag.description}</p>
                  )}
                  <Badge variant="default" className="mt-2">
                    {tag.donor_count} donors
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(tag)}
                  aria-label={`Edit ${tag.name}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(tag.id)}
                  aria-label={`Delete ${tag.name}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {tags.length === 0 && (
        <Card className="p-8 text-center">
          <TagIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No tags yet. Create your first tag to get started.</p>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Major Donor"
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 rounded border"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <Input
            label="Icon (optional)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="e.g., star, heart"
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!formData.name}>
              <Save className="w-4 h-4 mr-2" />
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
