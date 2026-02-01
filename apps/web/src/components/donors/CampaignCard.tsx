/**
 * CampaignCard Component
 * 
 * Component for displaying campaign information in a card format.
 */

'use client';

import { Card, Badge, Button, Progress } from '@/components/ui';
import { Users, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import type { Campaign, CampaignStats } from '@modele/types';

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

interface CampaignCardProps {
  campaign: Campaign;
  stats?: CampaignStats;
  className?: string;
  onView?: () => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function CampaignCard({ campaign, stats, className, onView }: CampaignCardProps) {
  const progress = stats?.progress_percentage || campaign.goal_amount 
    ? (parseFloat(campaign.total_raised) / parseFloat(campaign.goal_amount || '1')) * 100 
    : 0;

  const isActive = campaign.status === 'active';
  const daysRemaining = stats?.days_remaining;

  const statusBadgeVariants: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
    draft: 'default',
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'error',
  };

  return (
    <Card variant="glass" className={`p-6 border border-gray-800 hover-lift ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
            <Badge variant={statusBadgeVariants[campaign.status] || 'default'}>
              {campaign.status}
            </Badge>
          </div>
          {campaign.description && (
            <p className="text-sm text-gray-400 mb-4">
              {campaign.description}
            </p>
          )}
        </div>
        {campaign.external_url && (
          <a
            href={campaign.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Progress */}
      {campaign.goal_amount && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white">Progress</span>
            <span className="text-sm text-gray-400">
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>${parseFloat(campaign.total_raised).toLocaleString()}</span>
            <span>${parseFloat(campaign.goal_amount).toLocaleString()} goal</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-white">{campaign.donor_count}</div>
            <div className="text-xs text-gray-400">Donors</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-white">{campaign.donation_count}</div>
            <div className="text-xs text-gray-400">Donations</div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
        {campaign.start_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Starts: {formatDate(new Date(campaign.start_date))}
          </div>
        )}
        {campaign.end_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Ends: {formatDate(new Date(campaign.end_date))}
          </div>
        )}
      </div>

      {/* Days Remaining */}
      {isActive && daysRemaining !== undefined && daysRemaining !== null && (
        <div className="mb-4">
          <Badge variant="default">
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Ended'}
          </Badge>
        </div>
      )}

      {/* Actions */}
      {onView && (
        <Button variant="outline" onClick={onView} className="w-full border-gray-700 text-gray-300 hover:bg-[#252532]">
          View Details
        </Button>
      )}
    </Card>
  );
}
