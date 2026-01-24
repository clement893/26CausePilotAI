'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, Modal, Input, Textarea } from '@/components/ui';
import { Plus, Edit, Trash2, Users, RefreshCw } from 'lucide-react';
import { listSegments, createSegment, updateSegment, deleteSegment, recalculateSegment } from '@/lib/api/donors';
import type { DonorSegment, DonorSegmentCreate, DonorSegmentUpdate } from '@modele/types';
import { useOrganization } from '@/hooks/useOrganization';

export default function SegmentsPage() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [segments, setSegments] = useState<DonorSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<DonorSegment | null>(null);
  const [formData, setFormData] = useState<DonorSegmentCreate>({
    name: '',
    description: '',
    criteria: {},
    is_automatic: false,
    color: '#3B82F6',
  });

  useEffect(() => {
    if (activeOrganization && !orgLoading) {
      loadSegments();
    }
  }, [activeOrganization, orgLoading]);

  const loadSegments = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const response = await listSegments({
        organizationId: activeOrganization.id,
        pageSize: 100,
      });
      setSegments(response.items);
    } catch (error) {
      console.error('Error loading segments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSegment(null);
    setFormData({
      name: '',
      description: '',
      criteria: {},
      is_automatic: false,
      color: '#3B82F6',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (segment: DonorSegment) => {
    setEditingSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || '',
      criteria: segment.criteria || {},
      is_automatic: segment.is_automatic,
      color: segment.color || '#3B82F6',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!activeOrganization) return;

    try {
      if (editingSegment) {
        const updateData: DonorSegmentUpdate = {
          name: formData.name,
          description: formData.description,
          criteria: formData.criteria,
          is_automatic: formData.is_automatic,
          color: formData.color,
        };
        await updateSegment(activeOrganization.id, editingSegment.id, updateData);
      } else {
        await createSegment(activeOrganization.id, formData);
      }
      setIsModalOpen(false);
      await loadSegments();
    } catch (error) {
      console.error('Error saving segment:', error);
    }
  };

  const handleDelete = async (segmentId: string) => {
    if (!activeOrganization) return;
    if (!confirm('Are you sure you want to delete this segment?')) return;

    try {
      await deleteSegment(activeOrganization.id, segmentId);
      await loadSegments();
    } catch (error) {
      console.error('Error deleting segment:', error);
    }
  };

  const handleRecalculate = async (segmentId: string) => {
    if (!activeOrganization) return;

    try {
      await recalculateSegment(activeOrganization.id, segmentId);
      await loadSegments();
    } catch (error) {
      console.error('Error recalculating segment:', error);
    }
  };

  if (orgLoading || isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </Container>
    );
  }

  if (!activeOrganization) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="text-center py-12">
          <p className="text-destructive">Veuillez sélectionner une organisation</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Segments</h1>
        <p className="text-muted-foreground">
          Créez et gérez les segments pour organiser vos donateurs
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Créer un segment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map(segment => (
          <Card key={segment.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-1">
                {segment.color && (
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{segment.name}</h3>
                  {segment.description && (
                    <p className="text-sm text-gray-500 mt-1">{segment.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Badge variant="default">
                <Users className="w-3 h-3 mr-1" />
                {segment.donor_count} donateurs
              </Badge>
              {segment.is_automatic && (
                <Badge variant="info">Automatique</Badge>
              )}
            </div>

            <div className="flex gap-2">
              {segment.is_automatic && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecalculate(segment.id)}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Recalculer
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(segment)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(segment.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun segment créé. Créez votre premier segment pour commencer.</p>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSegment ? 'Modifier le segment' : 'Créer un segment'}
      >
        <div className="space-y-4">
          <Input
            label="Nom"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Grands Donateurs"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description du segment"
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Couleur</label>
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_automatic"
              checked={formData.is_automatic}
              onChange={(e) => setFormData({ ...formData, is_automatic: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_automatic" className="text-sm">
              Segment automatique (basé sur des critères)
            </label>
          </div>

          {formData.is_automatic && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Les critères seront configurés après la création du segment.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!formData.name}>
              {editingSegment ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
