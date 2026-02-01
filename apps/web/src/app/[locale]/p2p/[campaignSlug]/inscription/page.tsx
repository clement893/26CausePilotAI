'use client';

/**
 * Page d'inscription comme participant P2P - Étape 6.2.1
 * Route : /p2p/[campaignSlug]/inscription
 * Permet de s'inscrire comme participant à une campagne P2P
 */

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Container, Card, Button, Input, Textarea, useToast } from '@/components/ui';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { getP2PCampaignBySlug } from '@/app/actions/p2p/getCampaignBySlug';
import { createP2PParticipant } from '@/app/actions/p2p/createParticipant';
import { logger } from '@/lib/logger';

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function P2PParticipantRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params?.campaignSlug as string;
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const [campaign, setCampaign] = useState<any | null>(null);
  const [teams] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    slug: '',
    personalMessage: '',
    goalAmount: '',
    teamId: '',
  });

  useEffect(() => {
    if (!campaignSlug) return;
    loadCampaign();
  }, [campaignSlug]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const result = await getP2PCampaignBySlug({ slug: campaignSlug });
      
      if (result.success && result.campaign) {
        setCampaign(result.campaign);
        
        // Charger les équipes si la campagne les permet
        if (result.campaign.allowTeams) {
          // TODO: Charger les équipes de la campagne
          // Pour l'instant, on laisse vide
        }
      } else {
        showErrorToast(result.error || 'Campagne non trouvée');
      }
    } catch (error) {
      logger.error('Error loading campaign', error);
      showErrorToast('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (field: 'firstName' | 'lastName', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      slug: prev.firstName && prev.lastName
        ? generateSlug(prev.firstName, prev.lastName)
        : generateSlug(
            field === 'firstName' ? value : prev.firstName,
            field === 'lastName' ? value : prev.lastName
          ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaign) {
      showErrorToast('Campagne non trouvée');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createP2PParticipant({
        campaignId: campaign.id,
        organizationId: campaign.organizationId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        slug: formData.slug,
        personalMessage: formData.personalMessage || undefined,
        goalAmount: formData.goalAmount ? parseFloat(formData.goalAmount) : undefined,
        teamId: formData.teamId || undefined,
      });

      if (result.success && result.participantId) {
        showSuccessToast('Inscription réussie !');
        router.push(`/p2p/${campaignSlug}/${formData.slug}`);
      } else {
        showErrorToast(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      logger.error('Error registering P2P participant', error);
      showErrorToast('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-primary mx-auto" />
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
        <h1 className="text-3xl font-bold text-white mb-2">Rejoindre la campagne</h1>
        <p className="text-gray-400">Créez votre page de collecte personnelle</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Prénom *
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleNameChange('firstName', e.target.value)}
                placeholder="Jean"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Nom *
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleNameChange('lastName', e.target.value)}
                placeholder="Dupont"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="jean@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Téléphone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Slug (URL) *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="jean-dupont"
                required
                pattern="[a-z0-9-]+"
              />
              <p className="text-xs text-gray-400 mt-1">
                Utilisé dans l'URL de votre page. Généré automatiquement depuis votre nom.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Message personnel
              </label>
              <Textarea
                value={formData.personalMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, personalMessage: e.target.value }))}
                placeholder="Pourquoi je collecte des fonds pour cette cause..."
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Objectif personnel (CAD)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.goalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, goalAmount: e.target.value }))}
                placeholder="1000"
              />
            </div>

            {campaign?.allowTeams && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rejoindre une équipe (optionnel)
                </label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-4 py-2 text-white"
                >
                  <option value="">Aucune équipe (participant individuel)</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              <UserPlus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Inscription...' : 'Créer ma page de collecte'}
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
