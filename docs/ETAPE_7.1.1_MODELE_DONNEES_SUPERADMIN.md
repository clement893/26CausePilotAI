# Étape 7.1.1 - Modèle de données Super Admin

## Statut
✅ **Complété**

## Résumé
Création des modèles Prisma nécessaires pour le module Super Admin permettant de gérer plusieurs organisations, monitorer la plateforme et gérer les abonnements.

## Modèles créés

### 1. Enums ajoutés

#### `SubscriptionPlan`
```prisma
enum SubscriptionPlan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

#### `OrganizationSubscriptionStatus`
```prisma
enum OrganizationSubscriptionStatus {
  ACTIVE
  CANCELED
  EXPIRED
  TRIAL
}
```

#### `Role` (mis à jour)
Ajout du rôle `SUPER_ADMIN` à l'enum existant.

### 2. Modèles créés

#### `OrganizationSubscription`
Modèle pour gérer les abonnements des organisations avec :
- Plan (FREE, STARTER, PROFESSIONAL, ENTERPRISE)
- Statut (ACTIVE, CANCELED, EXPIRED, TRIAL)
- Limites (maxUsers, maxDonors, maxForms, maxCampaigns)
- Dates (startDate, endDate, trialEndDate)
- Intégration Stripe (stripeCustomerId, stripeSubscriptionId)

#### `SystemLog`
Modèle pour logger les événements système avec :
- Contexte (organizationId, userId)
- Type et niveau (info, warning, error, critical)
- Message et détails (JSON)
- Métadonnées (IP, userAgent, endpoint, method, statusCode)

#### `PlatformMetric`
Modèle pour stocker les métriques de la plateforme avec :
- Métriques globales (totalOrganizations, totalUsers, totalDonors, etc.)
- Métriques d'activité (activeOrganizations, newOrganizations, activeUsers)
- Métriques techniques (apiCalls, emailsSent, smsSent, storageUsed)

### 3. Modèles mis à jour

#### `Organization`
- Ajout de la relation `organizationSubscription`
- Ajout de la relation `systemLogs`
- Ajout des relations pour les nouveaux modèles (objectives, budgets, goals, campaigns)

#### `User`
- Ajout du rôle `SUPER_ADMIN`
- Ajout de la relation `systemLogs`
- Ajout des relations pour les nouveaux modèles (objectives, keyResults, budgetItems, goals)

### 4. Modèles pour la phase 7.2

#### `Campaign`
Modèle minimal créé pour les relations avec `Goal`.

#### `Objective` et `KeyResult`
Modèles pour la planification stratégique (OKR).

#### `Budget` et `BudgetItem`
Modèles pour la gestion des budgets.

#### `Goal`
Modèle pour la gestion des objectifs opérationnels.

## Fichiers modifiés

- `packages/database/prisma/schema.prisma` - Ajout de tous les modèles et enums

## Fichiers créés

- `apps/web/src/lib/logging/systemLogger.ts` - Middleware pour logger les événements système

## Commandes exécutées

```bash
cd packages/database
npx prisma format
npx prisma generate
```

## Prochaines étapes

1. Créer les migrations Prisma pour appliquer les changements à la base de données
2. Implémenter les endpoints API backend pour les nouveaux modèles
3. Créer les composants UI pour la gestion des abonnements
4. Créer les pages de monitoring avec les métriques

## Notes techniques

- Le modèle `Subscription` existant (pour les dons récurrents) a été conservé
- Le nouveau modèle `OrganizationSubscription` est distinct pour éviter les conflits
- Les relations avec `Campaign` sont optionnelles car Campaign peut être géré dans des bases de données séparées
- Le système de logging est conçu pour être non-bloquant (ne pas faire échouer les opérations si le logging échoue)
