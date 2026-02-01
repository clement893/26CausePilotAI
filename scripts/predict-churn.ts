/**
 * Script de Prédiction de Churn
 * 
 * Prédit la probabilité qu'un donateur cesse de donner (churn)
 * basé sur plusieurs facteurs :
 * - Temps depuis le dernier don
 * - Fréquence des dons historiques
 * - Tendance des montants (augmentation/diminution)
 * - Engagement avec les communications
 * 
 * Usage:
 *   pnpm tsx scripts/predict-churn.ts
 *   ou via action serveur: calculateChurnRisk()
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChurnFactors {
  daysSinceLastDonation: number;
  donationFrequency: number; // Dons par an
  donationTrend: number; // -1 (diminue), 0 (stable), 1 (augmente)
  averageDonationAmount: number;
  hasActiveSubscription: boolean;
  engagementScore: number; // 0-1 basé sur les interactions
}

/**
 * Calcule les facteurs de churn pour un donateur
 */
function calculateChurnFactors(
  lastDonationDate: Date | null,
  firstDonationDate: Date | null,
  donationCount: number,
  donations: Array<{ amount: number; createdAt: Date }>,
  hasActiveSubscription: boolean
): ChurnFactors {
  const now = new Date();
  
  // Temps depuis le dernier don
  const daysSinceLastDonation = lastDonationDate
    ? Math.floor((now.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
    : Infinity;
  
  // Fréquence des dons (dons par an)
  let donationFrequency = 0;
  if (firstDonationDate && donationCount > 0) {
    const daysSinceFirstDonation = Math.floor(
      (now.getTime() - firstDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceFirstDonation > 0) {
      donationFrequency = (donationCount / daysSinceFirstDonation) * 365;
    }
  }
  
  // Tendance des montants (comparer les 3 derniers dons avec les 3 précédents)
  let donationTrend = 0; // 0 = stable
  if (donations.length >= 6) {
    const recentDonations = donations.slice(0, 3);
    const olderDonations = donations.slice(3, 6);
    
    const recentAverage = recentDonations.reduce((sum, d) => sum + Number(d.amount), 0) / recentDonations.length;
    const olderAverage = olderDonations.reduce((sum, d) => sum + Number(d.amount), 0) / olderDonations.length;
    
    if (recentAverage > olderAverage * 1.1) donationTrend = 1; // Augmente
    else if (recentAverage < olderAverage * 0.9) donationTrend = -1; // Diminue
  }
  
  // Montant moyen des dons
  const averageDonationAmount = donations.length > 0
    ? donations.reduce((sum, d) => sum + Number(d.amount), 0) / donations.length
    : 0;
  
  // Score d'engagement (simplifié - pourrait être amélioré avec plus de données)
  // Pour l'instant, basé sur la fréquence et la récence
  let engagementScore = 0;
  if (donationCount > 0) {
    // Récence : plus récent = meilleur score
    if (daysSinceLastDonation <= 30) engagementScore += 0.4;
    else if (daysSinceLastDonation <= 90) engagementScore += 0.3;
    else if (daysSinceLastDonation <= 180) engagementScore += 0.2;
    else if (daysSinceLastDonation <= 365) engagementScore += 0.1;
    
    // Fréquence : plus fréquent = meilleur score
    if (donationFrequency >= 4) engagementScore += 0.3; // Plus d'un don par trimestre
    else if (donationFrequency >= 2) engagementScore += 0.2; // Au moins 2 dons par an
    else if (donationFrequency >= 1) engagementScore += 0.1; // Au moins 1 don par an
    
    // Abonnement actif : bon signe
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
  };
}

/**
 * Calcule la probabilité de churn (0-1) basée sur les facteurs
 */
function calculateChurnProbability(factors: ChurnFactors): number {
  let churnScore = 0;
  
  // Facteur 1: Temps depuis le dernier don (poids: 40%)
  if (factors.daysSinceLastDonation === Infinity) {
    churnScore += 0.4; // Jamais donné = risque élevé
  } else if (factors.daysSinceLastDonation > 365) {
    churnScore += 0.4; // Plus d'un an = risque très élevé
  } else if (factors.daysSinceLastDonation > 180) {
    churnScore += 0.3; // Plus de 6 mois = risque élevé
  } else if (factors.daysSinceLastDonation > 90) {
    churnScore += 0.2; // Plus de 3 mois = risque modéré
  } else if (factors.daysSinceLastDonation > 30) {
    churnScore += 0.1; // Plus d'un mois = risque faible
  }
  // Moins de 30 jours = pas de risque supplémentaire
  
  // Facteur 2: Fréquence des dons (poids: 20%)
  if (factors.donationFrequency === 0) {
    churnScore += 0.2; // Aucun don = risque élevé
  } else if (factors.donationFrequency < 1) {
    churnScore += 0.15; // Moins d'un don par an = risque élevé
  } else if (factors.donationFrequency < 2) {
    churnScore += 0.1; // Moins de 2 dons par an = risque modéré
  }
  // Plus de 2 dons par an = pas de risque supplémentaire
  
  // Facteur 3: Tendance des montants (poids: 15%)
  if (factors.donationTrend === -1) {
    churnScore += 0.15; // Montants en diminution = risque élevé
  } else if (factors.donationTrend === 0 && factors.donationCount > 3) {
    churnScore += 0.05; // Stabilité après plusieurs dons = léger risque
  }
  // Augmentation = pas de risque supplémentaire
  
  // Facteur 4: Engagement (poids: 25%)
  // Score d'engagement inversé : faible engagement = risque élevé
  churnScore += (1 - factors.engagementScore) * 0.25;
  
  // Normaliser entre 0 et 1
  return Math.min(1, Math.max(0, churnScore));
}

/**
 * Prédit et met à jour les probabilités de churn pour tous les donateurs
 */
async function predictChurn() {
  console.log('🚀 Démarrage de la prédiction de churn...\n');
  
  try {
    // Récupérer tous les donateurs actifs avec leurs dons et abonnements
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
    
    console.log(`📊 Analyse de ${donators.length} donateurs actifs...\n`);
    
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
          amount: d.amount,
          createdAt: d.donatedAt,
        })),
        donator.subscriptions.length > 0
      );
      
      const churnProbability = calculateChurnProbability(factors);
      
      // Mettre à jour le donateur
      await prisma.donator.update({
        where: { id: donator.id },
        data: { churnProbability },
      });
      
      updated++;
      
      // Statistiques
      if (churnProbability >= 0.75) highRisk++;
      else if (churnProbability >= 0.5) mediumRisk++;
      else lowRisk++;
      
      // Log pour les donateurs à haut risque
      if (churnProbability >= 0.75) {
        console.log(
          `⚠️  Donateur ${donator.email}: Risque élevé (${(churnProbability * 100).toFixed(1)}%) - ` +
          `Dernier don: ${factors.daysSinceLastDonation === Infinity ? 'Jamais' : factors.daysSinceLastDonation + ' jours'}`
        );
      }
    }
    
    console.log('\n✅ Prédiction de churn terminée !\n');
    console.log(`📈 Statistiques:`);
    console.log(`   - Donateurs mis à jour: ${updated}`);
    console.log(`   - Risque élevé (≥75%): ${highRisk}`);
    console.log(`   - Risque modéré (50-74%): ${mediumRisk}`);
    console.log(`   - Risque faible (<50%): ${lowRisk}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la prédiction de churn:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  predictChurn()
    .then(() => {
      console.log('\n✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { predictChurn, calculateChurnProbability, calculateChurnFactors };
