/**
 * Action Serveur : Mettre à jour une Campagne P2P
 * 
 * Met à jour les informations d'une campagne P2P.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface UpdateP2PCampaignParams {
  campaignId: string;
  organizationId: string;
  name?: string;
  description?: string;
  slug?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  goalAmount?: number | null;
  goalParticipants?: number | null;
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  allowTeams?: boolean;
  allowIndividualParticipants?: boolean;
  minTeamSize?: number | null;
  maxTeamSize?: number | null;
  coverImage?: string | null;
  logo?: string | null;
  primaryColor?: string | null;
}

export interface UpdateP2PCampaignResult {
  success: boolean;
  error?: string;
}

/**
 * Met à jour une campagne P2P
 */
export async function updateP2PCampaign(
  params: UpdateP2PCampaignParams
): Promise<UpdateP2PCampaignResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Mise à jour d\'une campagne P2P', {
      campaignId: params.campaignId,
      organizationId: params.organizationId,
    });

    // Vérifier que la campagne existe et appartient à l'organisation
    const existingCampaign = await prisma.p2PCampaign.findFirst({
      where: {
        id: params.campaignId,
        organizationId: params.organizationId,
      },
    });

    if (!existingCampaign) {
      return {
        success: false,
        error: 'Campagne non trouvée',
      };
    }

    // Vérifier l'unicité du slug si modifié
    if (params.slug && params.slug !== existingCampaign.slug) {
      const slugExists = await prisma.p2PCampaign.findUnique({
        where: {
          slug: params.slug,
        },
      });

      if (slugExists) {
        return {
          success: false,
          error: 'Une campagne avec ce slug existe déjà',
        };
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.slug !== undefined) updateData.slug = params.slug;
    if (params.startDate !== undefined) updateData.startDate = params.startDate ? new Date(params.startDate) : null;
    if (params.endDate !== undefined) updateData.endDate = params.endDate ? new Date(params.endDate) : null;
    if (params.goalAmount !== undefined) updateData.goalAmount = params.goalAmount;
    if (params.goalParticipants !== undefined) updateData.goalParticipants = params.goalParticipants;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.allowTeams !== undefined) updateData.allowTeams = params.allowTeams;
    if (params.allowIndividualParticipants !== undefined) updateData.allowIndividualParticipants = params.allowIndividualParticipants;
    if (params.minTeamSize !== undefined) updateData.minTeamSize = params.minTeamSize;
    if (params.maxTeamSize !== undefined) updateData.maxTeamSize = params.maxTeamSize;
    if (params.coverImage !== undefined) updateData.coverImage = params.coverImage;
    if (params.logo !== undefined) updateData.logo = params.logo;
    if (params.primaryColor !== undefined) updateData.primaryColor = params.primaryColor;

    // Mettre à jour la campagne
    await prisma.p2PCampaign.update({
      where: {
        id: params.campaignId,
      },
      data: updateData,
    });

    logger.info('Campagne P2P mise à jour avec succès', {
      campaignId: params.campaignId,
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la campagne P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la mise à jour',
    };
  }
}
