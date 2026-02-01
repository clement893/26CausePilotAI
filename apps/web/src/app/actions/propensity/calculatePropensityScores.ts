/**
 * Action Serveur : Calcul des Scores de Propension
 * 
 * Calcule et met à jour les scores de propension pour tous les donateurs.
 * Peut être appelée depuis une page admin ou un endpoint API.
 */

'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

interface RFMScore {
  recency: number; // 1-5
  frequency: number; // 1-5
  monetary: number; // 1-5
}

/**
 * Calcule le score RFM pour un donateur
 */
function calculateRFMScore(
  lastDonationDate: Date | null,
  donationCount: number,
  totalDonations: number
): RFMScore {
  const now = new Date();
  
  // Recency Score (1-5)
  let recency = 1;
  if (lastDonationDate) {
    const daysSinceLastDonation = Math.floor(
      (now.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastDonation <= 30) recency = 5;
    else if (daysSinceLastDonation <= 90) recency = 4;
    else if (daysSinceLastDonation <= 180) recency = 3;
    else if (daysSinceLastDonation <= 365) recency = 2;
    else recency = 1;
  }
  
  // Frequency Score (1-5)
  let frequency = 1;
  if (donationCount >= 10) frequency = 5;
  else if (donationCount >= 5) frequency = 4;
  else if (donationCount >= 3) frequency = 3;
  else if (donationCount >= 1) frequency = 2;
  
  // Monetary Score (1-5)
  let monetary = 1;
  const total = Number(totalDonations);
  if (total >= 1000) monetary = 5;
  else if (total >= 500) monetary = 4;
  else if (total >= 250) monetary = 3;
  else if (total >= 100) monetary = 2;
  
  return { recency, frequency, monetary };
}

/**
 * Convertit le score RFM en score de propension (0-100)
 */
function calculatePropensityScore(rfm: RFMScore): number {
  const weightedScore = 
    (rfm.recency * 0.4 + rfm.frequency * 0.3 + rfm.monetary * 0.3) / 5 * 100;
  return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

export interface CalculatePropensityScoresResult {
  success: boolean;
  updated: number;
  skipped: number;
  error?: string;
}

/**
 * Calcule et met à jour les scores de propension pour tous les donateurs
 */
export async function calculatePropensityScores(): Promise<CalculatePropensityScoresResult> {
  try {
    logger.info('Démarrage du calcul des scores de propension');
    
    const donators = await prisma.donator.findMany({
      include: {
        donations: {
          where: {
            status: 'completed',
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    let updated = 0;
    let skipped = 0;
    
    for (const donator of donators) {
      const donations = donator.donations;
      const donationCount = donations.length;
      const totalDonations = Number(donator.totalDonations || 0);
      const lastDonationDate = donator.lastDonationDate 
        ? new Date(donator.lastDonationDate)
        : null;
      
      const rfm = calculateRFMScore(lastDonationDate, donationCount, totalDonations);
      const propensityScore = calculatePropensityScore(rfm);
      
      await prisma.donator.update({
        where: { id: donator.id },
        data: { score: propensityScore },
      });
      
      updated++;
    }
    
    logger.info(`Calcul terminé: ${updated} donateurs mis à jour`);
    
    return {
      success: true,
      updated,
      skipped,
    };
  } catch (error) {
    logger.error('Erreur lors du calcul des scores de propension', error);
    return {
      success: false,
      updated: 0,
      skipped: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
