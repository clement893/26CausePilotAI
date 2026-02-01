# Étape 7.1.2 : Gestion des Organisations

**Date:** 1er février 2026

## Contexte

Cette étape documente et valide le système de gestion des organisations pour les SuperAdmins dans CausePilot.

**Référence:** Architecture Multi-Tenant - Gestion des Organisations

## Vue d'ensemble

Le système de gestion des organisations permet aux SuperAdmins de :
- Créer de nouvelles organisations
- Modifier les organisations existantes
- Supprimer des organisations
- Gérer les modules activés pour chaque organisation
- Gérer les membres des organisations
- Gérer les connexions aux bases de données

## Architecture

### Backend API

**Fichier:** `backend/app/api/v1/endpoints/organizations.py`

#### Endpoints CRUD Organisations

##### 1. Liste des organisations

**GET** `/v1/organizations`

- **Permissions:** SuperAdmin uniquement
- **Paramètres:**
  - `skip` (int, default: 0): Pagination offset
  - `limit` (int, default: 100): Nombre maximum de résultats
- **Retourne:** Liste des organisations avec statistiques (modules activés, nombre de membres)
- **Relations chargées:** modules, members

##### 2. Récupérer une organisation

**GET** `/v1/organizations/{organization_id}`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** Détails complets d'une organisation

##### 3. Créer une organisation

**POST** `/v1/organizations`

- **Permissions:** SuperAdmin uniquement
- **Body:**
  ```json
  {
    "name": "string",
    "slug": "string",
    "db_connection_string": "string (optional)",
    "create_database": "boolean (optional)",
    "settings": "object (optional)"
  }
  ```
- **Fonctionnalités:**
  - Vérifie l'unicité du slug
  - Peut créer automatiquement une base de données si `create_database=true`
  - Crée tous les modules désactivés par défaut
- **Retourne:** Organisation créée

##### 4. Modifier une organisation

**PATCH** `/v1/organizations/{organization_id}`

- **Permissions:** SuperAdmin uniquement
- **Body:** Champs à modifier (tous optionnels)
  ```json
  {
    "name": "string (optional)",
    "slug": "string (optional)",
    "is_active": "boolean (optional)",
    "settings": "object (optional)"
  }
  ```
- **Retourne:** Organisation mise à jour

##### 5. Supprimer une organisation

**DELETE** `/v1/organizations/{organization_id}`

- **Permissions:** SuperAdmin uniquement
- **Attention:** Supprime également tous les modules et membres (cascade)
- **Retourne:** 204 No Content

#### Endpoints Modules

##### 1. Liste des modules

**GET** `/v1/organizations/{organization_id}/modules`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** Liste de tous les modules avec leur statut (activé/désactivé)

##### 2. Activer/Désactiver un module

**POST** `/v1/organizations/{organization_id}/modules/toggle`

- **Permissions:** SuperAdmin uniquement
- **Body:**
  ```json
  {
    "module_key": "string"
  }
  ```
- **Fonctionnalités:**
  - Si le module n'existe pas, le crée et l'active
  - Si le module existe, bascule son statut
- **Retourne:** Module mis à jour

#### Endpoints Membres

##### 1. Liste des membres

**GET** `/v1/organizations/{organization_id}/members`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** Liste de tous les membres avec leurs rôles

##### 2. Inviter un membre

**POST** `/v1/organizations/{organization_id}/members`

- **Permissions:** SuperAdmin uniquement
- **Body:**
  ```json
  {
    "user_email": "string",
    "role": "string (admin|member|viewer)"
  }
  ```
- **Fonctionnalités:**
  - Crée une invitation pour l'utilisateur
  - L'utilisateur peut accepter l'invitation plus tard
- **Retourne:** Membre créé

##### 3. Supprimer un membre

**DELETE** `/v1/organizations/{organization_id}/members/{member_id}`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** 204 No Content

#### Endpoints Base de Données

##### 1. Mettre à jour la connexion

**PATCH** `/v1/organizations/{organization_id}/database`

- **Permissions:** SuperAdmin uniquement
- **Body:**
  ```json
  {
    "db_connection_string": "string",
    "test_connection": "boolean (default: true)"
  }
  ```
- **Fonctionnalités:**
  - Met à jour la chaîne de connexion
  - Teste la connexion si `test_connection=true`
- **Retourne:** Organisation mise à jour

##### 2. Tester la connexion

**POST** `/v1/organizations/{organization_id}/database/test`

- **Permissions:** SuperAdmin uniquement
- **Body:**
  ```json
  {
    "db_connection_string": "string"
  }
  ```
- **Retourne:** Résultat du test de connexion

##### 3. Créer une base de données

**POST** `/v1/organizations/{organization_id}/database/create`

- **Permissions:** SuperAdmin uniquement
- **Fonctionnalités:**
  - Crée automatiquement une nouvelle base de données PostgreSQL
  - Génère la chaîne de connexion
  - Met à jour l'organisation avec la nouvelle connexion
- **Retourne:** Détails de la base de données créée

##### 4. Migrer la base de données

**POST** `/v1/organizations/{organization_id}/database/migrate`

- **Permissions:** SuperAdmin uniquement
- **Fonctionnalités:**
  - Exécute les migrations Alembic sur la base de données de l'organisation
  - Crée toutes les tables nécessaires
- **Retourne:** Résultat de la migration

##### 5. Lister les tables

**GET** `/v1/organizations/{organization_id}/database/tables`

- **Permissions:** SuperAdmin uniquement
- **Retourne:** Liste des tables dans la base de données

### Frontend API Client

**Fichier:** `apps/web/src/lib/api/organizations.ts`

Fonctions disponibles :
- `listOrganizations()`: Liste les organisations
- `getOrganization(organizationId)`: Récupère une organisation
- `createOrganization(data)`: Crée une organisation
- `updateOrganization(organizationId, data)`: Met à jour une organisation
- `deleteOrganization(organizationId)`: Supprime une organisation
- `listOrganizationModules(organizationId)`: Liste les modules
- `toggleOrganizationModule(organizationId, data)`: Active/désactive un module
- `listOrganizationMembers(organizationId)`: Liste les membres
- `inviteMemberToOrganization(organizationId, data)`: Invite un membre
- `removeMemberFromOrganization(organizationId, memberId)`: Supprime un membre
- `updateOrganizationDatabase(organizationId, data)`: Met à jour la connexion DB
- `testOrganizationDatabase(organizationId, data)`: Teste la connexion DB
- `createOrganizationDatabase(organizationId)`: Crée une base de données
- `migrateOrganizationDatabase(organizationId)`: Migre la base de données
- `getOrganizationDatabaseTables(organizationId)`: Liste les tables

### Pages UI

#### 1. Liste des Organisations

**Fichier:** `apps/web/src/app/[locale]/dashboard/super-admin/organisations/page.tsx`

**Route:** `/dashboard/super-admin/organisations`

**Fonctionnalités:**
- Liste toutes les organisations avec statistiques
- Affiche le nombre de modules activés
- Affiche le nombre de membres
- Bouton pour créer une nouvelle organisation
- Actions : Voir détails, Supprimer
- Filtres et recherche (si implémentés)

**Composants:**
- Liste des cartes d'organisations
- Statistiques par organisation
- Badges pour le statut actif/inactif

#### 2. Créer une Organisation

**Fichier:** `apps/web/src/app/[locale]/dashboard/super-admin/organisations/new/page.tsx`

**Route:** `/dashboard/super-admin/organisations/new`

**Fonctionnalités:**
- Formulaire de création
- Champs :
  - Nom de l'organisation (requis)
  - Slug (généré automatiquement depuis le nom, modifiable)
  - Option pour créer automatiquement la base de données
  - Chaîne de connexion (optionnelle si création auto)
- Validation du slug (unicité)
- Redirection vers la liste après création

#### 3. Détails d'une Organisation

**Fichier:** `apps/web/src/app/[locale]/dashboard/super-admin/organisations/[id]/page.tsx`

**Route:** `/dashboard/super-admin/organisations/[id]`

**Fonctionnalités:**
- Affichage des détails de l'organisation
- Gestion des modules (activation/désactivation)
- Gestion des membres (invitation, suppression)
- Gestion de la base de données (connexion, migration, création)
- Édition des paramètres de l'organisation

**Sections:**
1. **Informations générales**
   - Nom, slug, statut
   - Dates de création/modification
   - Paramètres

2. **Modules**
   - Liste de tous les modules disponibles
   - Toggle pour activer/désactiver
   - Indicateur visuel du statut

3. **Membres**
   - Liste des membres avec rôles
   - Formulaire d'invitation
   - Actions : Supprimer membre

4. **Base de données**
   - Chaîne de connexion (masquée par défaut)
   - Bouton pour tester la connexion
   - Bouton pour créer la base de données
   - Bouton pour migrer la base de données
   - Liste des tables (si disponible)

## Flux d'Utilisation

### 1. Créer une Organisation

1. Accéder à `/dashboard/super-admin/organisations`
2. Cliquer sur "Nouvelle organisation"
3. Remplir le formulaire :
   - Nom de l'organisation
   - Slug (généré automatiquement)
   - Optionnellement cocher "Créer automatiquement la base de données"
4. Cliquer sur "Créer"
5. L'organisation est créée avec tous les modules désactivés
6. Si création auto de la DB, la base de données est créée automatiquement

### 2. Activer des Modules

1. Accéder aux détails d'une organisation
2. Aller dans la section "Modules"
3. Cliquer sur le toggle pour activer/désactiver un module
4. Le module est immédiatement activé/désactivé

### 3. Inviter un Membre

1. Accéder aux détails d'une organisation
2. Aller dans la section "Membres"
3. Remplir le formulaire d'invitation :
   - Email de l'utilisateur
   - Rôle (admin, member, viewer)
4. Cliquer sur "Inviter"
5. L'invitation est créée (l'utilisateur peut l'accepter plus tard)

### 4. Gérer la Base de Données

1. Accéder aux détails d'une organisation
2. Aller dans la section "Base de données"
3. Options disponibles :
   - Mettre à jour la chaîne de connexion
   - Tester la connexion
   - Créer une nouvelle base de données
   - Migrer la base de données (créer les tables)
   - Voir les tables existantes

## Sécurité

### Permissions

- **Tous les endpoints** : Requièrent le rôle SuperAdmin
- **Vérification** : Utilise `require_superadmin` dependency
- **Isolation** : Les SuperAdmins peuvent voir toutes les organisations

### Validation

- **Slug** : Doit être unique, format URL-friendly
- **Email** : Validation du format email pour les invitations
- **Rôle** : Doit être dans la liste des rôles valides (admin, member, viewer)
- **Module** : Doit être dans la liste des modules disponibles

## Checklist de Vérification

- [x] Endpoints API CRUD pour organisations
- [x] Endpoints API pour modules
- [x] Endpoints API pour membres
- [x] Endpoints API pour base de données
- [x] Client API frontend complet
- [x] Page liste des organisations
- [x] Page création d'organisation
- [x] Page détails d'organisation
- [x] Gestion des modules (toggle)
- [x] Gestion des membres (invitation, suppression)
- [x] Gestion de la base de données (connexion, migration, création)
- [x] Protection SuperAdmin sur toutes les routes
- [x] Validation des données
- [x] Gestion des erreurs

## Notes Techniques

1. **Création automatique de DB**: Le système peut créer automatiquement une base de données PostgreSQL pour une nouvelle organisation via `OrganizationDatabaseManager`.

2. **Modules**: Tous les modules sont créés désactivés par défaut lors de la création d'une organisation.

3. **Membres**: Les membres sont identifiés par email. L'invitation peut être acceptée plus tard par l'utilisateur.

4. **Base de données**: Chaque organisation a sa propre chaîne de connexion à sa base de données dédiée.

5. **Migrations**: Les migrations Alembic peuvent être exécutées séparément pour chaque organisation.

6. **Cascade**: La suppression d'une organisation supprime également tous ses modules et membres (cascade).

## Prochaines Étapes

- [ ] Ajouter des filtres et recherche dans la liste des organisations
- [ ] Ajouter des statistiques globales (nombre total d'organisations, modules les plus utilisés, etc.)
- [ ] Implémenter l'export/import des configurations d'organisation
- [ ] Ajouter des quotas et limites par organisation
- [ ] Implémenter des métriques et monitoring par organisation
- [ ] Ajouter des logs d'audit pour les actions SuperAdmin
- [ ] Créer des templates d'organisations pré-configurées
- [ ] Implémenter la duplication d'organisations
