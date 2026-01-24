'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { Container, Card, Button } from '@/components/ui';
import { Plus, Target } from 'lucide-react';
import { listCampaigns, getCampaignStats } from '@/lib/api/donors';
import type { Campaign, CampaignStats } from '@modele/types';
import { useOrganization } from '@/hooks/useOrganization';
import { CampaignCard } from '@/components/donors';
import Link from 'next/link';

export default function CampaignsPage() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<Record<string, CampaignStats>>({});
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
      const response = await listCampaigns({
        organizationId: activeOrganization.id,
        pageSize: 100,
      });
      setCampaigns(response.items);

      // Load stats for each campaign
      const statsPromises = response.items.map(campaign =>
        getCampaignStats(activeOrganization.id, campaign.id)
          .then(stats => ({ campaignId: campaign.id, stats }))
          .catch(() => null)
      );
      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, CampaignStats> = {};
      statsResults.forEach(result => {
        if (result) {
          statsMap[result.campaignId] = result.stats;
        }
      });
      setCampaignStats(statsMap);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setIsLoading(false);
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Campagnes</h1>
          <p className="text-muted-foreground">
            Gérez vos campagnes de collecte de fonds
          </p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Créer une campagne
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Aucune campagne créée.</p>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Créer votre première campagne
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              stats={campaignStats[campaign.id]}
              onView={() => {
                // TODO: Navigate to campaign detail page
                console.log('View campaign:', campaign.id);
              }}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
