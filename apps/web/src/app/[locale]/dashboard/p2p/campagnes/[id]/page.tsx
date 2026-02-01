'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Card, Button, LoadingSkeleton, useToast } from '@/components/ui';
import { ArrowLeft, Edit, Users, Target, DollarSign } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { getP2PCampaign } from '@/app/actions/p2p';
import { logger } from '@/lib/logger';
import type { P2PCampaignDetails } from '@/app/actions/p2p';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

function formatDate(date: Date | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function P2PCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { error: showErrorToast } = useToast();
  const [campaign, setCampaign] = useState<P2PCampaignDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeOrganization && campaignId) {
      loadCampaign();
    }
  }, [activeOrganization, campaignId]);

  const loadCampaign = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const result = await getP2PCampaign({
        campaignId,
        organizationId: activeOrganization.id,
      });

      if (result.success && result.campaign) {
        setCampaign(result.campaign);
      } else {
        showErrorToast(result.error || 'Campagne non trouvée');
        router.push('/dashboard/p2p/campagnes');
      }
    } catch (error) {
      logger.error('Error loading P2P campaign', error);
      showErrorToast('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  if (orgLoading || isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <LoadingSkeleton variant="card" count={3} />
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container className="py-8 lg:py-12">
        <Card className="border-destructive">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">Campagne non trouvée</h3>
            <p className="text-destructive mb-6">La campagne demandée n'existe pas ou a été supprimée.</p>
            <Button variant="outline" onClick={() => router.push('/dashboard/p2p/campagnes')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const progressPercentage = campaign.goalAmount && campaign.goalAmount > 0
    ? Math.min(100, (campaign.totalRaised / campaign.goalAmount) * 100)
    : 0;

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/dashboard/p2p/campagnes')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
            <p className="text-gray-400">{campaign.description || 'Aucune description'}</p>
          </div>
          <Button variant="primary" onClick={() => router.push(`/dashboard/p2p/campagnes/${campaignId}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Montant collecté</h3>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(campaign.totalRaised)}</p>
            {campaign.goalAmount && (
              <p className="text-xs text-[var(--text-tertiary,#6B6B7B)] mt-1">
                sur {formatCurrency(campaign.goalAmount)}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Participants</h3>
            </div>
            <p className="text-2xl font-bold text-white">{campaign.participantCount}</p>
            {campaign.goalParticipants && (
              <p className="text-xs text-[var(--text-tertiary,#6B6B7B)] mt-1">
                objectif: {campaign.goalParticipants}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Équipes</h3>
            </div>
            <p className="text-2xl font-bold text-white">{campaign.teamCount}</p>
            <p className="text-xs text-[var(--text-tertiary,#6B6B7B)] mt-1">
              {campaign.donationCount} dons reçus
            </p>
          </div>
        </Card>
      </div>

      {campaign.goalAmount && campaign.goalAmount > 0 && (
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between text-sm text-[var(--text-secondary,#A0A0B0)] mb-2">
              <span>Progression vers l'objectif</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-[var(--background-tertiary,#1C1C26)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary,#A0A0B0)]">Statut</span>
              <span className="text-white">{campaign.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary,#A0A0B0)]">Slug</span>
              <span className="text-white font-mono text-xs">{campaign.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary,#A0A0B0)]">Date de début</span>
              <span className="text-white">{formatDate(campaign.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary,#A0A0B0)]">Date de fin</span>
              <span className="text-white">{formatDate(campaign.endDate)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary,#A0A0B0)]">Participants individuels</span>
              <span className="text-white">{campaign.allowIndividualParticipants ? 'Oui' : 'Non'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary,#A0A0B0)]">Équipes autorisées</span>
              <span className="text-white">{campaign.allowTeams ? 'Oui' : 'Non'}</span>
            </div>
            {campaign.allowTeams && (
              <>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary,#A0A0B0)]">Taille min. équipe</span>
                  <span className="text-white">{campaign.minTeamSize || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary,#A0A0B0)]">Taille max. équipe</span>
                  <span className="text-white">{campaign.maxTeamSize || '—'}</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </Container>
  );
}
