/**
 * Action Serveur : Calcul du Risque de Churn
 * 
 * Calcule et met à jour la probabilité de churn pour tous les donateurs actifs.
 * Utilise le script predict-churn.ts pour la logique de prédiction.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface ChurnRiskResult {
  success: boolean;
  updated?: number;
  highRisk?: number;
  mediumRisk?: number;
  lowRisk?: number;
  error?: string;
}

/**
 * Calcule les facteurs de churn pour un donateur
 */
interface ChurnFactors {
  daysSinceLastDonation: number;
  donationFrequency: number;
  donationTrend: number;
  averageDonationAmount: number;
  hasActiveSubscription: boolean;
  engagementScore: number;
  donationCount: number;
}

function calculateChurnFactors(
  lastDonationDate: Date | null,
  firstDonationDate: Date | null,
  donationCount: number,
  donations: Array<{ amount: number; createdAt: Date }>,
  hasActiveSubscription: boolean
): ChurnFactors {
  const now = new Date();
  
  const daysSinceLastDonation = lastDonationDate
    ? Math.floor((now.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;
  
  let donationFrequency = 0;
  if (firstDonationDate && donationCount > 0) {
    const daysSinceFirstDonation = Math.floor(
      (now.getTime() - firstDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceFirstDonation > 0) {
      donationFrequency = (donationCount / daysSinceFirstDonation) * 365;
    }
  }
  
  let donationTrend = 0;
  if (donations.length >= 6) {
    const recentDonations = donations.slice(0, 3);
    const olderDonations = donations.slice(3, 6);
    
    const recentAverage = recentDonations.reduce((sum, d) => sum + Number(d.amount), 0) / recentDonations.length;
    const olderAverage = olderDonations.reduce((sum, d) => sum + Number(d.amount), 0) / olderDonations.length;
    
    if (recentAverage > olderAverage * 1.1) donationTrend = 1;
    else if (recentAverage < olderAverage * 0.9) donationTrend = -1;
  }
  
  const averageDonationAmount = donations.length > 0
    ? donations.reduce((sum, d) => sum + Number(d.amount), 0) / donations.length
    : 0;
  
  let engagementScore = 0;
  if (donationCount > 0) {
    if (daysSinceLastDonation <= 30) engagementScore += 0.4;
    else if (daysSinceLastDonation <= 90) engagementScore += 0.3;
    else if (daysSinceLastDonation <= 180) engagementScore += 0.2;
    else if (daysSinceLastDonation <= 365) engagementScore += 0.1;
    
    if (donationFrequency >= 4) engagementScore += 0.3;
    else if (donationFrequency >= 2) engagementScore += 0.2;
    else if (donationFrequency >= 1) engagementScore += 0.1;
    
    if (hasActiveSubscription) engagementScore += 0.3;
  }
  
  engagementScore = Math.min(1, engagementScore);
  
  return {
    daysSinceLastDonation,
    donationFrequency,
    donationTrend,
    averageDonationAmount,
    hasActiveSubscription,
    engagementScore,
    donationCount,
  };
}

function calculateChurnProbability(factors: ChurnFactors): number {
  let churnScore = 0;
  
  if (factors.daysSinceLastDonation === Infinity) {
    churnScore += 0.4;
  } else if (factors.daysSinceLastDonation > 365) {
    churnScore += 0.4;
  } else if (factors.daysSinceLastDonation > 180) {
    churnScore += 0.3;
  } else if (factors.daysSinceLastDonation > 90) {
    churnScore += 0.2;
  } else if (factors.daysSinceLastDonation > 30) {
    churnScore += 0.1;
  }
  
  if (factors.donationFrequency === 0) {
    churnScore += 0.2;
  } else if (factors.donationFrequency < 1) {
    churnScore += 0.15;
  } else if (factors.donationFrequency < 2) {
    churnScore += 0.1;
  }
  
  if (factors.donationTrend === -1) {
    churnScore += 0.15;
  } else if (factors.donationTrend === 0 && factors.donationCount > 3) {
    churnScore += 0.05;
  }
  
  churnScore += (1 - factors.engagementScore) * 0.25;
  
  return Math.min(1, Math.max(0, churnScore));
}

/**
 * Calcule et met à jour les probabilités de churn pour tous les donateurs actifs
 */
export async function calculateChurnRisk(): Promise<ChurnRiskResult> {
  try {
    logger.info('Démarrage du calcul du risque de churn');

    const donators = await prisma.donator.findMany({
      where: {
        isActive: true,
      },
      include: {
        donations: {
          where: {
            status: 'completed',
          },
          orderBy: {
            donatedAt: 'desc',
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    let updated = 0;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    for (const donator of donators) {
      const factors = calculateChurnFactors(
        donator.lastDonationDate,
        donator.firstDonationDate,
        donator.donationCount,
        donator.donations.map(d => ({
          amount: Number(d.amount),
          createdAt: d.donatedAt,
        })),
        donator.subscriptions.length > 0
      );

      const churnProbability = calculateChurnProbability(factors);

      await prisma.donator.update({
        where: { id: donator.id },
        data: { churnProbability },
      });

      updated++;

      if (churnProbability >= 0.75) highRisk++;
      else if (churnProbability >= 0.5) mediumRisk++;
      else lowRisk++;
    }

    logger.info('Calcul du risque de churn terminé', {
      updated,
      highRisk,
      mediumRisk,
      lowRisk,
    });

    return {
      success: true,
      updated,
      highRisk,
      mediumRisk,
      lowRisk,
    };
  } catch (error) {
    logger.error('Erreur lors du calcul du risque de churn', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Calcule le risque de churn pour un donateur spécifique
 */
export async function calculateDonatorChurnRisk(donatorId: string): Promise<{
  success: boolean;
  churnProbability?: number;
  error?: string;
}> {
  try {
    const donator = await prisma.donator.findUnique({
      where: { id: donatorId },
      include: {
        donations: {
          where: {
            status: 'completed',
          },
          orderBy: {
            donatedAt: 'desc',
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    if (!donator) {
      return {
        success: false,
        error: 'Donateur non trouvé',
      };
    }

    const factors = calculateChurnFactors(
      donator.lastDonationDate,
      donator.firstDonationDate,
      donator.donationCount,
      donator.donations.map(d => ({
        amount: Number(d.amount),
        createdAt: d.donatedAt,
      })),
      donator.subscriptions.length > 0
    );

    const churnProbability = calculateChurnProbability(factors);

    // Mettre à jour le donateur
    await prisma.donator.update({
      where: { id: donatorId },
      data: { churnProbability },
    });

    return {
      success: true,
      churnProbability,
    };
  } catch (error) {
    logger.error('Erreur lors du calcul du risque de churn pour un donateur', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
