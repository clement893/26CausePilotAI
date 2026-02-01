/**
 * Action Serveur : Récupérer un Participant P2P
 * 
 * Récupère les détails d'un participant P2P par slug de campagne et slug de participant.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface GetP2PParticipantParams {
  campaignSlug: string;
  participantSlug: string;
}

export interface P2PParticipantDetails {
  id: string;
  campaignId: string;
  campaign: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    goalAmount: number | null;
    primaryColor: string | null;
    coverImage: string | null;
    logo: string | null;
    organizationId: string;
  };
  teamId: string | null;
  team: {
    id: string;
    name: string;
    slug: string;
  } | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  slug: string;
  personalMessage: string | null;
  goalAmount: number | null;
  status: string;
  totalRaised: number;
  donationCount: number;
  profileImage: string | null;
}

export interface GetP2PParticipantResult {
  success: boolean;
  participant?: P2PParticipantDetails;
  error?: string;
}

/**
 * Récupère un participant P2P par slug
 */
export async function getP2PParticipant(
  params: GetP2PParticipantParams
): Promise<GetP2PParticipantResult> {
  try {
    logger.info('Récupération d\'un participant P2P', {
      campaignSlug: params.campaignSlug,
      participantSlug: params.participantSlug,
    });

    const participant = await prisma.p2PParticipant.findFirst({
      where: {
        slug: params.participantSlug,
        campaign: {
          slug: params.campaignSlug,
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            goalAmount: true,
            primaryColor: true,
            coverImage: true,
            logo: true,
            organizationId: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
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

    // Vérifier que la campagne est active
    if (participant.campaign.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Cette campagne n\'est pas active',
      };
    }

    return {
      success: true,
      participant: {
        ...participant,
        goalAmount: participant.goalAmount ? Number(participant.goalAmount) : null,
        totalRaised: Number(participant.totalRaised),
        campaign: {
          ...participant.campaign,
          goalAmount: participant.campaign.goalAmount ? Number(participant.campaign.goalAmount) : null,
        },
      },
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération du participant P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
