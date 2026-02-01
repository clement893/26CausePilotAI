/**
 * Action Serveur : Lister les Participants P2P
 * 
 * Liste les participants d'une campagne P2P.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface ListP2PParticipantsParams {
  campaignId: string;
  organizationId: string;
  teamId?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  page?: number;
  pageSize?: number;
}

export interface P2PParticipantListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  slug: string;
  goalAmount: number | null;
  totalRaised: number;
  donationCount: number;
  status: string;
  teamId: string | null;
  teamName: string | null;
}

export interface ListP2PParticipantsResult {
  success: boolean;
  participants?: P2PParticipantListItem[];
  total?: number;
  error?: string;
}

/**
 * Liste les participants d'une campagne P2P
 */
export async function listP2PParticipants(
  params: ListP2PParticipantsParams
): Promise<ListP2PParticipantsResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Récupération des participants P2P', {
      campaignId: params.campaignId,
      organizationId: params.organizationId,
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      campaignId: params.campaignId,
      campaign: {
        organizationId: params.organizationId,
      },
    };

    if (params.teamId) {
      where.teamId = params.teamId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [participants, total] = await Promise.all([
      prisma.p2PParticipant.findMany({
        where,
        orderBy: {
          totalRaised: 'desc',
        },
        take: pageSize,
        skip,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          slug: true,
          goalAmount: true,
          totalRaised: true,
          donationCount: true,
          status: true,
          teamId: true,
          team: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.p2PParticipant.count({ where }),
    ]);

    logger.info('Participants P2P récupérés avec succès', {
      count: participants.length,
      total,
    });

    return {
      success: true,
      participants: participants.map(p => ({
        ...p,
        goalAmount: p.goalAmount ? Number(p.goalAmount) : null,
        totalRaised: Number(p.totalRaised),
        teamName: p.team?.name || null,
      })),
      total,
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des participants P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
