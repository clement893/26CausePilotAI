/**
 * Action Serveur : Analyse de Sentiments
 * 
 * Analyse le sentiment d'un commentaire (positif, négatif, neutre)
 * en utilisant l'API AI du backend (OpenAI ou Anthropic).
 */

'use server';

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/logger';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface AnalyzeSentimentParams {
  content: string;
  provider?: 'openai' | 'anthropic' | 'auto';
  model?: string;
}

export interface AnalyzeSentimentResult {
  success: boolean;
  sentiment?: Sentiment;
  error?: string;
}

/**
 * Analyse le sentiment d'un commentaire
 */
export async function analyzeSentiment(
  params: AnalyzeSentimentParams
): Promise<AnalyzeSentimentResult> {
  try {
    logger.info('Analyse de sentiment', { contentLength: params.content.length });

    // Construire le prompt système pour l'analyse de sentiment
    const systemPrompt = `You are an expert sentiment analysis system for nonprofit organizations.
Analyze the sentiment of donor comments and feedback.

Return ONLY one word: "positive", "negative", or "neutral".

Guidelines:
- "positive": Expresses satisfaction, gratitude, appreciation, enthusiasm, or positive emotions
- "negative": Expresses dissatisfaction, complaints, frustration, disappointment, or negative emotions
- "neutral": Factual statements, questions, or comments without clear emotional tone

Be consistent and objective in your analysis.`;

    // Préparer les messages pour l'API
    const messages = [
      {
        role: 'user' as const,
        content: `Analyze the sentiment of this comment: "${params.content}"`,
      },
    ];

    // Appeler l'API AI du backend
    const response = await apiClient.post<{
      content: string;
      model: string;
      provider: string;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
      finish_reason: string;
    }>('/api/v1/ai/chat', {
      messages,
      provider: params.provider || 'auto',
      model: params.model,
      system_prompt: systemPrompt,
      max_tokens: 10, // Très court car on attend juste un mot
      temperature: 0.3, // Faible température pour plus de cohérence
    });

    if (!response.data || !response.data.content) {
      return {
        success: false,
        error: 'Aucune réponse de l\'IA',
      };
    }

    // Extraire le sentiment de la réponse (normaliser en minuscules et trim)
    const sentimentText = response.data.content.trim().toLowerCase();
    let sentiment: Sentiment;

    if (sentimentText.includes('positive')) {
      sentiment = 'positive';
    } else if (sentimentText.includes('negative')) {
      sentiment = 'negative';
    } else if (sentimentText.includes('neutral')) {
      sentiment = 'neutral';
    } else {
      // Fallback: essayer de détecter le sentiment depuis le texte
      logger.warn('Sentiment non reconnu, utilisation du fallback', { sentimentText });
      sentiment = 'neutral'; // Par défaut neutre si on ne peut pas déterminer
    }

    logger.info('Sentiment analysé avec succès', {
      provider: response.data.provider,
      model: response.data.model,
      sentiment,
    });

    return {
      success: true,
      sentiment,
    };
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de sentiment', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'analyse',
    };
  }
}

/**
 * Analyse et sauvegarde un commentaire avec son sentiment
 * @deprecated Utilisez createComment à la place, qui combine création et analyse
 */
export async function analyzeComment(
  content: string,
  donatorId: string
): Promise<{ success: boolean; sentiment?: Sentiment; error?: string }> {
  try {
    // Analyser le sentiment
    const sentimentResult = await analyzeSentiment({ content });

    if (!sentimentResult.success || !sentimentResult.sentiment) {
      return {
        success: false,
        error: sentimentResult.error || 'Impossible d\'analyser le sentiment',
      };
    }

    logger.info('Commentaire analysé', {
      donatorId,
      sentiment: sentimentResult.sentiment,
    });

    return {
      success: true,
      sentiment: sentimentResult.sentiment,
    };
  } catch (error) {
    logger.error('Erreur lors de l\'analyse du commentaire', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
