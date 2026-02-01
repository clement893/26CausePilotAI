/**
 * Action Serveur : Supprimer une Campagne P2P
 * 
 * Supprime une campagne P2P et toutes ses données associées.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface DeleteP2PCampaignParams {
  campaignId: string;
  organizationId: string;
}

export interface DeleteP2PCampaignResult {
  success: boolean;
  error?: string;
}

/**
 * Supprime une campagne P2P
 */
export async function deleteP2PCampaign(
  params: DeleteP2PCampaignParams
): Promise<DeleteP2PCampaignResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Suppression d\'une campagne P2P', {
      campaignId: params.campaignId,
      organizationId: params.organizationId,
    });

    // Vérifier que la campagne existe et appartient à l'organisation
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

    // Supprimer la campagne (les participants et équipes seront supprimés en cascade)
    await prisma.p2PCampaign.delete({
      where: {
        id: params.campaignId,
      },
    });

    logger.info('Campagne P2P supprimée avec succès', {
      campaignId: params.campaignId,
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erreur lors de la suppression de la campagne P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la suppression',
    };
  }
}
