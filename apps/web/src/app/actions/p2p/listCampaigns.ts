/**
 * Action Serveur : Lister les Campagnes P2P
 * 
 * Récupère la liste des campagnes P2P d'une organisation.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { auth } from '@/lib/auth/core';

export interface ListP2PCampaignsParams {
  organizationId: string;
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  page?: number;
  pageSize?: number;
}

export interface P2PCampaignListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  goalAmount: number | null;
  totalRaised: number;
  participantCount: number;
  teamCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListP2PCampaignsResult {
  success: boolean;
  campaigns?: P2PCampaignListItem[];
  total?: number;
  error?: string;
}

/**
 * Liste les campagnes P2P d'une organisation
 */
export async function listP2PCampaigns(
  params: ListP2PCampaignsParams
): Promise<ListP2PCampaignsResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        error: 'Non authentifié',
      };
    }

    logger.info('Récupération des campagnes P2P', {
      organizationId: params.organizationId,
      status: params.status,
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      organizationId: params.organizationId,
    };

    if (params.status) {
      where.status = params.status;
    }

    const [campaigns, total] = await Promise.all([
      prisma.p2PCampaign.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: pageSize,
        skip,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          status: true,
          startDate: true,
          endDate: true,
          goalAmount: true,
          totalRaised: true,
          participantCount: true,
          teamCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.p2PCampaign.count({ where }),
    ]);

    logger.info('Campagnes P2P récupérées avec succès', {
      count: campaigns.length,
      total,
    });

    return {
      success: true,
      campaigns: campaigns.map(c => ({
        ...c,
        goalAmount: c.goalAmount ? Number(c.goalAmount) : null,
        totalRaised: Number(c.totalRaised),
      })),
      total,
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des campagnes P2P', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
