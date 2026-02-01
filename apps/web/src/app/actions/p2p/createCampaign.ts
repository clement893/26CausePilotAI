/**
 * Action Serveur : Créer une Campagne P2P
 * 
 * Crée une nouvelle campagne P2P.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface CreateP2PCampaignParams {
  organizationId: string;
  name: string;
  description?: string;
  slug: string;
  startDate?: Date | string;
  endDate?: Date | string;
  goalAmount?: number;
  goalParticipants?: number;
  allowTeams?: boolean;
  allowIndividualParticipants?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  coverImage?: string;
  logo?: string;
  primaryColor?: string;
}

export interface CreateP2PCampaignResult {
  success: boolean;
  campaignId?: string;
  error?: string;
}

/**
 * Crée une nouvelle campagne P2P
 */
export async function createP2PCampaign(
  params: CreateP2PCampaignParams
): Promise<CreateP2PCampaignResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Création d\'une campagne P2P', {
      organizationId: params.organizationId,
      name: params.name,
      slug: params.slug,
    });

    // Vérifier que le slug est unique pour cette organisation
    const existingCampaign = await prisma.p2PCampaign.findUnique({
      where: {
        slug: params.slug,
      },
    });

    if (existingCampaign) {
      return {
        success: false,
        error: 'Une campagne avec ce slug existe déjà',
      };
    }

    // Créer la campagne
    const campaign = await prisma.p2PCampaign.create({
      data: {
        organizationId: params.organizationId,
        name: params.name,
        description: params.description || null,
        slug: params.slug,
        startDate: params.startDate ? new Date(params.startDate) : null,
        endDate: params.endDate ? new Date(params.endDate) : null,
        goalAmount: params.goalAmount ? params.goalAmount : null,
        goalParticipants: params.goalParticipants || null,
        allowTeams: params.allowTeams ?? true,
        allowIndividualParticipants: params.allowIndividualParticipants ?? true,
        minTeamSize: params.minTeamSize || null,
        maxTeamSize: params.maxTeamSize || null,
        coverImage: params.coverImage || null,
        logo: params.logo || null,
        primaryColor: params.primaryColor || null,
        status: 'DRAFT',
      },
    });

    logger.info('Campagne P2P créée avec succès', {
      campaignId: campaign.id,
    });

    return {
      success: true,
      campaignId: campaign.id,
    };
  } catch (error) {
    logger.error('Erreur lors de la création de la campagne P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la création',
    };
  }
}
