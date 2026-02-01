'use client';

/**
 * P2PCampaignList - Étape 6.1.2
 * Liste des campagnes P2P avec empty state
 */

import { P2PCampaignCard } from './P2PCampaignCard';
import { Card, Button, LoadingSkeleton } from '@/components/ui';
import { Plus, Target } from 'lucide-react';
import type { P2PCampaignCardProps } from './P2PCampaignCard';

export interface P2PCampaignListProps {
  campaigns: P2PCampaignCardProps['campaign'][];
  isLoading?: boolean;
  onCreateClick?: () => void;
  onCampaignClick?: (campaignId: string) => void;
  onCampaignEdit?: (campaignId: string) => void;
  onCampaignDelete?: (campaignId: string) => void;
}

export function P2PCampaignList({
  campaigns,
  isLoading = false,
  onCreateClick,
  onCampaignClick,
  onCampaignEdit,
  onCampaignDelete,
}: P2PCampaignListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LoadingSkeleton variant="card" count={6} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="p-12 text-center" elevated>
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Target className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Aucune campagne P2P créée</h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Créez votre première campagne peer-to-peer pour mobiliser vos supporters et collecter des fonds.
        </p>
        {onCreateClick && (
          <Button variant="primary" onClick={onCreateClick} className="shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Créer votre première campagne P2P
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign, index) => (
        <div
          key={campaign.id}
          className={`stagger-fade-in opacity-0 stagger-delay-${Math.min(index + 1, 6)}`}
        >
          <P2PCampaignCard
            campaign={campaign}
            onView={() => onCampaignClick?.(campaign.id)}
            onEdit={() => onCampaignEdit?.(campaign.id)}
            onDelete={() => onCampaignDelete?.(campaign.id)}
          />
        </div>
      ))}
    </div>
  );
}
