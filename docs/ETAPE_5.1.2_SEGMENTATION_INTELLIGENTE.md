# Étape 5.1.2 : Segmentation Intelligente

**Date:** 1er février 2026  
**Référence:** Section 12.2 - Segmentation Intelligente

---

## Vue d'ensemble

La segmentation intelligente utilise un algorithme de clustering (K-Means simplifié) pour identifier des groupes de donateurs similaires et suggérer des segments pertinents.

### Algorithme de Clustering

Le clustering est basé sur 4 métriques :
- **Recency** : Jours depuis le dernier don
- **Frequency** : Nombre de dons
- **Monetary** : Montant total des dons
- **Score** : Score de propension (0-100)

L'algorithme K-Means regroupe les donateurs en clusters similaires, puis génère des suggestions de segments basées sur les caractéristiques de chaque cluster.

### Types de Segments Suggérés

1. **Donateurs à haut potentiel** : Score ≥ 70 et montant total ≥ 500 CAD
2. **Donateurs à risque de churn** : Pas de don depuis > 180 jours mais ont déjà donné
3. **Donateurs fidèles** : ≥ 5 dons et montant total ≥ 250 CAD
4. **Donateurs actifs récents** : Don récent (≤ 90 jours) et score ≥ 50
5. **Grands donateurs** : Montant total ≥ 1000 CAD

---

## Implémentation

### 1. Modèle Prisma

**Fichier:** `packages/database/prisma/schema.prisma`

```prisma
model SegmentSuggestion {
  id            String   @id @default(cuid())
  organizationId String
  organization   Organization @relation(...)
  
  name          String
  description   String   @db.Text
  criteria      Json     // Critères de segmentation
  donorCount    Int      @default(0)
  
  clusterId     String?
  confidence    Float?
  
  isAccepted    Boolean  @default(false)
  acceptedAt    DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 2. Script de Génération

**Fichier:** `scripts/generate-segment-suggestions.ts`

**Usage:**
```bash
pnpm tsx scripts/generate-segment-suggestions.ts <organizationId>
```

Le script :
- Récupère tous les donateurs actifs avec leurs métriques
- Calcule les features RFM pour chaque donateur
- Effectue un clustering K-Means (2-5 clusters selon le nombre de donateurs)
- Génère des suggestions de segments pour chaque cluster
- Sauvegarde les suggestions dans la base de données

### 3. Composant

**Fichier:** `apps/web/src/components/segments/SegmentSuggestionCard.tsx`

Affiche une carte avec :
- Nom et description du segment suggéré
- Nombre de donateurs concernés
- Score de confiance (si disponible)
- Critères de segmentation
- Bouton "Créer le segment"

### 4. Page

**Fichier:** `apps/web/src/app/[locale]/dashboard/base-donateur/segments/suggestions/page.tsx`

**Route:** `/dashboard/base-donateur/segments/suggestions`

Affiche :
- Liste des suggestions disponibles (non acceptées)
- Liste des suggestions acceptées
- Bouton pour actualiser la liste

### 5. Actions Serveur

**Fichier:** `apps/web/src/app/actions/segments/createSegmentFromSuggestion.ts`

- `createSegmentFromSuggestion()` : Crée un segment depuis une suggestion et marque la suggestion comme acceptée

### 6. API Client

**Fichier:** `apps/web/src/lib/api/donors.ts`

- `listSegmentSuggestions()` : Liste les suggestions de segments pour une organisation

---

## Workflow

1. **Génération des suggestions** :
   ```bash
   pnpm tsx scripts/generate-segment-suggestions.ts <organizationId>
   ```

2. **Visualisation** :
   - Accéder à `/dashboard/base-donateur/segments/suggestions`
   - Voir les suggestions générées

3. **Création d'un segment** :
   - Cliquer sur "Créer le segment" sur une suggestion
   - Le segment est créé avec les critères de la suggestion
   - La suggestion est marquée comme acceptée

---

## Tâche Cron (Optionnel)

Pour automatiser la génération quotidienne :

1. **Via un endpoint API** : Créer un endpoint admin qui appelle le script
2. **Via un cron job** : Utiliser Vercel Cron ou Railway Cron
3. **Via un script système** : Configurer un cron sur le serveur

**Exemple Vercel Cron** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/admin/generate-segment-suggestions",
    "schedule": "0 3 * * *"
  }]
}
```

---

## Checklist

- [x] Le modèle `SegmentSuggestion` est créé dans Prisma
- [x] Le script de génération de suggestions fonctionne (`scripts/generate-segment-suggestions.ts`)
- [x] Le composant `SegmentSuggestionCard` est créé
- [x] La page `/segments/suggestions` est créée
- [x] L'action serveur pour créer un segment depuis une suggestion est créée
- [x] Les types TypeScript sont ajoutés (`SegmentSuggestion`, `SegmentSuggestionList`)
- [ ] L'API backend pour les suggestions est implémentée (à faire côté backend)
- [ ] La tâche cron est configurée (optionnel)

---

## Notes

- Le clustering nécessite au moins 3 donateurs par cluster pour générer une suggestion
- Les suggestions sont supprimées et régénérées à chaque exécution du script (sauf celles acceptées)
- Le score de confiance est calculé basé sur la cohérence du cluster (variance faible = confiance élevée)
- Les critères de segmentation sont générés automatiquement à partir des caractéristiques du cluster
