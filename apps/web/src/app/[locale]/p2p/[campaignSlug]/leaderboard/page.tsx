'use client';

/**
 * Page publique du Leaderboard P2P - Étape 6.2.3
 * Route : /p2p/[campaignSlug]/leaderboard
 * Affiche le classement des participants et équipes d'une campagne P2P
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Card, Button, LoadingSkeleton, useToast } from '@/components/ui';
import { Trophy, Users, Target, DollarSign, Medal, Award } from 'lucide-react';
import { getP2PLeaderboard } from '@/app/actions/p2p/getLeaderboard';
import type { LeaderboardParticipant, LeaderboardTeam } from '@/app/actions/p2p/getLeaderboard';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

function getRankIcon(rank: number): React.ReactNode {
  if (rank === 1) {
    return <Trophy className="w-6 h-6 text-yellow-400" />;
  }
  if (rank === 2) {
    return <Medal className="w-6 h-6 text-gray-300" />;
  }
  if (rank === 3) {
    return <Award className="w-6 h-6 text-orange-400" />;
  }
  return <span className="text-lg font-bold text-white/60">#{rank}</span>;
}

export default function P2PLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params?.campaignSlug as string;
  const { error: showErrorToast } = useToast();

  const [campaign, setCampaign] = useState<any>(null);
  const [participants, setParticipants] = useState<LeaderboardParticipant[]>([]);
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [activeTab, setActiveTab] = useState<'participants' | 'teams'>('participants');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (campaignSlug) {
      loadLeaderboard();
    }
  }, [campaignSlug]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const result = await getP2PLeaderboard({
        campaignSlug,
        type: 'both',
        limit: 100,
      });

      if (result.success) {
        setCampaign(result.campaign);
        setParticipants(result.participants || []);
        setTeams(result.teams || []);

        // Définir l'onglet actif par défaut
        if (result.campaign?.allowTeams && result.teams && result.teams.length > 0) {
          setActiveTab('teams');
        } else {
          setActiveTab('participants');
        }
      } else {
        showErrorToast(result.error || 'Erreur lors du chargement du leaderboard');
      }
    } catch (error) {
      logger.error('Error loading leaderboard', error);
      showErrorToast('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <LoadingSkeleton variant="card" count={3} />
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container className="py-8 lg:py-12">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Campagne non trouvée</h2>
            <p className="text-gray-400 mb-6">
              Cette campagne n'existe pas ou n'est plus disponible.
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Classement</h1>
        <p className="text-gray-400">Campagne : {campaign.name}</p>
      </div>

      {/* Onglets */}
      {campaign.allowTeams && teams.length > 0 && (
        <div className="mb-6 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'participants'
                ? 'text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Participants ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'teams'
                ? 'text-white border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Équipes ({teams.length})
          </button>
        </div>
      )}

      {/* Classement des participants */}
      {activeTab === 'participants' && (
        <Card>
          <div className="p-6">
            {participants.length > 0 ? (
              <div className="space-y-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      {getRankIcon(participant.rank)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          {participant.firstName} {participant.lastName}
                        </h3>
                        {participant.teamName && (
                          <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                            {participant.teamName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(participant.totalRaised)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {participant.donationCount} dons
                        </span>
                        {participant.goalAmount && (
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {participant.progressPercentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {participant.goalAmount && (
                        <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                            style={{ width: `${participant.progressPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/p2p/${campaignSlug}/${participant.slug}`)}
                      >
                        Voir la page
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucun participant pour le moment</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Classement des équipes */}
      {activeTab === 'teams' && (
        <Card>
          <div className="p-6">
            {teams.length > 0 ? (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      {getRankIcon(team.rank)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{team.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(team.totalRaised)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {team.memberCount} membres
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {team.donationCount} dons
                        </span>
                        {team.goalAmount && (
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {team.progressPercentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {team.goalAmount && (
                        <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                            style={{ width: `${team.progressPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/p2p/${campaignSlug}/equipe/${team.slug}`)}
                      >
                        Voir l'équipe
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucune équipe pour le moment</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </Container>
  );
}
