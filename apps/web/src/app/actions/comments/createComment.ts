/**
 * Action Serveur : Créer un Commentaire avec Analyse de Sentiment
 * 
 * Crée un nouveau commentaire pour un donateur et analyse automatiquement son sentiment.
 */

'use server';

import { prisma } from '@/lib/db';
import { analyzeSentiment } from '../ai/analyzeSentiment';
import { logger } from '@/lib/logger';
import type { Sentiment } from '@/components/donators/SentimentBadge';

export interface CreateCommentParams {
  content: string;
  donatorId: string;
  organizationId: string;
}

export interface CreateCommentResult {
  success: boolean;
  commentId?: string;
  sentiment?: Sentiment;
  error?: string;
}

/**
 * Crée un commentaire et analyse automatiquement son sentiment
 */
export async function createComment(
  params: CreateCommentParams
): Promise<CreateCommentResult> {
  try {
    logger.info('Création de commentaire avec analyse de sentiment', {
      donatorId: params.donatorId,
      contentLength: params.content.length,
    });

    // Analyser le sentiment du commentaire
    const sentimentResult = await analyzeSentiment({
      content: params.content,
    });

    if (!sentimentResult.success) {
      logger.warn('Échec de l\'analyse de sentiment, création du commentaire sans sentiment', {
        error: sentimentResult.error,
      });
    }

    // Créer le commentaire dans la base de données
    const comment = await prisma.comment.create({
      data: {
        content: params.content,
        donatorId: params.donatorId,
        sentiment: sentimentResult.sentiment || null,
      },
    });

    logger.info('Commentaire créé avec succès', {
      commentId: comment.id,
      sentiment: comment.sentiment,
    });

    return {
      success: true,
      commentId: comment.id,
      sentiment: comment.sentiment as Sentiment | undefined,
    };
  } catch (error) {
    logger.error('Erreur lors de la création du commentaire', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la création',
    };
  }
}
