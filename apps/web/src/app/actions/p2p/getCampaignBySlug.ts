/**
 * Action Serveur : Récupérer une Campagne P2P par Slug
 * 
 * Récupère les détails d'une campagne P2P par son slug (pour les pages publiques).
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface GetP2PCampaignBySlugParams {
  slug: string;
}

export interface P2PCampaignPublicDetails {
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
  allowTeams: boolean;
  allowIndividualParticipants: boolean;
  organizationId: string;
}

export interface GetP2PCampaignBySlugResult {
  success: boolean;
  campaign?: P2PCampaignPublicDetails;
  error?: string;
}

/**
 * Récupère une campagne P2P par slug (publique)
 */
export async function getP2PCampaignBySlug(
  params: GetP2PCampaignBySlugParams
): Promise<GetP2PCampaignBySlugResult> {
  try {
    logger.info('Récupération d\'une campagne P2P par slug', {
      slug: params.slug,
    });

    const campaign = await prisma.p2PCampaign.findUnique({
      where: {
        slug: params.slug,
      },
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

    return {
      success: true,
      campaign: {
        ...campaign,
        goalAmount: campaign.goalAmount ? Number(campaign.goalAmount) : null,
      },
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération de la campagne P2P par slug', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
