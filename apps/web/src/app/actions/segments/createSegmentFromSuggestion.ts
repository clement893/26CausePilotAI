/**
 * Action Serveur : Créer un Segment depuis une Suggestion
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CreateSegmentFromSuggestionResult {
  success: boolean;
  segmentId?: string;
  error?: string;
}

/**
 * Crée un segment à partir d'une suggestion de segment
 */
export async function createSegmentFromSuggestion(
  organizationId: string,
  suggestionId: string
): Promise<CreateSegmentFromSuggestionResult> {
  try {
    logger.info(`Création d'un segment depuis la suggestion ${suggestionId}`);
    
    // Récupérer la suggestion
    const suggestion = await prisma.segmentSuggestion.findUnique({
      where: { id: suggestionId },
    });
    
    if (!suggestion) {
      return {
        success: false,
        error: 'Suggestion non trouvée',
      };
    }
    
    if (suggestion.organizationId !== organizationId) {
      return {
        success: false,
        error: 'Suggestion ne correspond pas à l\'organisation',
      };
    }
    
    if (suggestion.isAccepted) {
      return {
        success: false,
        error: 'Cette suggestion a déjà été acceptée',
      };
    }
    
    // Note: La création du segment se fait via l'API backend
    // Cette action marque juste la suggestion comme acceptée
    // Le segment doit être créé via l'API /v1/organizations/{orgId}/segments
    
    await prisma.segmentSuggestion.update({
      where: { id: suggestionId },
      data: {
        isAccepted: true,
        acceptedAt: new Date(),
      },
    });
    
    logger.info(`Suggestion ${suggestionId} marquée comme acceptée`);
    
    return {
      success: true,
      segmentId: undefined, // Le segment sera créé via l'API
    };
  } catch (error) {
    logger.error('Erreur lors de la création du segment depuis la suggestion', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
