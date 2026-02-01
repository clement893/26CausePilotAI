/**
 * Action Serveur : Créer un Participant P2P
 * 
 * Crée un nouveau participant pour une campagne P2P.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CreateP2PParticipantParams {
  campaignId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  slug: string;
  personalMessage?: string;
  goalAmount?: number;
  teamId?: string;
}

export interface CreateP2PParticipantResult {
  success: boolean;
  participantId?: string;
  error?: string;
}

/**
 * Crée un nouveau participant P2P
 */
export async function createP2PParticipant(
  params: CreateP2PParticipantParams
): Promise<CreateP2PParticipantResult> {
  try {
    logger.info('Création d\'un participant P2P', {
      campaignId: params.campaignId,
      email: params.email,
    });

    // Vérifier que la campagne existe
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

    // Vérifier que la campagne permet les participants
    if (!campaign.allowIndividualParticipants && !params.teamId) {
      return {
        success: false,
        error: 'Cette campagne ne permet pas les participants individuels',
      };
    }

    // Vérifier l'unicité de l'email pour cette campagne
    const existingParticipant = await prisma.p2PParticipant.findFirst({
      where: {
        campaignId: params.campaignId,
        email: params.email,
      },
    });

    if (existingParticipant) {
      return {
        success: false,
        error: 'Un participant avec cet email existe déjà pour cette campagne',
      };
    }

    // Vérifier l'unicité du slug pour cette campagne
    const existingSlug = await prisma.p2PParticipant.findFirst({
      where: {
        campaignId: params.campaignId,
        slug: params.slug,
      },
    });

    if (existingSlug) {
      return {
        success: false,
        error: 'Ce slug est déjà utilisé pour cette campagne',
      };
    }

    // Vérifier l'équipe si fournie
    if (params.teamId) {
      const team = await prisma.p2PTeam.findFirst({
        where: {
          id: params.teamId,
          campaignId: params.campaignId,
        },
      });

      if (!team) {
        return {
          success: false,
          error: 'Équipe non trouvée',
        };
      }
    }

    // Créer le participant
    const participant = await prisma.p2PParticipant.create({
      data: {
        campaignId: params.campaignId,
        teamId: params.teamId || null,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone || null,
        slug: params.slug,
        personalMessage: params.personalMessage || null,
        goalAmount: params.goalAmount ? params.goalAmount : null,
        status: 'ACTIVE',
      },
    });

    // Mettre à jour le compteur de participants de la campagne
    await prisma.p2PCampaign.update({
      where: { id: params.campaignId },
      data: {
        participantCount: {
          increment: 1,
        },
      },
    });

    // Mettre à jour le compteur de membres de l'équipe si applicable
    if (params.teamId) {
      await prisma.p2PTeam.update({
        where: { id: params.teamId },
        data: {
          memberCount: {
            increment: 1,
          },
        },
      });
    }

    logger.info('Participant P2P créé avec succès', {
      participantId: participant.id,
    });

    return {
      success: true,
      participantId: participant.id,
    };
  } catch (error) {
    logger.error('Erreur lors de la création du participant P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la création',
    };
  }
}
