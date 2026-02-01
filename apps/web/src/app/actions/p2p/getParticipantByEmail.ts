/**
 * Action Serveur : Récupérer un Participant P2P par Email
 * 
 * Récupère un participant P2P par son email (pour le tableau de bord ambassadeur).
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface GetP2PParticipantByEmailParams {
  email: string;
  campaignId?: string;
  organizationId?: string;
}

export interface P2PParticipantBasic {
  id: string;
  campaignId: string;
  campaign: {
    id: string;
    name: string;
    slug: string;
    organizationId: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  slug: string;
  totalRaised: number;
  donationCount: number;
}

export interface GetP2PParticipantByEmailResult {
  success: boolean;
  participants?: P2PParticipantBasic[];
  error?: string;
}

/**
 * Récupère les participants P2P par email
 */
export async function getP2PParticipantByEmail(
  params: GetP2PParticipantByEmailParams
): Promise<GetP2PParticipantByEmailResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Récupération des participants P2P par email', {
      email: params.email,
    });

    const where: any = {
      email: params.email,
    };

    if (params.campaignId) {
      where.campaignId = params.campaignId;
    }

    if (params.organizationId) {
      where.campaign = {
        organizationId: params.organizationId,
      };
    }

    const participants = await prisma.p2PParticipant.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
            organizationId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      participants: participants.map(p => ({
        id: p.id,
        campaignId: p.campaignId,
        campaign: p.campaign,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        slug: p.slug,
        totalRaised: Number(p.totalRaised),
        donationCount: p.donationCount,
      })),
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des participants P2P par email', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
