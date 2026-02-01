/**
 * Script de Génération de Suggestions de Segments (Clustering)
 * 
 * Utilise un algorithme de clustering simple basé sur RFM et score de propension
 * pour identifier des groupes de donateurs et suggérer des segments.
 * 
 * Usage:
 *   pnpm tsx scripts/generate-segment-suggestions.ts [organizationId]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DonorFeatures {
  id: string;
  recency: number; // Jours depuis dernier don (0 si jamais donné)
  frequency: number; // Nombre de dons
  monetary: number; // Montant total des dons
  score: number; // Score de propension
  isActive: boolean;
}

interface Cluster {
  id: string;
  donors: DonorFeatures[];
  centroid: {
    recency: number;
    frequency: number;
    monetary: number;
    score: number;
  };
}

/**
 * Calcule les features RFM pour un donateur
 */
function calculateDonorFeatures(donor: any): DonorFeatures {
  const now = new Date();
  const lastDonationDate = donor.lastDonationDate ? new Date(donor.lastDonationDate) : null;
  const recency = lastDonationDate
    ? Math.floor((now.getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
    : 9999; // Très grand nombre si jamais donné
  
  return {
    id: donor.id,
    recency,
    frequency: donor.donationCount || 0,
    monetary: Number(donor.totalDonations || 0),
    score: donor.score || 0,
    isActive: donor.isActive ?? true,
  };
}

/**
 * Calcule la distance entre deux donateurs (distance euclidienne normalisée)
 */
function calculateDistance(d1: DonorFeatures, d2: DonorFeatures): number {
  // Normaliser les valeurs pour que toutes les métriques soient sur la même échelle
  const maxRecency = 365; // 1 an max
  const maxFrequency = 50; // Estimation max
  const maxMonetary = 10000; // Estimation max CAD
  const maxScore = 100;
  
  const normalizedRecency = Math.min(d1.recency / maxRecency, 1);
  const normalizedRecency2 = Math.min(d2.recency / maxRecency, 1);
  const normalizedFrequency = Math.min(d1.frequency / maxFrequency, 1);
  const normalizedFrequency2 = Math.min(d2.frequency / maxFrequency, 1);
  const normalizedMonetary = Math.min(d1.monetary / maxMonetary, 1);
  const normalizedMonetary2 = Math.min(d2.monetary / maxMonetary, 1);
  const normalizedScore = d1.score / maxScore;
  const normalizedScore2 = d2.score / maxScore;
  
  const diffRecency = normalizedRecency - normalizedRecency2;
  const diffFrequency = normalizedFrequency - normalizedFrequency2;
  const diffMonetary = normalizedMonetary - normalizedMonetary2;
  const diffScore = normalizedScore - normalizedScore2;
  
  return Math.sqrt(
    diffRecency * diffRecency +
    diffFrequency * diffFrequency +
    diffMonetary * diffMonetary +
    diffScore * diffScore
  );
}

/**
 * K-Means clustering simple (version simplifiée)
 */
function performClustering(donors: DonorFeatures[], k: number = 5): Cluster[] {
  if (donors.length === 0) return [];
  if (donors.length < k) k = donors.length;
  
  // Initialiser les centroïdes aléatoirement
  const centroids: DonorFeatures[] = [];
  const indices = new Set<number>();
  while (indices.size < k) {
    const idx = Math.floor(Math.random() * donors.length);
    if (!indices.has(idx)) {
      indices.add(idx);
      centroids.push({ ...donors[idx] });
    }
  }
  
  let clusters: Cluster[] = [];
  let changed = true;
  let iterations = 0;
  const maxIterations = 20;
  
  while (changed && iterations < maxIterations) {
    iterations++;
    
    // Assigner chaque donateur au cluster le plus proche
    clusters = centroids.map((centroid, idx) => ({
      id: `cluster-${idx}`,
      donors: [],
      centroid: {
        recency: centroid.recency,
        frequency: centroid.frequency,
        monetary: centroid.monetary,
        score: centroid.score,
      },
    }));
    
    for (const donor of donors) {
      let minDistance = Infinity;
      let closestClusterIdx = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const distance = calculateDistance(donor, centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closestClusterIdx = i;
        }
      }
      
      clusters[closestClusterIdx].donors.push(donor);
    }
    
    // Mettre à jour les centroïdes
    changed = false;
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      if (cluster.donors.length === 0) continue;
      
      const newCentroid = {
        recency: cluster.donors.reduce((sum, d) => sum + d.recency, 0) / cluster.donors.length,
        frequency: cluster.donors.reduce((sum, d) => sum + d.frequency, 0) / cluster.donors.length,
        monetary: cluster.donors.reduce((sum, d) => sum + d.monetary, 0) / cluster.donors.length,
        score: cluster.donors.reduce((sum, d) => sum + d.score, 0) / cluster.donors.length,
      };
      
      const oldCentroid = centroids[i];
      const distance = calculateDistance(
        { ...oldCentroid, recency: oldCentroid.recency },
        { ...newCentroid, recency: newCentroid.recency, frequency: newCentroid.frequency, monetary: newCentroid.monetary, score: newCentroid.score, isActive: true }
      );
      
      if (distance > 0.01) {
        changed = true;
        centroids[i] = {
          id: '',
          recency: newCentroid.recency,
          frequency: newCentroid.frequency,
          monetary: newCentroid.monetary,
          score: newCentroid.score,
          isActive: true,
        };
      }
    }
  }
  
  // Filtrer les clusters vides
  return clusters.filter(c => c.donors.length > 0);
}

/**
 * Génère une suggestion de segment à partir d'un cluster
 */
function generateSegmentSuggestion(cluster: Cluster, clusterIndex: number): {
  name: string;
  description: string;
  criteria: Record<string, any>;
  donorCount: number;
  confidence: number;
} {
  const { donors, centroid } = cluster;
  const donorCount = donors.length;
  
  // Analyser les caractéristiques du cluster
  const avgRecency = centroid.recency;
  const avgFrequency = centroid.frequency;
  const avgMonetary = centroid.monetary;
  const avgScore = centroid.score;
  
  // Générer un nom et une description basés sur les caractéristiques
  let name = '';
  let description = '';
  const criteria: Record<string, any> = {};
  
  // Classification basée sur le score et les métriques
  if (avgScore >= 70 && avgMonetary >= 500) {
    name = 'Donateurs à haut potentiel';
    description = `Donateurs avec un score de propension élevé (${Math.round(avgScore)}) et un montant total de dons significatif. Idéal pour des campagnes de dons majeurs.`;
    criteria.min_score = 70;
    criteria.min_total_donated = 500;
  } else if (avgRecency > 180 && avgFrequency > 0) {
    name = 'Donateurs à risque de churn';
    description = `Donateurs qui n'ont pas donné depuis plus de ${Math.round(avgRecency)} jours. Campagne de réactivation recommandée.`;
    criteria.max_days_since_last_donation = Math.round(avgRecency);
    criteria.min_donation_count = 1;
  } else if (avgFrequency >= 5 && avgMonetary >= 250) {
    name = 'Donateurs fidèles';
    description = `Donateurs réguliers avec ${Math.round(avgFrequency)} dons ou plus et un montant total de ${Math.round(avgMonetary)} CAD.`;
    criteria.min_donation_count = 5;
    criteria.min_total_donated = 250;
  } else if (avgScore >= 50 && avgRecency <= 90) {
    name = 'Donateurs actifs récents';
    description = `Donateurs actifs ayant donné récemment (dans les ${Math.round(avgRecency)} derniers jours) avec un bon score de propension.`;
    criteria.max_days_since_last_donation = 90;
    criteria.min_score = 50;
  } else if (avgMonetary >= 1000) {
    name = 'Grands donateurs';
    description = `Donateurs ayant contribué plus de ${Math.round(avgMonetary)} CAD au total.`;
    criteria.min_total_donated = 1000;
  } else {
    name = `Segment Cluster ${clusterIndex + 1}`;
    description = `Groupe de donateurs identifié par analyse de clustering (${donorCount} donateurs).`;
    // Critères basés sur les moyennes du cluster avec une marge
    if (avgRecency < 9999) {
      criteria.max_days_since_last_donation = Math.round(avgRecency * 1.2);
    }
    if (avgFrequency > 0) {
      criteria.min_donation_count = Math.max(1, Math.round(avgFrequency * 0.8));
    }
    if (avgMonetary > 0) {
      criteria.min_total_donated = Math.round(avgMonetary * 0.8);
    }
    if (avgScore > 0) {
      criteria.min_score = Math.round(avgScore * 0.8);
    }
  }
  
  // Calculer la confiance (basée sur la cohérence du cluster)
  const variances = {
    recency: donors.reduce((sum, d) => sum + Math.pow(d.recency - avgRecency, 2), 0) / donorCount,
    frequency: donors.reduce((sum, d) => sum + Math.pow(d.frequency - avgFrequency, 2), 0) / donorCount,
    monetary: donors.reduce((sum, d) => sum + Math.pow(d.monetary - avgMonetary, 2), 0) / donorCount,
    score: donors.reduce((sum, d) => sum + Math.pow(d.score - avgScore, 2), 0) / donorCount,
  };
  
  // Plus la variance est faible, plus la confiance est élevée
  const avgVariance = (variances.recency + variances.frequency + variances.monetary + variances.score) / 4;
  const confidence = Math.max(0.3, Math.min(1.0, 1 - avgVariance / 10000));
  
  return { name, description, criteria, donorCount, confidence };
}

/**
 * Génère les suggestions de segments pour une organisation
 */
async function generateSegmentSuggestions(organizationId: string) {
  console.log(`🚀 Génération de suggestions de segments pour l'organisation ${organizationId}...\n`);
  
  try {
    // Vérifier que l'organisation existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    
    if (!organization) {
      throw new Error(`Organisation ${organizationId} non trouvée`);
    }
    
    // Récupérer tous les donateurs avec leurs métriques
    const donators = await prisma.donator.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      include: {
        donations: {
          where: {
            status: 'completed',
          },
        },
      },
    });
    
    console.log(`📊 ${donators.length} donateurs trouvés\n`);
    
    if (donators.length === 0) {
      console.log('⚠️  Aucun donateur trouvé. Aucune suggestion générée.');
      return;
    }
    
    // Calculer les features pour chaque donateur
    const donorFeatures = donators.map(donor => ({
      ...calculateDonorFeatures({
        id: donor.id,
        lastDonationDate: donor.lastDonationDate,
        donationCount: donor.donationCount,
        totalDonations: donor.totalDonations,
        score: donor.score,
        isActive: donor.isActive,
      }),
    }));
    
    // Effectuer le clustering
    const k = Math.min(5, Math.max(2, Math.floor(donorFeatures.length / 10))); // Entre 2 et 5 clusters
    console.log(`🔍 Clustering avec ${k} clusters...\n`);
    const clusters = performClustering(donorFeatures, k);
    
    console.log(`✅ ${clusters.length} clusters identifiés\n`);
    
    // Supprimer les anciennes suggestions non acceptées
    await prisma.segmentSuggestion.deleteMany({
      where: {
        organizationId,
        isAccepted: false,
      },
    });
    
    // Générer les suggestions à partir des clusters
    const suggestions = [];
    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      if (cluster.donors.length < 3) continue; // Ignorer les clusters trop petits
      
      const suggestion = generateSegmentSuggestion(cluster, i);
      suggestions.push({
        organizationId,
        name: suggestion.name,
        description: suggestion.description,
        criteria: suggestion.criteria,
        donorCount: suggestion.donorCount,
        clusterId: cluster.id,
        confidence: suggestion.confidence,
      });
      
      console.log(`  ✓ ${suggestion.name}: ${suggestion.donorCount} donateurs (confiance: ${(suggestion.confidence * 100).toFixed(1)}%)`);
    }
    
    // Sauvegarder les suggestions
    if (suggestions.length > 0) {
      await prisma.segmentSuggestion.createMany({
        data: suggestions,
      });
      
      console.log(`\n✨ ${suggestions.length} suggestions créées avec succès`);
    } else {
      console.log('\n⚠️  Aucune suggestion générée (clusters trop petits)');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération des suggestions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  const organizationId = process.argv[2];
  
  if (!organizationId) {
    console.error('❌ Usage: pnpm tsx scripts/generate-segment-suggestions.ts <organizationId>');
    process.exit(1);
  }
  
  generateSegmentSuggestions(organizationId)
    .then(() => {
      console.log('\n✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur:', error);
      process.exit(1);
    });
}

export { generateSegmentSuggestions, performClustering, generateSegmentSuggestion };
