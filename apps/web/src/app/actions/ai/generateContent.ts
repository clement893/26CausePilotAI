/**
 * Action Serveur : Génération de Contenu avec l'IA
 * 
 * Génère du contenu (email, description de campagne, etc.) à partir d'un prompt
 * en utilisant l'API AI du backend (OpenAI ou Anthropic).
 */

'use server';

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/logger';

export interface GenerateContentParams {
  prompt: string;
  contentType?: 'email' | 'campaign_description' | 'general';
  context?: string; // Contexte additionnel (ex: nom de la campagne, destinataires, etc.)
  provider?: 'openai' | 'anthropic' | 'auto';
  model?: string;
  maxTokens?: number;
}

export interface GenerateContentResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Génère du contenu avec l'IA
 */
export async function generateContent(
  params: GenerateContentParams
): Promise<GenerateContentResult> {
  try {
    logger.info('Génération de contenu avec l\'IA', { contentType: params.contentType });

    // Construire le prompt système selon le type de contenu
    let systemPrompt = 'You are a helpful assistant that generates high-quality content.';
    
    if (params.contentType === 'email') {
      systemPrompt = `You are an expert email copywriter specializing in nonprofit fundraising emails.
Generate compelling, engaging email content that:
- Is clear and concise
- Has a strong call-to-action
- Is personalized and warm
- Follows best practices for email marketing
- Is appropriate for nonprofit fundraising

${params.context ? `Context: ${params.context}` : ''}

Generate only the email body content (HTML format preferred, but plain text is acceptable).`;
    } else if (params.contentType === 'campaign_description') {
      systemPrompt = `You are an expert copywriter specializing in nonprofit campaign descriptions.
Generate compelling campaign descriptions that:
- Clearly explain the campaign's purpose
- Are engaging and inspiring
- Include a clear call-to-action
- Are appropriate for fundraising campaigns

${params.context ? `Context: ${params.context}` : ''}

Generate a campaign description that is clear, engaging, and appropriate for fundraising.`;
    }

    // Préparer les messages pour l'API
    const messages = [
      {
        role: 'user' as const,
        content: params.prompt,
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
      max_tokens: params.maxTokens || (params.contentType === 'email' ? 1000 : 500),
      temperature: 0.7,
    });

    if (!response.data || !response.data.content) {
      return {
        success: false,
        error: 'Aucun contenu généré par l\'IA',
      };
    }

    logger.info('Contenu généré avec succès', {
      provider: response.data.provider,
      model: response.data.model,
    });

    return {
      success: true,
      content: response.data.content,
    };
  } catch (error) {
    logger.error('Erreur lors de la génération de contenu', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération',
    };
  }
}
