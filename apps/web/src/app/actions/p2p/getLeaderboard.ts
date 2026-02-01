/**
 * Action Serveur : Récupérer le Leaderboard P2P
 * 
 * Récupère le classement des participants et équipes d'une campagne P2P.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface GetP2PLeaderboardParams {
  campaignSlug: string;
  type?: 'participants' | 'teams' | 'both';
  limit?: number;
  organizationId?: string;
}

export interface LeaderboardParticipant {
  rank: number;
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  totalRaised: number;
  donationCount: number;
  goalAmount: number | null;
  progressPercentage: number;
  teamId: string | null;
  teamName: string | null;
  profileImage: string | null;
}

export interface LeaderboardTeam {
  rank: number;
  id: string;
  name: string;
  slug: string;
  totalRaised: number;
  memberCount: number;
  donationCount: number;
  goalAmount: number | null;
  progressPercentage: number;
}

export interface GetP2PLeaderboardResult {
  success: boolean;
  campaign?: {
    id: string;
    name: string;
    slug: string;
    allowTeams: boolean;
    allowIndividualParticipants: boolean;
  };
  participants?: LeaderboardParticipant[];
  teams?: LeaderboardTeam[];
  error?: string;
}

/**
 * Récupère le leaderboard d'une campagne P2P
 */
export async function getP2PLeaderboard(
  params: GetP2PLeaderboardParams
): Promise<GetP2PLeaderboardResult> {
  try {
    logger.info('Récupération du leaderboard P2P', {
      campaignSlug: params.campaignSlug,
      type: params.type || 'both',
    });

    // Récupérer la campagne
    const campaign = await prisma.p2PCampaign.findUnique({
      where: {
        slug: params.campaignSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        allowTeams: true,
        allowIndividualParticipants: true,
        organizationId: true,
      },
    });

    if (!campaign) {
      return {
        success: false,
        error: 'Campagne non trouvée',
      };
    }

    // Vérifier l'organizationId si fourni
    if (params.organizationId && campaign.organizationId !== params.organizationId) {
      return {
        success: false,
        error: 'Campagne non trouvée',
      };
    }

    const limit = params.limit || 100;
    const type = params.type || 'both';

    const result: GetP2PLeaderboardResult = {
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        allowTeams: campaign.allowTeams,
        allowIndividualParticipants: campaign.allowIndividualParticipants,
      },
    };

    // Récupérer les participants si demandé
    if (type === 'participants' || type === 'both') {
      const participants = await prisma.p2PParticipant.findMany({
        where: {
          campaignId: campaign.id,
          status: 'ACTIVE',
        },
        orderBy: {
          totalRaised: 'desc',
        },
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
          totalRaised: true,
          donationCount: true,
          goalAmount: true,
          teamId: true,
          profileImage: true,
          team: {
            select: {
              name: true,
            },
          },
        },
      });

      result.participants = participants.map((p, index) => {
        const totalRaised = Number(p.totalRaised);
        const goalAmount = p.goalAmount ? Number(p.goalAmount) : null;
        const progressPercentage = goalAmount && goalAmount > 0
          ? Math.min(100, (totalRaised / goalAmount) * 100)
          : 0;

        return {
          rank: index + 1,
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          slug: p.slug,
          totalRaised,
          donationCount: p.donationCount,
          goalAmount,
          progressPercentage,
          teamId: p.teamId,
          teamName: p.team?.name || null,
          profileImage: p.profileImage,
        };
      });
    }

    // Récupérer les équipes si demandé
    if ((type === 'teams' || type === 'both') && campaign.allowTeams) {
      const teams = await prisma.p2PTeam.findMany({
        where: {
          campaignId: campaign.id,
        },
        orderBy: {
          totalRaised: 'desc',
        },
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          totalRaised: true,
          memberCount: true,
          donationCount: true,
          goalAmount: true,
        },
      });

      result.teams = teams.map((t, index) => {
        const totalRaised = Number(t.totalRaised);
        const goalAmount = t.goalAmount ? Number(t.goalAmount) : null;
        const progressPercentage = goalAmount && goalAmount > 0
          ? Math.min(100, (totalRaised / goalAmount) * 100)
          : 0;

        return {
          rank: index + 1,
          id: t.id,
          name: t.name,
          slug: t.slug,
          totalRaised,
          memberCount: t.memberCount,
          donationCount: t.donationCount,
          goalAmount,
          progressPercentage,
        };
      });
    }

    return result;
  } catch (error) {
    logger.error('Erreur lors de la récupération du leaderboard P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
