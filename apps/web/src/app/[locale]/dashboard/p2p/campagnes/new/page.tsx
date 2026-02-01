'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Input, Textarea, useToast } from '@/components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { createP2PCampaign } from '@/app/actions/p2p';
import { logger } from '@/lib/logger';

export default function NewP2PCampaignPage() {
  const router = useRouter();
  const { activeOrganization } = useOrganization();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    startDate: '',
    endDate: '',
    goalAmount: '',
    goalParticipants: '',
    allowTeams: true,
    allowIndividualParticipants: true,
    minTeamSize: '',
    maxTeamSize: '',
    primaryColor: '#3B82F6',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;

    setIsSubmitting(true);
    try {
      const result = await createP2PCampaign({
        organizationId: activeOrganization.id,
        name: formData.name,
        description: formData.description || undefined,
        slug: formData.slug,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        goalAmount: formData.goalAmount ? parseFloat(formData.goalAmount) : undefined,
        goalParticipants: formData.goalParticipants ? parseInt(formData.goalParticipants) : undefined,
        allowTeams: formData.allowTeams,
        allowIndividualParticipants: formData.allowIndividualParticipants,
        minTeamSize: formData.minTeamSize ? parseInt(formData.minTeamSize) : undefined,
        maxTeamSize: formData.maxTeamSize ? parseInt(formData.maxTeamSize) : undefined,
        primaryColor: formData.primaryColor,
      });

      if (result.success && result.campaignId) {
        showSuccessToast('Campagne créée avec succès');
        router.push(`/dashboard/p2p/campagnes/${result.campaignId}`);
      } else {
        showErrorToast(result.error || 'Erreur lors de la création');
      }
    } catch (error) {
      logger.error('Error creating P2P campaign', error);
      showErrorToast('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Nouvelle campagne P2P</h1>
        <p className="text-gray-400">Créez une nouvelle campagne peer-to-peer</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Nom de la campagne *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Course pour la cause"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Slug (URL) *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="course-pour-la-cause"
                required
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-gray-400 mt-1">
                Utilisé dans l'URL de la campagne. Lettres minuscules, chiffres et tirets uniquement.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description de la campagne..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Date de début
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Date de fin
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Objectif de collecte (CAD)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.goalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, goalAmount: e.target.value }))}
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Objectif de participants
              </label>
              <Input
                type="number"
                min="0"
                value={formData.goalParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, goalParticipants: e.target.value }))}
                placeholder="100"
              />
            </div>

            <div className="md:col-span-2">
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowIndividualParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowIndividualParticipants: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-white">Permettre les participants individuels</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowTeams}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowTeams: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-white">Permettre la création d'équipes</span>
                </label>
              </div>
            </div>

            {formData.allowTeams && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Taille minimale d'équipe
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.minTeamSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, minTeamSize: e.target.value }))}
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Taille maximale d'équipe
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxTeamSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTeamSize: e.target.value }))}
                    placeholder="10"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Couleur principale
              </label>
              <Input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Création...' : 'Créer la campagne'}
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
