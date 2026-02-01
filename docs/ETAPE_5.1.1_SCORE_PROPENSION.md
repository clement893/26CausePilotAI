# Étape 5.1.1 : Score de Propension

**Date:** 1er février 2026  
**Référence:** Section 12.1 - Score de Propension

---

## Vue d'ensemble

Le score de propension calcule un score de 0 à 100 pour chaque donateur basé sur le modèle RFM (Recency, Frequency, Monetary).

### Calcul RFM

- **Recency (R)** : Dernière donation (40% du score)
  - 5 = Très récent (0-30 jours)
  - 4 = Récent (31-90 jours)
  - 3 = Modéré (91-180 jours)
  - 2 = Ancien (181-365 jours)
  - 1 = Très ancien (>365 jours) ou jamais donné

- **Frequency (F)** : Fréquence des dons (30% du score)
  - 5 = Très fréquent (10+ dons)
  - 4 = Fréquent (5-9 dons)
  - 3 = Modéré (3-4 dons)
  - 2 = Occasionnel (1-2 dons)
  - 1 = Jamais donné

- **Monetary (M)** : Montant total des dons (30% du score)
  - 5 = Très élevé (1000+ CAD)
  - 4 = Élevé (500-999 CAD)
  - 3 = Modéré (250-499 CAD)
  - 2 = Faible (100-249 CAD)
  - 1 = Très faible (<100 CAD)

**Score final** = (R × 0.4 + F × 0.3 + M × 0.3) / 5 × 100

---

## Implémentation

### 1. Modèle Prisma

Le champ `score` existe déjà dans le modèle `Donator` :

```prisma
model Donator {
  // ...
  score Int @default(0) // Score de propension au don (0-100)
  // ...
}
```

### 2. Script de Calcul

**Fichier:** `scripts/calculate-propensity-scores.ts`

**Usage:**
```bash
# Via tsx
pnpm tsx scripts/calculate-propensity-scores.ts

# Ou via Node.js (après build)
node dist/scripts/calculate-propensity-scores.js
```

Le script :
- Récupère tous les donateurs avec leurs dons complétés
- Calcule le score RFM pour chaque donateur
- Met à jour le champ `score` dans la base de données

### 3. Action Serveur

**Fichier:** `apps/web/src/app/actions/propensity/calculatePropensityScores.ts`

**Usage:**
```typescript
import { calculatePropensityScores } from '@/app/actions/propensity/calculatePropensityScores';

const result = await calculatePropensityScores();
// { success: true, updated: 150, skipped: 0 }
```

### 4. Affichage sur le Profil

Le score est affiché sur le profil du donateur (`/dashboard/donateurs/[id]`) via le composant `DonatorStatsCards`.

Le composant utilise le champ `donor.score` s'il existe, sinon calcule un score simple en fallback.

---

## Tâche Cron (Optionnel)

Pour automatiser le calcul quotidien, vous pouvez :

1. **Via un endpoint API** : Créer un endpoint admin qui appelle `calculatePropensityScores()`
2. **Via un cron job** : Utiliser un service comme Vercel Cron ou Railway Cron
3. **Via un script système** : Configurer un cron sur le serveur

**Exemple Vercel Cron** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/admin/calculate-propensity-scores",
    "schedule": "0 2 * * *"
  }]
}
```

---

## Checklist

- [x] Le champ `score` est ajouté au modèle `Donator` (déjà présent)
- [x] Le script de calcul fonctionne (`scripts/calculate-propensity-scores.ts`)
- [x] L'action serveur est créée (`apps/web/src/app/actions/propensity/calculatePropensityScores.ts`)
- [x] Le score est affiché sur le profil du donateur (`DonatorStatsCards`)
- [ ] La tâche cron est configurée (optionnel, à faire selon les besoins)

---

## Notes

- Le calcul se base uniquement sur les dons avec `status: 'completed'`
- Les seuils monétaires (100, 250, 500, 1000 CAD) peuvent être ajustés selon le contexte
- Le score est recalculé à chaque exécution du script (écrase la valeur précédente)
