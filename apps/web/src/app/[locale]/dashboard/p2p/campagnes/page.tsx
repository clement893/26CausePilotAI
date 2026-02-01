'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Button, useToast } from '@/components/ui';
import { Plus, Target } from 'lucide-react';
import { useOrganization } from '@/hooks/useOrganization';
import { listP2PCampaigns, deleteP2PCampaign } from '@/app/actions/p2p';
// import { P2PCampaignList } from '@/components/p2p/P2PCampaignList';
import { LoadingSkeleton } from '@/components/ui';
import { logger } from '@/lib/logger';

export default function P2PCampagnesPage() {
  const router = useRouter();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeOrganization && !orgLoading) {
      loadCampaigns();
    }
  }, [activeOrganization, orgLoading]);

  const loadCampaigns = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const result = await listP2PCampaigns({
        organizationId: activeOrganization.id,
        pageSize: 100,
      });

      if (result.success && result.campaigns) {
        setCampaigns(result.campaigns);
      } else {
        showErrorToast(result.error || 'Erreur lors du chargement des campagnes');
      }
    } catch (error) {
      logger.error('Error loading P2P campaigns', error);
      showErrorToast('Erreur lors du chargement des campagnes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    router.push('/dashboard/p2p/campagnes/new');
  };

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/dashboard/p2p/campagnes/${campaignId}`);
  };

  const handleCampaignEdit = (campaignId: string) => {
    router.push(`/dashboard/p2p/campagnes/${campaignId}/edit`);
  };

  const handleCampaignDelete = async (campaignId: string) => {
    if (!activeOrganization) return;

    try {
      const result = await deleteP2PCampaign({
        campaignId,
        organizationId: activeOrganization.id,
      });

      if (result.success) {
        showSuccessToast('Campagne supprimée avec succès');
        loadCampaigns();
      } else {
        showErrorToast(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      logger.error('Error deleting P2P campaign', error);
      showErrorToast('Erreur lors de la suppression');
    }
  };

  if (orgLoading || isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="mb-8 h-16 animate-pulse rounded-lg bg-[#1C1C26]/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Campagnes P2P
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Gérez vos campagnes peer-to-peer de collecte de fonds
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          Créer une campagne
        </Button>
      </div>

      <P2PCampaignList
        campaigns={campaigns}
        isLoading={isLoading}
        onCreateClick={handleCreate}
        onCampaignClick={handleCampaignClick}
        onCampaignEdit={handleCampaignEdit}
        onCampaignDelete={handleCampaignDelete}
      />
    </Container>
  );
}
