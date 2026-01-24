# Système Multi-Tenant (Multi-Organisations)

## 📋 Vue d'ensemble

CausePilot utilise une architecture multi-tenant où chaque organisation possède :
- ✅ Sa propre base de données séparée
- ✅ Ses modules activables/désactivables
- ✅ Ses membres avec rôles
- ✅ Une isolation complète des données

## 🏗️ Architecture

### Structure de données

#### Base de données principale (système)
- `organizations` : Liste des organisations
- `organization_modules` : Configuration des modules par organisation
- `organization_members` : Membres des organisations avec leurs rôles

#### Base de données par organisation
Chaque organisation a sa propre BD PostgreSQL avec :
- Donateurs
- Campagnes
- Formulaires
- Analytics
- Toutes les données métier

### Modules disponibles

1. **base-donateur** : Gestion des donateurs, statistiques, segments
2. **formulaires** : Formulaires de collecte et intégrations
3. **campagnes** : Campagnes, courriels, médias sociaux
4. **p2p** : Campagnes peer-to-peer
5. **analytics** : Dashboard, rapports, IA
6. **administration** : Users et paramètres

## 🔐 Permissions

### SuperAdmin
- Crée/supprime les organisations
- Active/désactive les modules pour chaque organisation
- Invite les membres aux organisations
- Voit toutes les organisations
- Peut naviguer entre les organisations

### Organization Admin
- Gère les paramètres de son organisation
- Utilise tous les modules activés
- Ne peut pas activer/désactiver les modules

### Organization Member
- Utilise les modules activés
- Accès selon son rôle (admin/member/viewer)

### Organization Viewer
- Accès lecture seule

## 🚀 Utilisation

### Pour les SuperAdmins

#### 1. Créer une organisation
```
1. Aller dans SuperAdmin > Organisations
2. Cliquer "Nouvelle organisation"
3. Entrer le nom et le slug
4. L'organisation est créée avec tous les modules désactivés
```

#### 2. Activer les modules
```
1. Cliquer sur une organisation
2. Activer/désactiver les modules souhaités
3. Les modules activés apparaissent dans le menu des utilisateurs
```

#### 3. Inviter des membres
```
1. Dans les détails de l'organisation
2. Section "Membres"
3. Entrer l'email et choisir le rôle
4. L'utilisateur reçoit une invitation
```

#### 4. Changer d'organisation
```
1. Dans le menu de gauche
2. Cliquer sur le sélecteur d'organisation (en haut)
3. Choisir une organisation
4. Le menu se met à jour avec les modules activés
```

### Pour les utilisateurs d'organisation

#### Connexion
```
1. L'utilisateur se connecte avec son email
2. Il voit automatiquement son organisation
3. Seuls les modules activés apparaissent dans le menu
```

## 🔧 Configuration technique

### Backend

#### Modèles
- `backend/app/models/organization.py`
- `backend/app/models/organization_module.py`
- `backend/app/models/organization_member.py`

#### Endpoints API
- `backend/app/api/v1/endpoints/organizations.py`

#### Routes
- `GET /api/v1/organizations` - Liste des organisations
- `POST /api/v1/organizations` - Créer une organisation
- `GET /api/v1/organizations/{id}` - Détails d'une organisation
- `PATCH /api/v1/organizations/{id}` - Modifier une organisation
- `DELETE /api/v1/organizations/{id}` - Supprimer une organisation
- `GET /api/v1/organizations/{id}/modules` - Liste des modules
- `POST /api/v1/organizations/{id}/modules/toggle` - Activer/désactiver un module
- `GET /api/v1/organizations/{id}/members` - Liste des membres
- `POST /api/v1/organizations/{id}/members` - Inviter un membre
- `DELETE /api/v1/organizations/{id}/members/{member_id}` - Retirer un membre
- `GET /api/v1/organizations/context/active` - Contexte de l'organisation active

### Frontend

#### Store
- `apps/web/src/lib/store/organizationStore.ts` - État global Zustand

#### Composants
- `apps/web/src/components/organization/OrganizationSelector.tsx` - Sélecteur dans le Sidebar

#### Pages
- `/dashboard/super-admin/organisations` - Liste des organisations
- `/dashboard/super-admin/organisations/new` - Créer une organisation
- `/dashboard/super-admin/organisations/[id]` - Détails et gestion

#### Navigation dynamique
- `apps/web/src/lib/navigation/index.tsx` - Navigation basée sur les modules activés

## 🔄 Flux de données

### Chargement initial
```
1. Utilisateur se connecte
2. Frontend charge le contexte d'organisation active
3. Backend retourne: organisation + modules activés + rôle
4. Frontend met à jour le store
5. Navigation se met à jour avec les modules activés
```

### Changement d'organisation (SuperAdmin)
```
1. SuperAdmin clique sur le sélecteur
2. Choisit une organisation
3. Frontend charge le nouveau contexte
4. Navigation se met à jour
5. Page se recharge avec les nouveaux modules
```

### Activation d'un module
```
1. SuperAdmin active un module
2. Backend met à jour organization_modules
3. Les utilisateurs de l'organisation voient le nouveau module
```

## 📊 Base de données séparées

### Stratégie
Chaque organisation a sa propre base de données PostgreSQL :

```
- causepilot_main (système)
  - organizations
  - organization_modules
  - organization_members
  - users (système)

- causepilot_org_croix_rouge
  - donateurs
  - campagnes
  - formulaires
  - analytics
  - ...

- causepilot_org_unicef
  - donateurs
  - campagnes
  - ...
```

### Avantages
- ✅ Isolation complète des données
- ✅ Performance (pas de filtrage par organization_id)
- ✅ Sécurité renforcée
- ✅ Backup/Restore par organisation
- ✅ Scaling horizontal facile

## 🔒 Sécurité

- Toutes les routes organisations nécessitent `require_superadmin`
- Les membres ne peuvent accéder qu'à leur organisation
- Les modules désactivés sont inaccessibles (middleware)
- Connexions BD chiffrées et stockées de manière sécurisée

## 🧪 Tests

Pour tester le système :

```bash
# Créer une organisation de test
curl -X POST http://localhost:8000/api/v1/organizations \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Org", "slug": "test-org"}'

# Activer un module
curl -X POST http://localhost:8000/api/v1/organizations/{org_id}/modules/toggle \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"module_key": "base-donateur", "is_enabled": true}'

# Inviter un membre
curl -X POST http://localhost:8000/api/v1/organizations/{org_id}/members \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "role": "member"}'
```

## 🚧 TODO / Améliorations futures

- [ ] Script de création automatique des BDs par organisation
- [ ] Migration automatique des schémas pour les nouvelles organisations
- [ ] Système d'invitation par email avec liens magiques
- [ ] Dashboard SuperAdmin avec stats globales
- [ ] Export/Import de données par organisation
- [ ] Backup automatique des BDs d'organisations
- [ ] Logs d'audit par organisation
- [ ] Facturation par organisation
- [ ] Quotas par organisation (nombre de donateurs, emails, etc.)
