'use client';

/**
 * P2PCampaignCard - Étape 6.1.2
 * Carte pour afficher une campagne P2P dans la liste
 */

import { Card } from '@/components/ui';
import { Users, Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export interface P2PCampaignCardProps {
  campaign: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    goalAmount: number | null;
    totalRaised: number;
    participantCount: number;
    teamCount: number;
    createdAt: Date;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
  PAUSED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Active',
  PAUSED: 'En pause',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

function formatDate(date: Date | null): string {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function P2PCampaignCard({ campaign, onView, onEdit, onDelete }: P2PCampaignCardProps) {
  const progressPercentage = campaign.goalAmount && campaign.goalAmount > 0
    ? Math.min(100, (campaign.totalRaised / campaign.goalAmount) * 100)
    : 0;

  return (
    <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer" onClick={onView}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{campaign.name}</h3>
            {campaign.description && (
              <p className="text-sm text-[var(--text-secondary,#A0A0B0)] line-clamp-2">
                {campaign.description}
              </p>
            )}
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[campaign.status] || statusColors.DRAFT}`}>
            {statusLabels[campaign.status] || campaign.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[var(--text-tertiary,#6B6B7B)]" />
            <div>
              <p className="text-xs text-[var(--text-tertiary,#6B6B7B)]">Collecté</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(campaign.totalRaised)}</p>
            </div>
          </div>
          {campaign.goalAmount && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--text-tertiary,#6B6B7B)]" />
              <div>
                <p className="text-xs text-[var(--text-tertiary,#6B6B7B)]">Objectif</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(campaign.goalAmount)}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--text-tertiary,#6B6B7B)]" />
            <div>
              <p className="text-xs text-[var(--text-tertiary,#6B6B7B)]">Participants</p>
              <p className="text-sm font-semibold text-white">{campaign.participantCount}</p>
            </div>
          </div>
          {campaign.teamCount > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--text-tertiary,#6B6B7B)]" />
              <div>
                <p className="text-xs text-[var(--text-tertiary,#6B6B7B)]">Équipes</p>
                <p className="text-sm font-semibold text-white">{campaign.teamCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {campaign.goalAmount && campaign.goalAmount > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[var(--text-tertiary,#6B6B7B)] mb-1">
              <span>Progression</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--background-tertiary,#1C1C26)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary,#6B6B7B)]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Début: {formatDate(campaign.startDate)}</span>
          </div>
          {campaign.endDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Fin: {formatDate(campaign.endDate)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-xs text-[var(--text-tertiary,#6B6B7B)] hover:text-white transition-colors"
              >
                Modifier
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
                    onDelete();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
