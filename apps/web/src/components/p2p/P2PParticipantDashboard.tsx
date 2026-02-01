'use client';

/**
 * Composant Tableau de bord Participant P2P
 * 
 * Affiche les statistiques, graphiques et outils de partage pour un participant P2P
 */

import { Card, Button, StatsCard } from '@/components/ui';
import { Share2, ExternalLink, Users, Target, DollarSign, Calendar, Copy, Mail } from 'lucide-react';
import type { P2PParticipantStats } from '@/app/actions/p2p/getParticipantStats';

interface P2PParticipantDashboardProps {
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    slug: string;
    campaign: {
      id: string;
      name: string;
      slug: string;
    };
  };
  stats: P2PParticipantStats;
  onShare: (participant: any, platform?: string) => void;
  getParticipantUrl: (participant: any) => string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-CA', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function P2PParticipantDashboard({
  participant,
  stats,
  onShare,
  getParticipantUrl,
}: P2PParticipantDashboardProps) {
  const participantUrl = getParticipantUrl(participant);
  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${participantUrl}`
    : participantUrl;

  return (
    <div className="space-y-6">
      {/* En-tête avec actions rapides */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {stats.participant.firstName} {stats.participant.lastName}
              </h2>
              <p className="text-gray-400">Campagne : {stats.campaign.name}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(fullUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir ma page
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onShare(participant)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>

          {/* Barre de progression */}
          {stats.participant.goalAmount && stats.participant.goalAmount > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progression vers l'objectif</span>
                <span>{stats.progress.percentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[var(--background-tertiary,#1C1C26)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                  style={{ width: `${stats.progress.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{formatCurrency(stats.participant.totalRaised)} collecté</span>
                <span>{formatCurrency(stats.progress.remaining)} restant</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Montant collecté"
          value={formatCurrency(stats.participant.totalRaised)}
          icon={<DollarSign className="w-5 h-5" />}
          className="bg-blue-500/20 border-blue-500/30"
        />
        <StatsCard
          title="Nombre de dons"
          value={stats.participant.donationCount.toString()}
          icon={<Users className="w-5 h-5" />}
          className="bg-green-500/20 border-green-500/30"
        />
        {stats.participant.goalAmount && (
          <StatsCard
            title="Objectif"
            value={formatCurrency(stats.participant.goalAmount)}
            icon={<Target className="w-5 h-5" />}
            className="bg-purple-500/20 border-purple-500/30"
          />
        )}
        {stats.progress.daysRemaining !== null && (
          <StatsCard
            title="Jours restants"
            value={stats.progress.daysRemaining.toString()}
            icon={<Calendar className="w-5 h-5" />}
            className="bg-orange-500/20 border-orange-500/30"
          />
        )}
      </div>

      {/* Informations de l'équipe */}
      {stats.team && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Mon équipe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Nom de l'équipe</p>
                <p className="text-white font-semibold">{stats.team.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Montant collecté par l'équipe</p>
                <p className="text-white font-semibold">{formatCurrency(stats.team.totalRaised)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Membres</p>
                <p className="text-white font-semibold">{stats.team.memberCount}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Outils de partage */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Partager ma page</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5">
              <input
                type="text"
                readOnly
                value={fullUrl}
                className="flex-1 bg-transparent text-white text-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(participant, 'copy')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(participant, 'email')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Par email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShare(participant)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Dons récents */}
      {stats.recentDonations.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Dons récents</h3>
            <div className="space-y-3">
              {stats.recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex justify-between items-center p-3 rounded-lg border border-white/10 bg-white/5"
                >
                  <div>
                    <p className="text-white font-semibold">
                      {donation.donorName || 'Donateur anonyme'}
                    </p>
                    {donation.message && (
                      <p className="text-sm text-gray-400 mt-1">{donation.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{formatCurrency(donation.amount)}</p>
                    <p className="text-xs text-gray-500">{donation.paymentStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Message si aucun don */}
      {stats.recentDonations.length === 0 && (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-400">Aucun don reçu pour le moment</p>
            <p className="text-sm text-gray-500 mt-2">
              Partagez votre page pour commencer à collecter des fonds !
            </p>
          </div>
        </Card>
      )}

      {/* Graphiques et tendances */}
      {stats.donationTrends.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tendances des dons</h3>
            <div className="space-y-2">
              {stats.donationTrends.map((trend, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-400">{trend.date}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 bg-primary rounded"
                        style={{
                          width: `${(trend.amount / Math.max(...stats.donationTrends.map(t => t.amount))) * 100}%`,
                        }}
                      />
                      <span className="text-sm text-white ml-2">
                        {formatCurrency(trend.amount)} ({trend.count} dons)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
