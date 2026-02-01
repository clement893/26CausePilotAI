# Plan d'Implémentation - Bases de Données Distinctes par Organisation

**Date**: 2026-01-24  
**Objectif**: Implémenter un système permettant à chaque organisation d'avoir sa propre base de données PostgreSQL distincte, avec gestion par le superadmin via l'interface d'administration.

---

## 📋 Vue d'ensemble

### Objectifs
1. ✅ Chaque organisation possède sa propre base de données PostgreSQL
2. ✅ Le superadmin peut configurer/modifier la chaîne de connexion DB pour chaque organisation
3. ✅ Validation et test de connexion avant sauvegarde
4. ✅ Création automatique de bases de données si nécessaire
5. ✅ Gestion centralisée des connexions DB par organisation
6. ✅ Sécurité : masquage des informations sensibles dans l'API

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Base de Données Système                  │
│  (causepilot_main)                                          │
│  - organizations (avec db_connection_string)                │
│  - organization_modules                                      │
│  - organization_members                                      │
│  - users                                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ db_connection_string
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Org 1 DB   │    │   Org 2 DB   │    │   Org 3 DB   │
│ (croix-rouge)│    │   (unicef)   │    │   (msf)      │
│              │    │              │    │              │
│ - donateurs  │    │ - donateurs  │    │ - donateurs  │
│ - campagnes  │    │ - campagnes  │    │ - campagnes  │
│ - formulaires│    │ - formulaires│    │ - formulaires│
│ - analytics  │    │ - analytics  │    │ - analytics  │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🎯 Phase 1: Backend - Gestionnaire de Connexions DB par Organisation

### 1.1 Créer `OrganizationDatabaseManager`

**Fichier**: `backend/app/core/organization_database_manager.py`

**Fonctionnalités**:
- Gestion des connexions DB par organisation (UUID)
- Cache des engines SQLAlchemy par organisation
- Création automatique de bases de données
- Test de connexion
- Migration automatique des schémas

**Méthodes principales**:
```python
class OrganizationDatabaseManager:
    @classmethod
    def get_organization_db_engine(cls, organization_id: UUID)
    
    @classmethod
    async def test_connection(cls, db_connection_string: str) -> bool
    
    @classmethod
    async def create_organization_database(cls, organization_id: UUID, db_name: str) -> bool
    
    @classmethod
    async def run_migrations_for_organization(cls, organization_id: UUID) -> None
    
    @classmethod
    async def get_organization_db_session(cls, organization_id: UUID) -> AsyncSession
```

### 1.2 Mettre à jour les Schémas API

**Fichier**: `backend/app/schemas/organization.py`

**Modifications**:
- Ajouter `db_connection_string` dans `OrganizationUpdate` (optionnel, pour sécurité)
- Créer `UpdateDatabaseConnectionRequest` pour la mise à jour sécurisée
- Créer `TestConnectionRequest` et `TestConnectionResponse`
- Masquer `db_connection_string` dans `Organization` response (sauf pour superadmin)

**Nouveaux schémas**:
```python
class UpdateDatabaseConnectionRequest(BaseModel):
    db_connection_string: str = Field(..., min_length=1)
    test_connection: bool = Field(default=True)  # Tester avant sauvegarde

class TestConnectionRequest(BaseModel):
    db_connection_string: str

class TestConnectionResponse(BaseModel):
    success: bool
    message: str
    database_name: Optional[str] = None
```

### 1.3 Ajouter Endpoints API

**Fichier**: `backend/app/api/v1/endpoints/organizations.py`

**Nouveaux endpoints**:
```python
@router.patch("/{organization_id}/database", response_model=OrganizationSchema)
async def update_organization_database(
    organization_id: UUID,
    db_update: UpdateDatabaseConnectionRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Mettre à jour la chaîne de connexion DB d'une organisation.
    Teste la connexion avant de sauvegarder.
    """

@router.post("/{organization_id}/database/test", response_model=TestConnectionResponse)
async def test_organization_database(
    organization_id: UUID,
    test_request: TestConnectionRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Tester une chaîne de connexion DB sans la sauvegarder.
    """

@router.post("/{organization_id}/database/create", response_model=dict)
async def create_organization_database(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Créer automatiquement une nouvelle base de données pour l'organisation.
    Génère la chaîne de connexion et l'enregistre.
    """
```

### 1.4 Améliorer la Création d'Organisation

**Fichier**: `backend/app/api/v1/endpoints/organizations.py`

**Modifications dans `create_organization`**:
- Permettre de passer `db_connection_string` optionnellement
- Si non fourni, générer automatiquement une chaîne basée sur le slug
- Option pour créer automatiquement la BD lors de la création

**Nouveau schéma**:
```python
class OrganizationCreate(OrganizationBase):
    db_connection_string: Optional[str] = None  # Optionnel
    create_database: bool = Field(default=False)  # Créer automatiquement la BD
```

---

## 🎨 Phase 2: Frontend - Interface de Gestion DB

### 2.1 Mettre à jour les Types TypeScript

**Fichier**: `packages/types/src/organization.ts`

**Modifications**:
```typescript
export interface Organization {
  id: string;
  name: string;
  slug: string;
  dbConnectionString?: string; // Visible uniquement pour superadmin
  isActive: boolean;
  // ...
}

export interface UpdateDatabaseConnectionRequest {
  dbConnectionString: string;
  testConnection?: boolean;
}

export interface TestConnectionRequest {
  dbConnectionString: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  databaseName?: string;
}
```

### 2.2 Ajouter Fonctions API Frontend

**Fichier**: `apps/web/src/lib/api/organizations.ts`

**Nouvelles fonctions**:
```typescript
export async function updateOrganizationDatabase(
  organizationId: string,
  data: UpdateDatabaseConnectionRequest
): Promise<Organization>

export async function testOrganizationDatabase(
  organizationId: string,
  data: TestConnectionRequest
): Promise<TestConnectionResponse>

export async function createOrganizationDatabase(
  organizationId: string
): Promise<{ success: boolean; dbConnectionString: string }>
```

### 2.3 Créer Composant de Gestion DB

**Fichier**: `apps/web/src/components/organization/DatabaseConnectionForm.tsx`

**Fonctionnalités**:
- Formulaire pour éditer la chaîne de connexion
- Bouton "Tester la connexion"
- Affichage masqué du mot de passe (type="password")
- Validation du format de la chaîne de connexion
- Messages d'erreur/succès
- Bouton "Créer automatiquement la BD"

**Composant**:
```tsx
interface DatabaseConnectionFormProps {
  organizationId: string;
  currentConnectionString?: string;
  onUpdate: () => void;
}

export function DatabaseConnectionForm({ ... }: DatabaseConnectionFormProps)
```

### 2.4 Intégrer dans la Page de Détails Organisation

**Fichier**: `apps/web/src/app/[locale]/dashboard/super-admin/organisations/[id]/page.tsx`

**Modifications**:
- Ajouter une nouvelle section "Configuration Base de Données"
- Intégrer le composant `DatabaseConnectionForm`
- Afficher le statut de la connexion (connecté/déconnecté)
- Afficher le nom de la base de données si disponible

**Section à ajouter**:
```tsx
<Card title="Configuration Base de Données" className="lg:col-span-2">
  <DatabaseConnectionForm
    organizationId={organizationId}
    currentConnectionString={organization.dbConnectionString}
    onUpdate={loadOrganizationData}
  />
</Card>
```

---

## 🔧 Phase 3: Fonctionnalités Avancées

### 3.1 Validation de Chaîne de Connexion

**Fichier**: `backend/app/core/organization_database_manager.py`

**Validation**:
- Format PostgreSQL valide (`postgresql://` ou `postgresql+asyncpg://`)
- Test de connexion réelle avant sauvegarde
- Vérification que la base de données existe
- Vérification des permissions nécessaires

### 3.2 Création Automatique de Base de Données

**Fichier**: `backend/app/core/organization_database_manager.py`

**Fonctionnalités**:
- Génération automatique du nom de BD basé sur le slug: `causepilot_org_{slug}`
- Création de la base de données PostgreSQL
- Exécution automatique des migrations Alembic
- Génération de la chaîne de connexion complète

**Configuration requise**:
- Variable d'environnement `ORG_DB_BASE_URL` (sans nom de BD)
- Exemple: `postgresql+asyncpg://user:pass@host:5432`

### 3.3 Gestion du Cache des Connexions

**Fichier**: `backend/app/core/organization_database_manager.py`

**Stratégie**:
- Cache des engines SQLAlchemy par `organization_id`
- Invalidation du cache lors de la mise à jour de la chaîne de connexion
- Pool de connexions optimisé par organisation
- Nettoyage automatique des connexions inactives

### 3.4 Migration des Données Existantes

**Script**: `backend/scripts/migrate_organizations_to_separate_db.py`

**Fonctionnalités**:
- Détecter les organisations sans BD dédiée
- Proposer la création automatique
- Migration optionnelle des données existantes
- Backup avant migration

---

## 🔒 Phase 4: Sécurité

### 4.1 Masquage des Informations Sensibles

**Backend**:
- Ne jamais exposer `db_connection_string` dans les réponses API sauf pour superadmin
- Masquer le mot de passe dans les logs
- Chiffrer la chaîne de connexion dans la base de données (optionnel)

**Frontend**:
- Afficher la chaîne de connexion masquée (type="password")
- Option "Afficher/Masquer" pour le superadmin
- Ne jamais logger la chaîne complète

### 4.2 Validation et Sanitization

**Backend**:
- Validation stricte du format de la chaîne de connexion
- Sanitization pour éviter les injections SQL
- Vérification des permissions avant création/suppression de BD

### 4.3 Audit et Logging

**Backend**:
- Logger toutes les modifications de chaînes de connexion
- Logger les tentatives de connexion (succès/échec)
- Audit trail pour la traçabilité

---

## 📊 Phase 5: Tests et Documentation

### 5.1 Tests Backend

**Fichiers**:
- `backend/tests/test_organization_database_manager.py`
- `backend/tests/test_organization_db_endpoints.py`

**Tests à implémenter**:
- Test de connexion réussie/échouée
- Création automatique de BD
- Mise à jour de chaîne de connexion
- Gestion du cache
- Validation des formats

### 5.2 Tests Frontend

**Fichiers**:
- `apps/web/tests/components/organization/DatabaseConnectionForm.test.tsx`

**Tests à implémenter**:
- Affichage/masquage du mot de passe
- Validation du formulaire
- Test de connexion
- Messages d'erreur

### 5.3 Documentation

**Fichiers**:
- `docs/ORGANIZATION_DATABASE_MANAGEMENT.md` - Guide complet
- Mise à jour de `docs/MULTI_TENANT.md`

**Contenu**:
- Guide d'utilisation pour superadmin
- Exemples de chaînes de connexion
- Procédures de création de BD
- Dépannage

---

## 📝 Checklist d'Implémentation

### Backend
- [ ] Créer `OrganizationDatabaseManager`
- [ ] Ajouter schémas API (`UpdateDatabaseConnectionRequest`, `TestConnectionRequest`, etc.)
- [ ] Implémenter endpoint `PATCH /organizations/{id}/database`
- [ ] Implémenter endpoint `POST /organizations/{id}/database/test`
- [ ] Implémenter endpoint `POST /organizations/{id}/database/create`
- [ ] Améliorer `create_organization` pour supporter création automatique de BD
- [ ] Ajouter validation et test de connexion
- [ ] Implémenter création automatique de BD
- [ ] Ajouter gestion du cache des connexions
- [ ] Ajouter logging et audit
- [ ] Tests unitaires
- [ ] Tests d'intégration

### Frontend
- [ ] Mettre à jour types TypeScript
- [ ] Ajouter fonctions API (`updateOrganizationDatabase`, `testOrganizationDatabase`, etc.)
- [ ] Créer composant `DatabaseConnectionForm`
- [ ] Intégrer dans la page de détails organisation
- [ ] Ajouter masquage/affichage du mot de passe
- [ ] Ajouter validation côté client
- [ ] Ajouter messages d'erreur/succès
- [ ] Tests composants

### Documentation
- [ ] Créer guide d'utilisation
- [ ] Mettre à jour documentation existante
- [ ] Ajouter exemples
- [ ] Documenter les variables d'environnement

### Sécurité
- [ ] Masquer `db_connection_string` dans les réponses API
- [ ] Validation stricte des chaînes de connexion
- [ ] Audit logging
- [ ] Review sécurité

---

## 🚀 Ordre d'Implémentation Recommandé

1. **Phase 1.1** - Créer `OrganizationDatabaseManager` (fondation)
2. **Phase 1.2** - Mettre à jour les schémas API
3. **Phase 1.3** - Implémenter les endpoints API
4. **Phase 1.4** - Améliorer la création d'organisation
5. **Phase 2.1** - Mettre à jour les types TypeScript
6. **Phase 2.2** - Ajouter fonctions API frontend
7. **Phase 2.3** - Créer composant `DatabaseConnectionForm`
8. **Phase 2.4** - Intégrer dans la page de détails
9. **Phase 3** - Fonctionnalités avancées (création auto, cache, etc.)
10. **Phase 4** - Sécurité et audit
11. **Phase 5** - Tests et documentation

---

## 📋 Variables d'Environnement Requises

```bash
# Base URL pour créer les bases de données d'organisations
# Format: postgresql+asyncpg://user:password@host:5432
# (sans nom de base de données à la fin)
ORG_DB_BASE_URL=postgresql+asyncpg://user:password@localhost:5432

# Optionnel: Préfixe pour les noms de BD
ORG_DB_PREFIX=causepilot_org_

# Optionnel: Pool de connexions par organisation
ORG_DB_POOL_SIZE=10
ORG_DB_MAX_OVERFLOW=20
```

---

## 🎯 Résultat Attendu

À la fin de l'implémentation, le superadmin pourra:

1. ✅ Voir la chaîne de connexion DB de chaque organisation (masquée)
2. ✅ Modifier la chaîne de connexion DB d'une organisation
3. ✅ Tester la connexion avant de sauvegarder
4. ✅ Créer automatiquement une nouvelle BD pour une organisation
5. ✅ Voir le statut de connexion (connecté/déconnecté)
6. ✅ Voir le nom de la base de données associée

Chaque organisation aura:
- ✅ Sa propre base de données PostgreSQL distincte
- ✅ Isolation complète des données
- ✅ Possibilité de backup/restore indépendant
- ✅ Scaling indépendant

---

## 📚 Références

- Documentation existante: `docs/MULTI_TENANT.md`
- Modèle actuel: `backend/app/models/organization.py`
- Endpoints actuels: `backend/app/api/v1/endpoints/organizations.py`
- Page frontend: `apps/web/src/app/[locale]/dashboard/super-admin/organisations/[id]/page.tsx`

---

**Dernière mise à jour**: 2026-01-24
