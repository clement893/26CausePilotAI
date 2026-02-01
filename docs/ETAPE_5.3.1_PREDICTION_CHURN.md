# Étape 5.3.1 : Prédiction de Churn

**Date:** 1er février 2026

## Contexte

Cette fonctionnalité prédit la probabilité qu'un donateur cesse de donner (churn) en analysant plusieurs facteurs comportementaux et transactionnels.

**Référence cahier des charges:** Section 12.5 - Prédiction de Churn

## Objectifs

- Créer un modèle de prédiction qui calcule la probabilité de churn pour chaque donateur
- Stocker cette probabilité dans le modèle `Donator`
- Afficher le risque de churn dans le profil du donateur
- Permettre la création de segments dynamiques basés sur le risque de churn

## Architecture

### Modèle de Données

Le champ `churnProbability` a été ajouté au modèle `Donator` dans Prisma :

```prisma
model Donator {
  // ... autres champs
  churnProbability Float? // Probabilité de churn (0-1)
  
  @@index([churnProbability])
}
```

### Facteurs de Prédiction

Le modèle de prédiction analyse plusieurs facteurs :

1. **Temps depuis le dernier don** (poids: 40%)
   - Plus d'un an = risque très élevé
   - Plus de 6 mois = risque élevé
   - Plus de 3 mois = risque modéré
   - Plus d'un mois = risque faible
   - Moins d'un mois = pas de risque supplémentaire

2. **Fréquence des dons** (poids: 20%)
   - Aucun don = risque élevé
   - Moins d'un don par an = risque élevé
   - Moins de 2 dons par an = risque modéré
   - Plus de 2 dons par an = pas de risque supplémentaire

3. **Tendance des montants** (poids: 15%)
   - Montants en diminution = risque élevé
   - Stabilité après plusieurs dons = léger risque
   - Augmentation = pas de risque supplémentaire

4. **Score d'engagement** (poids: 25%)
   - Basé sur la récence, la fréquence et la présence d'abonnements actifs
   - Faible engagement = risque élevé

### Composants

#### 1. Script de Prédiction : `predict-churn.ts`

**Fichier:** `scripts/predict-churn.ts`

Script Node.js qui calcule et met à jour les probabilités de churn pour tous les donateurs actifs.

**Fonctions principales:**
- `calculateChurnFactors()`: Calcule les facteurs de churn pour un donateur
- `calculateChurnProbability()`: Calcule la probabilité de churn (0-1) basée sur les facteurs
- `predictChurn()`: Prédit et met à jour les probabilités pour tous les donateurs

**Utilisation:**
```bash
pnpm tsx scripts/predict-churn.ts
```

#### 2. Action Serveur : `calculateChurnRisk`

**Fichier:** `apps/web/src/app/actions/churn/calculateChurnRisk.ts`

Action serveur Next.js pour calculer le risque de churn.

**Fonctions principales:**
- `calculateChurnRisk()`: Calcule le risque pour tous les donateurs actifs
- `calculateDonatorChurnRisk(donatorId)`: Calcule le risque pour un donateur spécifique

**Utilisation:**
```typescript
import { calculateChurnRisk, calculateDonatorChurnRisk } from '@/app/actions/churn/calculateChurnRisk';

// Pour tous les donateurs
const result = await calculateChurnRisk();
console.log(`Mis à jour: ${result.updated}, Risque élevé: ${result.highRisk}`);

// Pour un donateur spécifique
const donorResult = await calculateDonatorChurnRisk(donatorId);
console.log(`Probabilité de churn: ${donorResult.churnProbability}`);
```

#### 3. Composant UI : `ChurnRiskIndicator`

**Fichier:** `apps/web/src/components/donators/ChurnRiskIndicator.tsx`

Composants React pour afficher le risque de churn.

**Composants:**
- `ChurnRiskIndicator`: Badge avec icône et pourcentage
- `ChurnRiskBar`: Barre de progression visuelle

**Niveaux de risque:**
- **Élevé** (≥75%): Badge rouge avec icône d'alerte
- **Modéré** (50-74%): Badge jaune avec icône d'avertissement
- **Faible** (25-49%): Badge bleu avec icône de tendance
- **Aucun** (<25%): Badge vert avec icône de succès

**Utilisation:**
```tsx
import { ChurnRiskIndicator, ChurnRiskBar } from '@/components/donators';

<ChurnRiskIndicator churnProbability={0.85} />
<ChurnRiskBar churnProbability={0.65} />
```

## Flux d'Utilisation

### 1. Calcul du Risque de Churn

#### Via Script (Recommandé pour traitement en lot)
```bash
cd apps/web
pnpm tsx ../../scripts/predict-churn.ts
```

#### Via Action Serveur (Pour intégration dans l'UI)
```typescript
import { calculateChurnRisk } from '@/app/actions/churn/calculateChurnRisk';

const result = await calculateChurnRisk();
if (result.success) {
  console.log(`✅ ${result.updated} donateurs mis à jour`);
  console.log(`⚠️  ${result.highRisk} à haut risque`);
}
```

### 2. Affichage dans le Profil Donateur

Le risque de churn est automatiquement affiché dans la section "Vue d'ensemble" du profil donateur :

```tsx
// Dans DonorProfileContent.tsx
<Card>
  <h2>Risque de churn</h2>
  <ChurnRiskIndicator churnProbability={donor.churn_probability} />
  <ChurnRiskBar churnProbability={donor.churn_probability} />
</Card>
```

### 3. Création d'un Segment Dynamique

Pour créer un segment de donateurs à haut risque de churn :

```typescript
// Règles pour le segment dynamique
const rules = {
  churnProbability: {
    $gte: 0.75 // Probabilité ≥ 75%
  }
};
```

## Configuration

### Tâche Cron (Optionnel)

Pour automatiser le calcul du risque de churn, vous pouvez configurer une tâche cron :

**Via ScheduledTask (Backend):**
```python
from app.services.scheduled_task_service import ScheduledTaskService
from datetime import datetime, timedelta

task_service = ScheduledTaskService(db)
await task_service.create_task(
    name="Calcul du risque de churn",
    task_type=TaskType.OTHER,
    scheduled_at=datetime.utcnow() + timedelta(days=7),
    recurrence="weekly",
    task_data={"script": "predict-churn.ts"}
)
```

**Via Cron Job (Système):**
```bash
# Exécuter chaque dimanche à 2h du matin
0 2 * * 0 cd /path/to/project && pnpm tsx scripts/predict-churn.ts
```

## Migration de Base de Données

Pour ajouter le champ `churnProbability` à la base de données :

```bash
cd apps/web
pnpm db:push
# ou
pnpm db:migrate dev --name add_churn_probability
```

## Types TypeScript

Les types sont disponibles dans `@modele/types` :

```typescript
import type { Donor } from '@modele/types';

// Donor avec churnProbability
const donor: Donor = {
  // ... autres champs
  churn_probability: 0.85, // 85% de probabilité de churn
};
```

## Exemples d'Utilisation

### Exemple 1 : Calculer le Risque pour un Donateur

```typescript
import { calculateDonatorChurnRisk } from '@/app/actions/churn/calculateChurnRisk';

const result = await calculateDonatorChurnRisk(donatorId);

if (result.success && result.churnProbability) {
  if (result.churnProbability >= 0.75) {
    console.log('⚠️  Donateur à haut risque de churn');
    // Envoyer une campagne de réactivation
  }
}
```

### Exemple 2 : Filtrer les Donateurs à Risque

```typescript
import { prisma } from '@/lib/db';

// Récupérer tous les donateurs à haut risque
const highRiskDonators = await prisma.donator.findMany({
  where: {
    isActive: true,
    churnProbability: {
      gte: 0.75, // Probabilité ≥ 75%
    },
  },
  orderBy: {
    churnProbability: 'desc',
  },
});
```

### Exemple 3 : Dashboard de Risque de Churn

```tsx
'use client';

import { useState, useEffect } from 'react';
import { calculateChurnRisk } from '@/app/actions/churn/calculateChurnRisk';
import { ChurnRiskIndicator } from '@/components/donators';

export function ChurnRiskDashboard() {
  const [stats, setStats] = useState(null);

  const handleCalculate = async () => {
    const result = await calculateChurnRisk();
    if (result.success) {
      setStats(result);
    }
  };

  return (
    <div>
      <button onClick={handleCalculate}>Calculer le risque</button>
      {stats && (
        <div>
          <p>Risque élevé: {stats.highRisk}</p>
          <p>Risque modéré: {stats.mediumRisk}</p>
          <p>Risque faible: {stats.lowRisk}</p>
        </div>
      )}
    </div>
  );
}
```

## Checklist de Vérification

- [x] Le champ `churnProbability` est ajouté au modèle `Donator`
- [x] Le script `predict-churn.ts` fonctionne et met à jour les probabilités
- [x] L'action serveur `calculateChurnRisk` fonctionne
- [x] Le composant `ChurnRiskIndicator` affiche correctement le risque
- [x] Le risque de churn est affiché dans le profil donateur
- [x] Les types TypeScript sont à jour
- [x] La documentation est complète

## Notes Techniques

1. **Performance**: Le calcul du risque de churn peut être coûteux pour un grand nombre de donateurs. Il est recommandé de l'exécuter en arrière-plan via une tâche cron.

2. **Précision**: Le modèle actuel utilise des règles heuristiques. Pour améliorer la précision, vous pouvez :
   - Intégrer un modèle de machine learning (régression logistique, random forest, etc.)
   - Ajouter plus de facteurs (engagement email, ouverture des campagnes, etc.)
   - Utiliser des données historiques pour entraîner le modèle

3. **Extensibilité**: Le système peut être étendu pour :
   - Ajouter des alertes automatiques pour les donateurs à haut risque
   - Créer des campagnes de réactivation automatiques
   - Intégrer avec des outils de marketing automation
   - Ajouter des scores de confiance pour les prédictions

4. **Segments Dynamiques**: Les segments dynamiques peuvent utiliser `churnProbability` comme critère :
   ```json
   {
     "churnProbability": {
       "$gte": 0.75
     }
   }
   ```

## Prochaines Étapes

- [ ] Configurer une tâche cron hebdomadaire pour le calcul automatique
- [ ] Créer un segment dynamique "Donateurs à risque" par défaut
- [ ] Ajouter des alertes pour les donateurs à haut risque
- [ ] Implémenter des campagnes de réactivation automatiques
- [ ] Améliorer le modèle avec du machine learning
- [ ] Ajouter des statistiques de churn dans le dashboard
