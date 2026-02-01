# Étape 7.1.1 : Modèle de Données SuperAdmin

**Date:** 1er février 2026

## Contexte

Cette étape documente et valide le modèle de données SuperAdmin pour la gestion multi-tenant des organisations dans CausePilot.

**Référence:** Architecture Multi-Tenant - Modèle de données SuperAdmin

## Vue d'ensemble

Le système SuperAdmin gère les organisations dans une architecture multi-tenant où chaque organisation possède :
- Sa propre base de données séparée
- Ses modules activables/désactivables
- Ses membres avec rôles
- Une isolation complète des données

## Modèles de Données

### 1. Organization (Organisation)

**Fichier:** `backend/app/models/organization.py`

**Table:** `organizations`

**Description:** Représente une organisation dans le système multi-tenant.

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | Primary Key, Index | Identifiant unique de l'organisation |
| `name` | String(255) | Not Null, Index | Nom de l'organisation |
| `slug` | String(255) | Unique, Not Null, Index | Identifiant URL-friendly unique |
| `db_connection_string` | Text | Not Null | Chaîne de connexion à la base de données dédiée |
| `is_active` | Boolean | Default: True, Index | Statut actif/inactif de l'organisation |
| `settings` | JSON | Default: dict | Paramètres additionnels (JSONB) |
| `created_at` | DateTime(timezone) | Not Null | Date de création |
| `updated_at` | DateTime(timezone) | Not Null | Date de dernière mise à jour |

**Relationships:**
- `modules`: Relation vers `OrganizationModule` (cascade delete)
- `members`: Relation vers `OrganizationMember` (cascade delete)

**Propriétés:**
- `enabled_modules_count`: Nombre de modules activés
- `total_members`: Nombre total de membres

**Indexes:**
- `ix_organizations_id`
- `ix_organizations_name`
- `ix_organizations_slug`
- `ix_organizations_is_active`

### 2. OrganizationModule (Module d'Organisation)

**Fichier:** `backend/app/models/organization_module.py`

**Table:** `organization_modules`

**Description:** Contrôle quels modules (fonctionnalités) sont disponibles pour une organisation.

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | Primary Key, Index | Identifiant unique du module |
| `organization_id` | UUID | Foreign Key → organizations.id, Not Null, Index | ID de l'organisation |
| `module_key` | String(50) | Not Null, Index | Identifiant du module |
| `is_enabled` | Boolean | Default: False, Index | Module activé ou non |
| `settings` | JSON | Default: dict | Paramètres spécifiques au module (JSONB) |
| `created_at` | DateTime(timezone) | Not Null | Date de création |

**Relationships:**
- `organization`: Relation vers `Organization`

**Contraintes:**
- Unique constraint sur (`organization_id`, `module_key`)

**Modules disponibles:**
- `base-donateur`: Gestion des donateurs, statistiques, segments
- `formulaires`: Formulaires de collecte et intégrations
- `campagnes`: Campagnes, courriels, médias sociaux
- `p2p`: Campagnes peer-to-peer
- `analytics`: Dashboard, rapports, IA
- `administration`: Users et paramètres

**Indexes:**
- `ix_organization_modules_id`
- `ix_organization_modules_organization_id`
- `ix_organization_modules_module_key`
- `ix_organization_modules_is_enabled`
- Unique constraint: `uq_org_module` sur (`organization_id`, `module_key`)

### 3. OrganizationMember (Membre d'Organisation)

**Fichier:** `backend/app/models/organization_member.py`

**Table:** `organization_members`

**Description:** Lie les utilisateurs aux organisations avec des rôles spécifiques.

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | Primary Key, Index | Identifiant unique du membre |
| `organization_id` | UUID | Foreign Key → organizations.id, Not Null, Index | ID de l'organisation |
| `user_email` | String(255) | Not Null, Index | Email de l'utilisateur |
| `role` | String(50) | Default: "member", Not Null | Rôle dans l'organisation |
| `invited_by` | Integer | Foreign Key → users.id, Nullable | SuperAdmin qui a invité |
| `joined_at` | DateTime(timezone) | Nullable | Date d'acceptation de l'invitation |
| `created_at` | DateTime(timezone) | Not Null | Date de création |

**Relationships:**
- `organization`: Relation vers `Organization`

**Rôles disponibles:**
- `admin`: Peut gérer les paramètres de l'organisation et les membres
- `member`: Peut utiliser les modules activés
- `viewer`: Accès lecture seule

**Contraintes:**
- Unique constraint sur (`organization_id`, `user_email`)

**Propriétés:**
- `is_admin`: Vérifie si le membre est admin
- `has_joined`: Vérifie si le membre a accepté l'invitation

**Indexes:**
- `ix_organization_members_id`
- `ix_organization_members_organization_id`
- `ix_organization_members_user_email`
- Unique constraint: `uq_org_member` sur (`organization_id`, `user_email`)

### 4. Role (Rôle)

**Fichier:** `backend/app/models/role.py`

**Table:** `roles`

**Description:** Rôles système pour le RBAC (Role-Based Access Control).

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | Primary Key | Identifiant unique du rôle |
| `name` | String(100) | Unique, Not Null, Index | Nom du rôle |
| `slug` | String(100) | Unique, Not Null, Index | Identifiant URL-friendly |
| `description` | Text | Nullable | Description du rôle |
| `is_system` | Boolean | Default: False | Rôle système (ne peut pas être supprimé) |
| `is_active` | Boolean | Default: True, Index | Rôle actif ou non |
| `created_at` | DateTime(timezone) | Not Null | Date de création |
| `updated_at` | DateTime(timezone) | Not Null | Date de dernière mise à jour |

**Relationships:**
- `permissions`: Relation vers `RolePermission`
- `user_roles`: Relation vers `UserRole`
- `team_members`: Relation vers `TeamMember`
- `invitations`: Relation vers `Invitation`

**Rôle système principal:**
- `superadmin`: Super administrateur avec accès complet au système

**Indexes:**
- `idx_roles_name`
- `idx_roles_is_active`

### 5. Permission (Permission)

**Fichier:** `backend/app/models/role.py`

**Table:** `permissions`

**Description:** Permissions individuelles pour le RBAC.

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | Primary Key | Identifiant unique de la permission |
| `resource` | String(100) | Not Null, Index | Ressource (ex: "users", "teams") |
| `action` | String(50) | Not Null, Index | Action (ex: "create", "read", "update", "delete") |
| `name` | String(200) | Unique, Not Null | Nom complet (ex: "users:create") |
| `description` | Text | Nullable | Description de la permission |
| `created_at` | DateTime(timezone) | Not Null | Date de création |

**Relationships:**
- `role_permissions`: Relation vers `RolePermission`
- `user_permissions`: Relation vers `UserPermission`

**Indexes:**
- `idx_permissions_resource`
- `idx_permissions_action`
- `idx_permissions_resource_action` (composite)

### 6. RolePermission (Permission de Rôle)

**Fichier:** `backend/app/models/role.py`

**Table:** `role_permissions`

**Description:** Relation many-to-many entre les rôles et les permissions.

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | Primary Key | Identifiant unique |
| `role_id` | Integer | Foreign Key → roles.id, Not Null, Index | ID du rôle |
| `permission_id` | Integer | Foreign Key → permissions.id, Not Null, Index | ID de la permission |
| `created_at` | DateTime(timezone) | Not Null | Date de création |

**Relationships:**
- `role`: Relation vers `Role`
- `permission`: Relation vers `Permission`

**Contraintes:**
- Unique constraint sur (`role_id`, `permission_id`)

**Indexes:**
- `idx_role_permissions_role`
- `idx_role_permissions_permission`
- `idx_role_permissions_unique` (unique)

### 7. UserRole (Rôle d'Utilisateur)

**Fichier:** `backend/app/models/role.py`

**Table:** `user_roles`

**Description:** Relation many-to-many entre les utilisateurs et les rôles.

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | Primary Key | Identifiant unique |
| `user_id` | Integer | Foreign Key → users.id, Not Null, Index | ID de l'utilisateur |
| `role_id` | Integer | Foreign Key → roles.id, Not Null, Index | ID du rôle |
| `created_at` | DateTime(timezone) | Not Null | Date de création |

**Relationships:**
- `role`: Relation vers `Role`
- `user`: Relation vers `User`

**Contraintes:**
- Unique constraint sur (`user_id`, `role_id`)

**Indexes:**
- `idx_user_roles_user`
- `idx_user_roles_role`
- `idx_user_roles_unique` (unique)

### 8. UserPermission (Permission d'Utilisateur)

**Fichier:** `backend/app/models/role.py`

**Table:** `user_permissions`

**Description:** Permissions personnalisées pour les utilisateurs (outrepassant les rôles).

**Champs:**

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | Integer | Primary Key | Identifiant unique |
| `user_id` | Integer | Foreign Key → users.id, Not Null, Index | ID de l'utilisateur |
| `permission_id` | Integer | Foreign Key → permissions.id, Not Null, Index | ID de la permission |
| `created_at` | DateTime(timezone) | Not Null | Date de création |

**Relationships:**
- `user`: Relation vers `User`
- `permission`: Relation vers `Permission`

**Contraintes:**
- Unique constraint sur (`user_id`, `permission_id`)

**Indexes:**
- `idx_user_permissions_user`
- `idx_user_permissions_permission`
- `idx_user_permissions_unique` (unique)

## Architecture Multi-Tenant

### Base de données principale (système)

Contient les tables suivantes :
- `organizations`: Liste des organisations
- `organization_modules`: Configuration des modules par organisation
- `organization_members`: Membres des organisations avec leurs rôles
- `users`: Utilisateurs du système
- `roles`: Rôles système
- `permissions`: Permissions individuelles
- `user_roles`: Assignation de rôles aux utilisateurs
- `role_permissions`: Assignation de permissions aux rôles

### Base de données par organisation

Chaque organisation a sa propre base de données PostgreSQL avec :
- Donateurs
- Campagnes
- Formulaires
- Analytics
- Toutes les données métier spécifiques à l'organisation

## Permissions SuperAdmin

### SuperAdmin

Le rôle `superadmin` permet :
- Créer/supprimer les organisations
- Activer/désactiver les modules pour chaque organisation
- Inviter les membres aux organisations
- Voir toutes les organisations
- Naviguer entre les organisations
- Gérer les utilisateurs système

### Organization Admin

- Gère les paramètres de son organisation
- Utilise tous les modules activés
- Ne peut pas activer/désactiver les modules
- Peut gérer les membres de son organisation

### Organization Member

- Utilise les modules activés
- Accès selon son rôle (admin/member/viewer)

### Organization Viewer

- Accès lecture seule

## Migrations

Les migrations Alembic pour ces tables sont dans :
- `backend/alembic/versions/add_organizations_tables.py`

## Schémas Pydantic

Les schémas Pydantic sont définis dans :
- `backend/app/schemas/organization.py`

## Checklist de Vérification

- [x] Modèle `Organization` existe et est complet
- [x] Modèle `OrganizationModule` existe et est complet
- [x] Modèle `OrganizationMember` existe et est complet
- [x] Modèle `Role` existe et est complet
- [x] Modèle `Permission` existe et est complet
- [x] Modèle `RolePermission` existe et est complet
- [x] Modèle `UserRole` existe et est complet
- [x] Modèle `UserPermission` existe et est complet
- [x] Migrations Alembic existent
- [x] Schémas Pydantic existent
- [x] Relations entre modèles sont définies
- [x] Indexes sont créés
- [x] Contraintes d'unicité sont définies

## Notes Techniques

1. **Isolation des données**: Chaque organisation a sa propre base de données, garantissant une isolation complète des données.

2. **Modules**: Les modules sont activables/désactivables par organisation, permettant une personnalisation fine des fonctionnalités.

3. **RBAC**: Le système utilise un RBAC complet avec rôles, permissions et assignations.

4. **SuperAdmin**: Le rôle superadmin est un rôle système qui ne peut pas être supprimé et donne accès complet au système.

5. **Membres**: Les membres sont identifiés par email et peuvent avoir différents rôles dans différentes organisations.

6. **Invitations**: Le système supporte les invitations avec suivi de qui a invité qui.

## Prochaines Étapes

- [ ] Créer des endpoints API pour la gestion des organisations
- [ ] Créer l'interface SuperAdmin pour gérer les organisations
- [ ] Implémenter la création automatique de bases de données pour les organisations
- [ ] Créer des scripts de migration pour les données existantes
- [ ] Ajouter des métriques et monitoring pour les organisations
- [ ] Implémenter des quotas et limites par organisation
