/**
 * Action Serveur : Lister les Commentaires d'un Donateur
 * 
 * Récupère tous les commentaires d'un donateur avec leur sentiment.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { Comment } from '@modele/types';

export interface ListCommentsParams {
  donatorId: string;
  limit?: number;
  offset?: number;
}

export interface ListCommentsResult {
  success: boolean;
  comments?: Comment[];
  total?: number;
  error?: string;
}

/**
 * Liste les commentaires d'un donateur
 */
export async function listComments(
  params: ListCommentsParams
): Promise<ListCommentsResult> {
  try {
    logger.info('Récupération des commentaires', {
      donatorId: params.donatorId,
    });

    const limit = params.limit || 50;
    const offset = params.offset || 0;

    // Récupérer les commentaires
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          donatorId: params.donatorId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.comment.count({
        where: {
          donatorId: params.donatorId,
        },
      }),
    ]);

    // Convertir en format Comment
    type CommentRow = { id: string; content: string; sentiment: string | null; donatorId: string; createdAt: Date };
    const formattedComments: Comment[] = comments.map((comment: CommentRow) => ({
      id: comment.id,
      content: comment.content,
      sentiment: comment.sentiment as 'positive' | 'negative' | 'neutral' | undefined,
      donatorId: comment.donatorId,
      createdAt: comment.createdAt.toISOString(),
    }));

    logger.info('Commentaires récupérés avec succès', {
      count: formattedComments.length,
      total,
    });

    return {
      success: true,
      comments: formattedComments,
      total,
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des commentaires', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
