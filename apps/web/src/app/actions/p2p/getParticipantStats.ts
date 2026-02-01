/**
 * Action Serveur : Récupérer les Statistiques d'un Participant P2P
 * 
 * Récupère les statistiques détaillées d'un participant pour le tableau de bord ambassadeur.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface GetP2PParticipantStatsParams {
  participantId: string;
  organizationId: string;
}

export interface P2PParticipantStats {
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    slug: string;
    personalMessage: string | null;
    goalAmount: number | null;
    totalRaised: number;
    donationCount: number;
    status: string;
    profileImage: string | null;
    createdAt: Date;
  };
  campaign: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    goalAmount: number | null;
    totalRaised: number;
    startDate: Date | null;
    endDate: Date | null;
    status: string;
  };
  team: {
    id: string;
    name: string;
    slug: string;
    totalRaised: number;
    memberCount: number;
  } | null;
  progress: {
    percentage: number;
    remaining: number;
    daysRemaining: number | null;
  };
  recentDonations: Array<{
    id: string;
    amount: number;
    donorName: string | null;
    donorEmail: string | null;
    message: string | null;
    createdAt: Date;
    paymentStatus: string;
  }>;
  donationTrends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  topDonors: Array<{
    donorName: string | null;
    donorEmail: string | null;
    totalAmount: number;
    donationCount: number;
  }>;
  shareStats: {
    totalShares: number;
    sharesByPlatform: Record<string, number>;
  };
}

export interface GetP2PParticipantStatsResult {
  success: boolean;
  stats?: P2PParticipantStats;
  error?: string;
}

/**
 * Récupère les statistiques complètes d'un participant P2P
 */
export async function getP2PParticipantStats(
  params: GetP2PParticipantStatsParams
): Promise<GetP2PParticipantStatsResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Récupération des statistiques du participant P2P', {
      participantId: params.participantId,
      organizationId: params.organizationId,
    });

    // Récupérer le participant avec sa campagne et équipe
    const participant = await prisma.p2PParticipant.findFirst({
      where: {
        id: params.participantId,
        campaign: {
          organizationId: params.organizationId,
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            goalAmount: true,
            totalRaised: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
            totalRaised: true,
            memberCount: true,
          },
        },
      },
    });

    if (!participant) {
      return {
        success: false,
        error: 'Participant non trouvé',
      };
    }

    // Récupérer les dons récents (derniers 10)
    // Note: Les dons sont liés via metadata dans le système de dons
    // Pour l'instant, on simule avec des données vides
    // TODO: Créer une vraie relation ou requête pour récupérer les dons
    const recentDonations: P2PParticipantStats['recentDonations'] = [];
    const donationTrends: P2PParticipantStats['donationTrends'] = [];
    const topDonors: P2PParticipantStats['topDonors'] = [];

    // Calculer la progression
    const goalAmount = participant.goalAmount ? Number(participant.goalAmount) : null;
    const totalRaised = Number(participant.totalRaised);
    const percentage = goalAmount && goalAmount > 0
      ? Math.min(100, (totalRaised / goalAmount) * 100)
      : 0;
    const remaining = goalAmount ? Math.max(0, goalAmount - totalRaised) : 0;

    // Calculer les jours restants
    let daysRemaining: number | null = null;
    if (participant.campaign.endDate) {
      const endDate = new Date(participant.campaign.endDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Statistiques de partage (à implémenter avec une table de tracking)
    const shareStats = {
      totalShares: 0,
      sharesByPlatform: {} as Record<string, number>,
    };

    return {
      success: true,
      stats: {
        participant: {
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          slug: participant.slug,
          personalMessage: participant.personalMessage,
          goalAmount: goalAmount,
          totalRaised: totalRaised,
          donationCount: participant.donationCount,
          status: participant.status,
          profileImage: participant.profileImage,
          createdAt: participant.createdAt,
        },
        campaign: {
          id: participant.campaign.id,
          name: participant.campaign.name,
          slug: participant.campaign.slug,
          description: participant.campaign.description,
          goalAmount: participant.campaign.goalAmount ? Number(participant.campaign.goalAmount) : null,
          totalRaised: Number(participant.campaign.totalRaised),
          startDate: participant.campaign.startDate,
          endDate: participant.campaign.endDate,
          status: participant.campaign.status,
        },
        team: participant.team ? {
          id: participant.team.id,
          name: participant.team.name,
          slug: participant.team.slug,
          totalRaised: Number(participant.team.totalRaised),
          memberCount: participant.team.memberCount,
        } : null,
        progress: {
          percentage,
          remaining,
          daysRemaining,
        },
        recentDonations,
        donationTrends,
        topDonors,
        shareStats,
      },
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques du participant P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
