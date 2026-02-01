# Étape 7.1.3 : Monitoring de la Plateforme

**Date:** 1er février 2026

## Contexte

Cette étape implémente le système de monitoring de la plateforme pour les SuperAdmins, permettant de surveiller la santé et les statistiques globales de la plateforme.

**Référence:** Architecture Multi-Tenant - Monitoring de la Plateforme

## Objectifs

- Créer des endpoints API pour les statistiques de la plateforme
- Créer un dashboard de monitoring SuperAdmin
- Afficher les métriques globales (organisations, utilisateurs, modules, membres)
- Surveiller la santé de la plateforme
- Visualiser l'utilisation des modules

## Architecture

### Backend API

**Fichier:** `backend/app/api/v1/endpoints/platform_monitoring.py`

#### Endpoints

##### 1. Statistiques de la Plateforme

**GET** `/v1/platform/stats`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** Statistiques globales de la plateforme
  - Organisations (total, actives, inactives, nouvelles 7 jours)
  - Utilisateurs (total, actifs, inactifs, nouveaux 7 jours)
  - Modules (total activés, total configurés)
  - Membres (total, rejoints, en attente)
  - Abonnements (total, actifs)
  - Activité récente

##### 2. Statistiques des Organisations

**GET** `/v1/platform/organizations/stats`

- **Permissions:** SuperAdmin uniquement
- **Paramètres:**
  - `skip` (int, default: 0): Pagination offset
  - `limit` (int, default: 100): Nombre maximum de résultats
- **Retourne:** Liste des organisations avec statistiques détaillées
  - ID, nom, slug
  - Statut actif/inactif
  - Nombre de modules activés
  - Nombre de membres
  - Date de création
  - Dernière activité

##### 3. Utilisation des Modules

**GET** `/v1/platform/modules/usage`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** Statistiques d'utilisation de chaque module
  - Module key
  - Nombre d'organisations avec le module activé
  - Total d'organisations
  - Pourcentage d'utilisation

##### 4. Santé de la Plateforme

**GET** `/v1/platform/health`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** État de santé de la plateforme
  - Statut (healthy/degraded/unhealthy)
  - État de la base de données (connectée/déconnectée)
  - Compteurs (organisations, utilisateurs)
  - Timestamp

### Frontend API Client

**Fichier:** `apps/web/src/lib/api/platform-monitoring.ts`

Fonctions disponibles :
- `getPlatformStats()`: Récupère les statistiques globales
- `getOrganizationsStats(skip, limit)`: Récupère les statistiques des organisations
- `getModuleUsageStats()`: Récupère les statistiques d'utilisation des modules
- `getPlatformHealth()`: Récupère l'état de santé de la plateforme

### Page UI

#### Dashboard de Monitoring

**Fichier:** `apps/web/src/app/[locale]/dashboard/super-admin/monitoring/page.tsx`

**Route:** `/dashboard/super-admin/monitoring`

**Fonctionnalités:**
- Affichage de la santé de la plateforme
- Statistiques globales (organisations, utilisateurs, modules, membres)
- Activité récente (7 derniers jours)
- Utilisation des modules (graphiques de progression)
- Liste des organisations récentes
- Actualisation automatique toutes les 30 secondes

**Sections:**
1. **Santé de la Plateforme**
   - Statut global (healthy/degraded/unhealthy)
   - État de la base de données
   - Compteurs de base

2. **Statistiques Principales**
   - Cartes de statistiques (organisations, utilisateurs, modules, membres)
   - Indicateurs visuels avec icônes
   - Sous-titres avec détails

3. **Activité Récente**
   - Nouvelles organisations (7 jours)
   - Nouveaux utilisateurs (7 jours)
   - Statut des membres

4. **Utilisation des Modules**
   - Liste de tous les modules
   - Barres de progression pour chaque module
   - Pourcentage d'utilisation
   - Nombre d'organisations avec le module activé

5. **Organisations Récentes**
   - Liste des 10 organisations les plus récentes
   - Nombre de modules activés
   - Nombre de membres
   - Statut actif/inactif

## Flux d'Utilisation

### 1. Accès au Dashboard

1. Accéder à `/dashboard/super-admin/monitoring`
2. Le dashboard charge automatiquement toutes les statistiques
3. Les données sont actualisées automatiquement toutes les 30 secondes

### 2. Visualisation des Métriques

1. La section "Santé de la Plateforme" affiche le statut global
2. Les cartes de statistiques montrent les métriques principales
3. La section "Utilisation des Modules" montre quels modules sont les plus utilisés
4. La liste des organisations récentes permet de voir l'activité récente

### 3. Surveillance Continue

1. Le dashboard se met à jour automatiquement toutes les 30 secondes
2. Les alertes visuelles indiquent les problèmes (statut degraded/unhealthy)
3. Les métriques permettent d'identifier les tendances

## Sécurité

### Permissions

- **Tous les endpoints** : Requièrent le rôle SuperAdmin
- **Vérification** : Utilise `require_superadmin` dependency
- **Protection UI** : Utilise `ProtectedSuperAdminRoute` component

### Données Sensibles

- Les statistiques agrégées ne contiennent pas de données personnelles
- Les informations sont au niveau organisationnel uniquement
- Pas d'accès aux données individuelles des utilisateurs

## Checklist de Vérification

- [x] Endpoint `/v1/platform/stats` fonctionne
- [x] Endpoint `/v1/platform/organizations/stats` fonctionne
- [x] Endpoint `/v1/platform/modules/usage` fonctionne
- [x] Endpoint `/v1/platform/health` fonctionne
- [x] Client API frontend complet
- [x] Page dashboard de monitoring
- [x] Affichage de la santé de la plateforme
- [x] Statistiques globales affichées
- [x] Utilisation des modules visualisée
- [x] Liste des organisations récentes
- [x] Actualisation automatique
- [x] Protection SuperAdmin sur toutes les routes

## Notes Techniques

1. **Performance**: Les statistiques sont calculées à la volée. Pour de meilleures performances, on pourrait implémenter un cache Redis.

2. **Actualisation**: Le dashboard se met à jour automatiquement toutes les 30 secondes pour maintenir les données à jour.

3. **Santé**: Le statut de santé est basé sur la connectivité de la base de données et les compteurs de base.

4. **Modules**: Les statistiques d'utilisation des modules montrent combien d'organisations utilisent chaque module.

5. **Organisations**: La liste des organisations récentes est limitée à 10 pour des raisons de performance.

## Prochaines Étapes

- [ ] Ajouter des graphiques de tendances (évolution dans le temps)
- [ ] Implémenter un système d'alertes automatiques
- [ ] Ajouter des métriques de performance (temps de réponse API, etc.)
- [ ] Créer des rapports exportables (PDF, CSV)
- [ ] Ajouter des filtres par période (jour, semaine, mois)
- [ ] Implémenter des comparaisons entre périodes
- [ ] Ajouter des métriques de croissance (taux de croissance, etc.)
- [ ] Créer des tableaux de bord personnalisables
