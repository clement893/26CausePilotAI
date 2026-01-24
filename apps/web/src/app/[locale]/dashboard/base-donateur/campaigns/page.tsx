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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Campagnes
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Gérez vos campagnes de collecte de fonds
          </p>
        </div>
        <Button variant="primary" className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
          <Plus className="w-4 h-4 mr-2" />
          Créer une campagne
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="p-8 text-center" elevated>
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Aucune campagne créée.</p>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Créer votre première campagne
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <div
              key={campaign.id}
              className={`stagger-fade-in opacity-0 stagger-delay-${Math.min(index + 1, 6)}`}
            >
              <CampaignCard
                campaign={campaign}
                stats={campaignStats[campaign.id]}
                onView={() => {
                  // TODO: Navigate to campaign detail page
                  console.log('View campaign:', campaign.id);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
