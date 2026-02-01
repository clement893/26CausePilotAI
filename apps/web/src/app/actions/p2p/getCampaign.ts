/**
 * Action Serveur : Récupérer une Campagne P2P
 * 
 * Récupère les détails d'une campagne P2P.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface GetP2PCampaignParams {
  campaignId: string;
  organizationId: string;
}

export interface P2PCampaignDetails {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  startDate: Date | null;
  endDate: Date | null;
  goalAmount: number | null;
  goalParticipants: number | null;
  status: string;
  allowTeams: boolean;
  allowIndividualParticipants: boolean;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  coverImage: string | null;
  logo: string | null;
  primaryColor: string | null;
  totalRaised: number;
  participantCount: number;
  teamCount: number;
  donationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetP2PCampaignResult {
  success: boolean;
  campaign?: P2PCampaignDetails;
  error?: string;
}

/**
 * Récupère une campagne P2P par ID
 */
export async function getP2PCampaign(
  params: GetP2PCampaignParams
): Promise<GetP2PCampaignResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Récupération d\'une campagne P2P', {
      campaignId: params.campaignId,
      organizationId: params.organizationId,
    });

    const campaign = await prisma.p2PCampaign.findFirst({
      where: {
        id: params.campaignId,
        organizationId: params.organizationId,
      },
    });

    if (!campaign) {
      return {
        success: false,
        error: 'Campagne non trouvée',
      };
    }

    return {
      success: true,
      campaign: {
        ...campaign,
        goalAmount: campaign.goalAmount ? Number(campaign.goalAmount) : null,
        totalRaised: Number(campaign.totalRaised),
      },
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération de la campagne P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
