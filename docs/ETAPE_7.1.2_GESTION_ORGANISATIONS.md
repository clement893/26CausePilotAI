# Étape 7.1.2 - Gestion des organisations (Super Admin)

## Statut
🔄 **En cours** - Actions serveur créées, composants UI partiellement créés

## Résumé
Création de l'interface Super Admin pour gérer toutes les organisations de la plateforme : création, édition, suspension, gestion des abonnements.

## Actions serveur créées

### 1. `getOrganizationsAction`
**Fichier :** `apps/web/src/app/actions/superadmin/organizations/getOrganizationsAction.ts`

Récupère la liste des organisations avec :
- Filtres (recherche, plan, statut)
- Pagination
- Informations d'abonnement incluses
- Compteurs (utilisateurs, donateurs, formulaires, campagnes)

### 2. `createOrganizationAction`
**Fichier :** `apps/web/src/app/actions/superadmin/organizations/createOrganizationAction.ts`

Crée une nouvelle organisation avec :
- Validation de l'unicité du slug
- Création automatique de l'abonnement
- Transaction pour garantir la cohérence
- Logging de l'événement

### 3. `updateSubscriptionAction`
**Fichier :** `apps/web/src/app/actions/superadmin/organizations/updateSubscriptionAction.ts`

Met à jour l'abonnement d'une organisation :
- Plan et statut
- Dates (début, fin, fin d'essai)
- Limites personnalisées
- Création automatique si l'abonnement n'existe pas
- Logging de l'événement

### 4. `suspendOrganizationAction`
**Fichier :** `apps/web/src/app/actions/superadmin/organizations/suspendOrganizationAction.ts`

Suspend une organisation :
- Désactive l'organisation (`isActive = false`)
- Met le statut de l'abonnement à `CANCELED`
- Logging avec raison

## Composants créés

### 1. `SubscriptionManagementModal`
**Fichier :** `apps/web/src/components/superadmin/SubscriptionManagementModal.tsx`

Modal pour gérer les abonnements avec :
- Sélection de plan (cards visuelles)
- Sélection de statut
- Gestion des dates
- Configuration des limites (sliders/inputs)
- Validation et soumission

## Fichiers créés

- `apps/web/src/app/actions/superadmin/organizations/getOrganizationsAction.ts`
- `apps/web/src/app/actions/superadmin/organizations/createOrganizationAction.ts`
- `apps/web/src/app/actions/superadmin/organizations/updateSubscriptionAction.ts`
- `apps/web/src/app/actions/superadmin/organizations/suspendOrganizationAction.ts`
- `apps/web/src/app/actions/superadmin/organizations/index.ts`
- `apps/web/src/components/superadmin/SubscriptionManagementModal.tsx`
- `apps/web/src/lib/logging/systemLogger.ts`

## Pages existantes à mettre à jour

Les pages suivantes existent déjà mais doivent être mises à jour pour intégrer la gestion des abonnements :

1. **Page liste des organisations** (`/dashboard/super-admin/organisations/page.tsx`)
   - Ajouter filtres par plan et statut
   - Afficher les informations d'abonnement dans le tableau
   - Ajouter bouton "Gérer abonnement"

2. **Page de création d'organisation** (`/dashboard/super-admin/organisations/new/page.tsx`)
   - Ajouter section "Abonnement initial" au formulaire
   - Permettre de définir le plan et les limites lors de la création

3. **Page de détails d'organisation** (`/dashboard/super-admin/organisations/[id]/page.tsx`)
   - Ajouter onglet "Abonnement"
   - Afficher les informations d'abonnement
   - Permettre la modification via le modal

## Composants à créer

1. **`OrganizationTable`** - Table avec tri, sélection, actions
2. **`OrganizationFilters`** - Barre de recherche et filtres
3. **`SubscriptionBadge`** - Badge coloré selon le plan et le statut
4. **`UsageMeter`** - Barre de progression montrant l'utilisation par rapport aux limites

## Prochaines étapes

1. ✅ Créer les actions serveur (fait)
2. ✅ Créer le modal de gestion d'abonnement (fait)
3. ⏳ Mettre à jour la page liste des organisations
4. ⏳ Mettre à jour la page de création d'organisation
5. ⏳ Mettre à jour la page de détails d'organisation
6. ⏳ Créer les composants manquants (OrganizationTable, OrganizationFilters, SubscriptionBadge, UsageMeter)
7. ⏳ Ajouter la protection des routes dans middleware.ts

## Notes techniques

- Les actions serveur vérifient le rôle `SUPER_ADMIN` avant d'exécuter
- Toutes les actions importantes sont loggées dans `SystemLog`
- Les transactions Prisma sont utilisées pour garantir la cohérence
- Le système de logging est non-bloquant
