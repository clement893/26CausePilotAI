/**
 * CampaignCard Component
 * 
 * Component for displaying campaign information in a card format.
 */

'use client';

import { Card, Badge, Button, Progress } from '@/components/ui';
import { Target, Users, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import type { Campaign, CampaignStats } from '@modele/types';
import { format } from 'date-fns';
import Link from 'next/link';

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

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{campaign.name}</h3>
            <Badge className={statusColors[campaign.status]}>
              {campaign.status}
            </Badge>
          </div>
          {campaign.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {campaign.description}
            </p>
          )}
        </div>
        {campaign.external_url && (
          <a
            href={campaign.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Progress */}
      {campaign.goal_amount && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600">
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
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
            <div className="text-sm font-medium">{campaign.donor_count}</div>
            <div className="text-xs text-gray-500">Donors</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium">{campaign.donation_count}</div>
            <div className="text-xs text-gray-500">Donations</div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        {campaign.start_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Starts: {format(new Date(campaign.start_date), 'MMM d, yyyy')}
          </div>
        )}
        {campaign.end_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Ends: {format(new Date(campaign.end_date), 'MMM d, yyyy')}
          </div>
        )}
      </div>

      {/* Days Remaining */}
      {isActive && daysRemaining !== undefined && daysRemaining !== null && (
        <div className="mb-4">
          <Badge variant="secondary">
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Ended'}
          </Badge>
        </div>
      )}

      {/* Actions */}
      {onView && (
        <Button variant="outline" onClick={onView} className="w-full">
          View Details
        </Button>
      )}
    </Card>
  );
}
