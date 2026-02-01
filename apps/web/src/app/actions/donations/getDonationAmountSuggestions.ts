/**
 * Action Serveur : Recommandation de Montant de Don
 * 
 * Calcule des montants suggérés personnalisés pour un donateur basés sur son historique,
 * ou retourne les montants par défaut du formulaire si le donateur est anonyme.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface DonationAmountSuggestionsParams {
  formId: string;
  organizationId: string;
  donorEmail?: string;
  donorId?: string;
}

export interface DonationAmountSuggestionsResult {
  success: boolean;
  suggestedAmounts: number[];
  isPersonalized: boolean;
  error?: string;
}

/**
 * Calcule des montants suggérés personnalisés basés sur l'historique du donateur
 */
function calculatePersonalizedAmounts(
  averageDonation: number,
  largestDonation: number,
  lastDonation: number | null,
  defaultAmounts: number[]
): number[] {
  // Base : utiliser le don moyen, le plus gros don, et le dernier don comme référence
  const referenceAmounts: number[] = [];
  
  if (averageDonation > 0) {
    referenceAmounts.push(averageDonation);
  }
  
  if (largestDonation > 0 && largestDonation !== averageDonation) {
    referenceAmounts.push(largestDonation);
  }
  
  if (lastDonation && lastDonation !== averageDonation && lastDonation !== largestDonation) {
    referenceAmounts.push(lastDonation);
  }
  
  // Si on a des références, créer des montants suggérés autour de ces valeurs
  if (referenceAmounts.length > 0) {
    const personalizedAmounts: number[] = [];
    const minRef = Math.min(...referenceAmounts);
    const maxRef = Math.max(...referenceAmounts);
    
    // Générer 4-5 montants autour des références
    // Stratégie : un peu moins que le min, le min, entre min et max, le max, un peu plus que le max
    if (minRef > 10) {
      personalizedAmounts.push(Math.max(10, Math.round(minRef * 0.7 / 5) * 5)); // Arrondir à 5 près
    }
    personalizedAmounts.push(Math.round(minRef / 5) * 5);
    
    if (maxRef > minRef) {
      const midAmount = Math.round((minRef + maxRef) / 2 / 5) * 5;
      if (midAmount !== Math.round(minRef / 5) * 5 && midAmount !== Math.round(maxRef / 5) * 5) {
        personalizedAmounts.push(midAmount);
      }
    }
    
    personalizedAmounts.push(Math.round(maxRef / 5) * 5);
    personalizedAmounts.push(Math.round(maxRef * 1.2 / 5) * 5);
    
    // Trier et dédupliquer
    const uniqueAmounts = Array.from(new Set(personalizedAmounts)).sort((a, b) => a - b);
    
    // S'assurer d'avoir entre 4 et 5 montants
    if (uniqueAmounts.length >= 4) {
      return uniqueAmounts.slice(0, 5);
    }
    
    // Compléter avec des montants par défaut si nécessaire
    const defaultToAdd = defaultAmounts.filter(a => !uniqueAmounts.includes(a));
    return [...uniqueAmounts, ...defaultToAdd].slice(0, 5).sort((a, b) => a - b);
  }
  
  // Fallback : utiliser les montants par défaut
  return defaultAmounts;
}

/**
 * Obtient des montants suggérés personnalisés pour un donateur ou les montants par défaut
 */
export async function getDonationAmountSuggestions(
  params: DonationAmountSuggestionsParams
): Promise<DonationAmountSuggestionsResult> {
  try {
    logger.info('Récupération des montants suggérés', {
      formId: params.formId,
      organizationId: params.organizationId,
      hasDonorEmail: !!params.donorEmail,
      hasDonorId: !!params.donorId,
    });

    // Récupérer le formulaire pour obtenir les montants par défaut
    const form = await prisma.donationForm.findUnique({
      where: {
        id: params.formId,
        organizationId: params.organizationId,
      },
    });

    if (!form) {
      return {
        success: false,
        suggestedAmounts: [25, 50, 100, 250, 500], // Fallback
        isPersonalized: false,
        error: 'Formulaire non trouvé',
      };
    }

    // Extraire les montants par défaut du formulaire
    const defaultAmounts: number[] = Array.isArray(form.suggestedAmounts)
      ? (form.suggestedAmounts as number[])
      : [25, 50, 100, 250, 500];

    // Si aucun donateur n'est fourni, retourner les montants par défaut
    if (!params.donorEmail && !params.donorId) {
      return {
        success: true,
        suggestedAmounts: defaultAmounts,
        isPersonalized: false,
      };
    }

    // Chercher le donateur par email ou ID
    let donator = null;
    
    if (params.donorId) {
      donator = await prisma.donator.findUnique({
        where: {
          id: params.donorId,
          organizationId: params.organizationId,
        },
        include: {
          donations: {
            where: {
              status: 'completed',
            },
            orderBy: {
              donatedAt: 'desc',
            },
            take: 20, // Limiter pour la performance
          },
        },
      });
    } else if (params.donorEmail) {
      donator = await prisma.donator.findFirst({
        where: {
          email: params.donorEmail,
          organizationId: params.organizationId,
        },
        include: {
          donations: {
            where: {
              status: 'completed',
            },
            orderBy: {
              donatedAt: 'desc',
            },
            take: 20,
          },
        },
      });
    }

    // Si le donateur n'existe pas ou n'a pas de dons, retourner les montants par défaut
    if (!donator || donator.donations.length === 0) {
      return {
        success: true,
        suggestedAmounts: defaultAmounts,
        isPersonalized: false,
      };
    }

    // Calculer les statistiques du donateur
    const donations = donator.donations.map(d => Number(d.amount));
    const averageDonation = donations.reduce((sum, amount) => sum + amount, 0) / donations.length;
    const largestDonation = Math.max(...donations);
    const lastDonation = donations.length > 0 ? donations[0] : null;

    // Calculer les montants personnalisés
    const personalizedAmounts = calculatePersonalizedAmounts(
      averageDonation,
      largestDonation,
      lastDonation ?? null,
      defaultAmounts
    );

    logger.info('Montants suggérés calculés', {
      isPersonalized: true,
      averageDonation,
      largestDonation,
      lastDonation,
      suggestedAmounts: personalizedAmounts,
    });

    return {
      success: true,
      suggestedAmounts: personalizedAmounts,
      isPersonalized: true,
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des montants suggérés', error);
    
    // En cas d'erreur, retourner les montants par défaut
    return {
      success: false,
      suggestedAmounts: [25, 50, 100, 250, 500],
      isPersonalized: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
