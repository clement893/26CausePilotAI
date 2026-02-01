/**
 * Script de Calcul du Score de Propension (RFM)
 * 
 * Calcule un score de 0 à 100 pour chaque donateur basé sur :
 * - Recency (R) : Dernière donation
 * - Frequency (F) : Fréquence des dons
 * - Monetary (M) : Montant total des dons
 * 
 * Usage:
 *   pnpm tsx scripts/calculate-propensity-scores.ts
 *   ou via action serveur: calculatePropensityScores()
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RFMScore {
  recency: number; // 1-5 (5 = très récent)
  frequency: number; // 1-5 (5 = très fréquent)
  monetary: number; // 1-5 (5 = montant élevé)
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
    
    if (daysSinceLastDonation <= 30) recency = 5; // Très récent (0-30 jours)
    else if (daysSinceLastDonation <= 90) recency = 4; // Récent (31-90 jours)
    else if (daysSinceLastDonation <= 180) recency = 3; // Modéré (91-180 jours)
    else if (daysSinceLastDonation <= 365) recency = 2; // Ancien (181-365 jours)
    else recency = 1; // Très ancien (>365 jours)
  } else {
    recency = 1; // Jamais donné
  }
  
  // Frequency Score (1-5)
  let frequency = 1;
  if (donationCount >= 10) frequency = 5; // Très fréquent (10+ dons)
  else if (donationCount >= 5) frequency = 4; // Fréquent (5-9 dons)
  else if (donationCount >= 3) frequency = 3; // Modéré (3-4 dons)
  else if (donationCount >= 1) frequency = 2; // Occasionnel (1-2 dons)
  else frequency = 1; // Jamais donné
  
  // Monetary Score (1-5) - basé sur le montant total
  // Seuils ajustables selon le contexte (ici en CAD)
  let monetary = 1;
  const total = Number(totalDonations);
  if (total >= 1000) monetary = 5; // Très élevé (1000+ CAD)
  else if (total >= 500) monetary = 4; // Élevé (500-999 CAD)
  else if (total >= 250) monetary = 3; // Modéré (250-499 CAD)
  else if (total >= 100) monetary = 2; // Faible (100-249 CAD)
  else monetary = 1; // Très faible (<100 CAD)
  
  return { recency, frequency, monetary };
}

/**
 * Convertit le score RFM en score de propension (0-100)
 */
function calculatePropensityScore(rfm: RFMScore): number {
  // Poids : Recency 40%, Frequency 30%, Monetary 30%
  const weightedScore = 
    (rfm.recency * 0.4 + rfm.frequency * 0.3 + rfm.monetary * 0.3) / 5 * 100;
  
  // Arrondir à l'entier le plus proche et s'assurer qu'il est entre 0 et 100
  return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

/**
 * Calcule et met à jour les scores de propension pour tous les donateurs
 */
async function calculatePropensityScores() {
  console.log('🚀 Démarrage du calcul des scores de propension...\n');
  
  try {
    // Récupérer tous les donateurs avec leurs dons
    const donators = await prisma.donator.findMany({
      include: {
        donations: {
          where: {
            status: 'completed', // Seulement les dons complétés
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    
    console.log(`📊 ${donators.length} donateurs trouvés\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const donator of donators) {
      const donations = donator.donations;
      const donationCount = donations.length;
      const totalDonations = Number(donator.totalDonations || 0);
      const lastDonationDate = donator.lastDonationDate 
        ? new Date(donator.lastDonationDate)
        : null;
      
      // Calculer le score RFM
      const rfm = calculateRFMScore(lastDonationDate, donationCount, totalDonations);
      const propensityScore = calculatePropensityScore(rfm);
      
      // Mettre à jour le donateur
      await prisma.donator.update({
        where: { id: donator.id },
        data: { score: propensityScore },
      });
      
      updated++;
      
      // Log pour les premiers donateurs (debug)
      if (updated <= 5) {
        console.log(
          `✅ ${donator.email}: R=${rfm.recency} F=${rfm.frequency} M=${rfm.monetary} → Score=${propensityScore}`
        );
      }
    }
    
    console.log(`\n✨ Calcul terminé:`);
    console.log(`   - ${updated} donateurs mis à jour`);
    console.log(`   - ${skipped} donateurs ignorés`);
    
  } catch (error) {
    console.error('❌ Erreur lors du calcul des scores:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  calculatePropensityScores()
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error);
      process.exit(1);
    });
}

export { calculatePropensityScores, calculateRFMScore, calculatePropensityScore };
