# Plan Complet : CRM de Don Multi-Tenant

## 📋 Vue d'ensemble

Système CRM de don complet avec gestion des donateurs et historique des transactions, connecté dynamiquement à la base de données spécifique de chaque organisation.

## 🎯 Objectifs

1. **Gestion complète des donateurs** : Profils détaillés, historique, segmentation
2. **Historique des transactions** : Tous les dons, paiements, remboursements
3. **Architecture multi-tenant** : Chaque organisation a sa propre BD isolée
4. **Connexion dynamique** : Appels API qui se connectent automatiquement à la BD de l'organisation active
5. **Interface moderne** : Liste, recherche, filtres, page individuelle avec historique

## 🏗️ Architecture Technique

### Structure Multi-Tenant

```
BD Système (causepilot_main)
├── organizations (métadonnées)
├── organization_modules
└── organization_members

BD Organisation (causepilot_org_{slug})
├── donors (donateurs)
├── donations (dons/transactions)
├── payment_methods (méthodes de paiement)
├── donor_segments (segments)
├── donor_tags (tags)
├── donor_notes (notes)
├── donor_communications (communications)
└── donor_activities (activités/interactions)
```

## 📊 Modèles de Données

### 1. Donors (Donateurs)

```python
class Donor(Base):
    id: UUID (PK)
    organization_id: UUID (FK vers organizations.id - pour référence)
    email: String (unique par org)
    first_name: String
    last_name: String
    phone: String (nullable)
    address: JSON (nullable) - {street, city, province, postal_code, country}
    date_of_birth: Date (nullable)
    preferred_language: String (default: 'fr')
    tax_id: String (nullable) - Numéro d'assurance sociale pour reçus fiscaux
    is_active: Boolean (default: True)
    is_anonymous: Boolean (default: False)
    opt_in_email: Boolean (default: True)
    opt_in_sms: Boolean (default: False)
    opt_in_postal: Boolean (default: True)
    tags: JSON (array de strings)
    custom_fields: JSON (champs personnalisés)
    total_donated: Decimal (calculé)
    first_donation_date: DateTime (nullable)
    last_donation_date: DateTime (nullable)
    donation_count: Integer (calculé)
    created_at: DateTime
    updated_at: DateTime
```

**Indexes** :
- `email` + `organization_id` (unique)
- `last_name`, `first_name` (recherche)
- `created_at` (tri)
- `total_donated` (tri)

### 2. Donations (Dons/Transactions)

```python
class Donation(Base):
    id: UUID (PK)
    donor_id: UUID (FK vers donors.id)
    organization_id: UUID (FK vers organizations.id - pour référence)
    amount: Decimal (montant du don)
    currency: String (default: 'CAD')
    donation_type: String - 'one_time', 'recurring', 'pledge', 'in_kind'
    payment_method_id: UUID (FK vers payment_methods.id)
    payment_status: String - 'pending', 'completed', 'failed', 'refunded', 'cancelled'
    payment_date: DateTime (nullable)
    receipt_number: String (unique, nullable) - Numéro de reçu fiscal
    receipt_sent: Boolean (default: False)
    receipt_sent_date: DateTime (nullable)
    campaign_id: UUID (nullable, FK) - Campagne associée
    designation: String (nullable) - Destination du don
    notes: Text (nullable)
    is_anonymous: Boolean (default: False)
    is_tax_deductible: Boolean (default: True)
    tax_receipt_amount: Decimal (nullable) - Montant pour reçu fiscal
    metadata: JSON (données additionnelles)
    created_at: DateTime
    updated_at: DateTime
```

**Indexes** :
- `donor_id`
- `organization_id`
- `payment_date`
- `payment_status`
- `receipt_number` (unique)
- `campaign_id`

### 3. Payment Methods (Méthodes de Paiement)

```python
class PaymentMethod(Base):
    id: UUID (PK)
    donor_id: UUID (FK vers donors.id)
    organization_id: UUID (FK)
    type: String - 'credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'other'
    provider: String (nullable) - 'stripe', 'paypal', 'interac', etc.
    last_four: String (nullable) - 4 derniers chiffres
    expiry_month: Integer (nullable)
    expiry_year: Integer (nullable)
    is_default: Boolean (default: False)
    is_active: Boolean (default: True)
    metadata: JSON (données sécurisées)
    created_at: DateTime
    updated_at: DateTime
```

### 4. Donor Segments (Segments)

```python
class DonorSegment(Base):
    id: UUID (PK)
    organization_id: UUID (FK)
    name: String
    description: Text (nullable)
    criteria: JSON - Critères de segmentation
    donor_count: Integer (calculé)
    created_at: DateTime
    updated_at: DateTime
```

### 5. Donor Tags (Tags)

```python
class DonorTag(Base):
    id: UUID (PK)
    organization_id: UUID (FK)
    name: String (unique par org)
    color: String (nullable) - Code couleur hex
    description: Text (nullable)
    donor_count: Integer (calculé)
    created_at: DateTime
```

### 6. Donor Notes (Notes)

```python
class DonorNote(Base):
    id: UUID (PK)
    donor_id: UUID (FK)
    organization_id: UUID (FK)
    note: Text
    note_type: String - 'general', 'call', 'meeting', 'email', 'other'
    created_by: Integer (FK vers users.id - système)
    is_private: Boolean (default: False)
    created_at: DateTime
```

### 7. Donor Communications (Communications)

```python
class DonorCommunication(Base):
    id: UUID (PK)
    donor_id: UUID (FK)
    organization_id: UUID (FK)
    communication_type: String - 'email', 'sms', 'letter', 'phone', 'in_person'
    subject: String (nullable)
    content: Text
    sent_at: DateTime
    sent_by: Integer (FK vers users.id)
    status: String - 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    metadata: JSON
    created_at: DateTime
```

### 8. Donor Activities (Activités)

```python
class DonorActivity(Base):
    id: UUID (PK)
    donor_id: UUID (FK)
    organization_id: UUID (FK)
    activity_type: String - 'donation', 'communication', 'note', 'segment_added', 'tag_added', 'profile_updated'
    activity_data: JSON - Données de l'activité
    performed_by: Integer (FK vers users.id, nullable)
    created_at: DateTime
```

## 🔌 API Endpoints

### Base Path
Tous les endpoints utilisent le préfixe `/api/v1/organizations/{organization_id}/donors`

### Endpoints Donateurs

```
GET    /donors                          - Liste des donateurs (pagination, filtres, recherche)
GET    /donors/{donor_id}               - Détails d'un donateur
POST   /donors                          - Créer un donateur
PATCH  /donors/{donor_id}               - Modifier un donateur
DELETE /donors/{donor_id}               - Supprimer un donateur (soft delete)
GET    /donors/{donor_id}/history       - Historique complet (dons + activités)
GET    /donors/{donor_id}/donations     - Liste des dons
GET    /donors/{donor_id}/stats         - Statistiques du donateur
POST   /donors/{donor_id}/tags          - Ajouter un tag
DELETE /donors/{donor_id}/tags/{tag_id} - Retirer un tag
POST   /donors/{donor_id}/notes         - Ajouter une note
POST   /donors/{donor_id}/segments      - Ajouter à un segment
```

### Endpoints Dons

```
GET    /donors/{donor_id}/donations     - Liste des dons d'un donateur
POST   /donors/{donor_id}/donations     - Créer un don
GET    /donations/{donation_id}         - Détails d'un don
PATCH  /donations/{donation_id}         - Modifier un don
DELETE /donations/{donation_id}         - Supprimer un don
POST   /donations/{donation_id}/refund  - Rembourser un don
POST   /donations/{donation_id}/receipt - Générer/envoyer reçu fiscal
```

### Endpoints Segments

```
GET    /segments                        - Liste des segments
POST   /segments                        - Créer un segment
GET    /segments/{segment_id}           - Détails d'un segment
PATCH  /segments/{segment_id}          - Modifier un segment
DELETE /segments/{segment_id}          - Supprimer un segment
GET    /segments/{segment_id}/donors    - Donateurs dans le segment
```

### Endpoints Tags

```
GET    /tags                            - Liste des tags
POST   /tags                            - Créer un tag
PATCH  /tags/{tag_id}                   - Modifier un tag
DELETE /tags/{tag_id}                   - Supprimer un tag
```

## 🔧 Connexion Dynamique à la BD Organisation

### Backend Dependency

```python
# backend/app/dependencies/organization_db.py

from fastapi import Depends, HTTPException
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Organization
from app.core.organization_database_manager import OrganizationDatabaseManager

async def get_organization_db(
    organization_id: UUID,
    main_db: AsyncSession = Depends(get_db),
) -> AsyncSession:
    """
    Get database session for organization's dedicated database.
    
    This dependency:
    1. Gets organization from main DB
    2. Retrieves connection string
    3. Returns session to organization's DB
    """
    # Get organization from main DB
    query = select(Organization).where(Organization.id == organization_id)
    result = await main_db.execute(query)
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=404,
            detail="Organization not found"
        )
    
    # Get session for organization DB
    async for session in OrganizationDatabaseManager.get_organization_db_session(
        organization_id,
        organization.db_connection_string
    ):
        yield session
```

### Utilisation dans les Endpoints

```python
@router.get("/donors")
async def list_donors(
    organization_id: UUID,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    org_db: AsyncSession = Depends(get_organization_db),
):
    # org_db est maintenant connecté à la BD de l'organisation
    query = select(Donor).where(Donor.organization_id == organization_id)
    # ... reste du code
```

## 📱 Frontend - Structure des Pages

### 1. Liste des Donateurs (`/dashboard/base-donateur/donateurs`)

**Fonctionnalités** :
- Tableau avec colonnes : Nom, Email, Total donné, Dernier don, Tags, Actions
- Recherche globale (nom, email)
- Filtres : Montant donné, Date dernier don, Tags, Segments, Statut
- Tri : Par nom, montant total, date dernier don
- Pagination
- Export CSV/Excel
- Actions rapides : Voir, Modifier, Ajouter don, Envoyer email

**Composants** :
- `DonorList.tsx` - Liste principale
- `DonorFilters.tsx` - Barre de filtres
- `DonorTable.tsx` - Tableau de données
- `DonorCard.tsx` - Vue carte (optionnel)

### 2. Page Donateur Individuel (`/dashboard/base-donateur/donateurs/[id]`)

**Sections** :

#### A. En-tête
- Photo/Avatar
- Nom complet
- Email, Téléphone
- Total donné (vie, année, mois)
- Tags
- Actions : Modifier, Ajouter don, Envoyer email

#### B. Onglets
1. **Vue d'ensemble**
   - Statistiques clés
   - Derniers dons
   - Prochain don récurrent (si applicable)
   - Notes récentes

2. **Historique des Transactions**
   - Timeline complète
   - Filtres : Type, Statut, Période
   - Détails de chaque transaction
   - Actions : Voir reçu, Rembourser

3. **Profil**
   - Informations personnelles
   - Adresse
   - Préférences de communication
   - Champs personnalisés

4. **Méthodes de Paiement**
   - Cartes enregistrées
   - Comptes bancaires
   - Ajouter/Modifier/Supprimer

5. **Communications**
   - Historique emails
   - SMS
   - Appels
   - Lettres

6. **Notes & Activités**
   - Notes ajoutées
   - Timeline d'activités
   - Ajouter note

### 3. Créer/Modifier Donateur

**Formulaire** :
- Informations de base (nom, email, téléphone)
- Adresse
- Préférences de communication
- Tags
- Champs personnalisés
- Méthode de paiement (optionnel)

## 🎨 Composants UI Frontend

### Composants Réutilisables

```
components/donors/
├── DonorList.tsx              - Liste principale
├── DonorTable.tsx             - Tableau de donateurs
├── DonorCard.tsx              - Carte donateur (vue alternative)
├── DonorFilters.tsx           - Barre de filtres
├── DonorSearch.tsx            - Barre de recherche
├── DonorDetail.tsx            - Page détail donateur
├── DonorHeader.tsx            - En-tête page donateur
├── DonorStats.tsx             - Statistiques donateur
├── DonationHistory.tsx        - Historique des transactions
├── DonationTimeline.tsx       - Timeline visuelle
├── DonationCard.tsx           - Carte transaction individuelle
├── DonorForm.tsx              - Formulaire créer/modifier
├── DonorTags.tsx              - Gestion tags
├── DonorSegments.tsx          - Gestion segments
├── DonorNotes.tsx             - Notes donateur
├── DonorCommunications.tsx    - Communications
├── PaymentMethodList.tsx      - Liste méthodes paiement
└── DonorExport.tsx            - Export données
```

## 📈 Statistiques & Analytics

### Métriques Donateur

- Total donné (vie, année, mois)
- Nombre de dons
- Don moyen
- Dernier don
- Prochain don récurrent
- Tendance (augmentation/diminution)

### Métriques Organisation

- Nombre total de donateurs
- Nouveaux donateurs (période)
- Donateurs actifs
- Montant total collecté
- Don moyen
- Taux de rétention
- Taux de croissance

## 🔐 Sécurité & Permissions

### Rôles

- **SuperAdmin** : Accès à toutes les organisations
- **Organization Admin** : Gestion complète des donateurs de son organisation
- **Organization Member** : Lecture seule ou gestion limitée
- **Organization Viewer** : Lecture seule

### Validation

- Vérifier que l'utilisateur a accès à l'organisation
- Vérifier que l'utilisateur peut accéder aux données de l'organisation
- Masquer les données sensibles (numéros de carte, etc.)

## 🚀 Plan d'Implémentation

### Phase 1 : Backend Core (Semaine 1)

1. **Modèles SQLAlchemy**
   - [ ] Créer `backend/app/models/organization_donors/donor.py`
   - [ ] Créer `backend/app/models/organization_donors/donation.py`
   - [ ] Créer `backend/app/models/organization_donors/payment_method.py`
   - [ ] Créer autres modèles (segments, tags, notes, etc.)

2. **Schémas Pydantic**
   - [ ] Créer `backend/app/schemas/organization_donors.py`
   - [ ] Validation complète

3. **Dependency pour BD Organisation**
   - [ ] Créer `backend/app/dependencies/organization_db.py`
   - [ ] Tester connexion dynamique

4. **Migration Alembic**
   - [ ] Créer migration pour tables donateurs
   - [ ] Script pour appliquer aux BDs d'organisations

### Phase 2 : API Endpoints (Semaine 1-2)

1. **Endpoints Donateurs**
   - [ ] GET /donors (liste avec pagination, filtres)
   - [ ] GET /donors/{id}
   - [ ] POST /donors
   - [ ] PATCH /donors/{id}
   - [ ] DELETE /donors/{id}

2. **Endpoints Dons**
   - [ ] GET /donors/{id}/donations
   - [ ] POST /donors/{id}/donations
   - [ ] GET /donations/{id}
   - [ ] PATCH /donations/{id}
   - [ ] POST /donations/{id}/refund

3. **Endpoints Statistiques**
   - [ ] GET /donors/{id}/stats
   - [ ] GET /donors/stats (global)

### Phase 3 : Frontend Core (Semaine 2)

1. **Types TypeScript**
   - [ ] Créer `packages/types/src/donor.ts`
   - [ ] Types pour tous les modèles

2. **API Client**
   - [ ] Créer `apps/web/src/lib/api/donors.ts`
   - [ ] Fonctions pour tous les endpoints

3. **Store Zustand** (optionnel)
   - [ ] Créer `apps/web/src/lib/store/donorStore.ts`

### Phase 4 : Pages Frontend (Semaine 2-3)

1. **Liste Donateurs**
   - [ ] Page `/dashboard/base-donateur/donateurs`
   - [ ] Tableau avec recherche/filtres
   - [ ] Pagination

2. **Page Donateur**
   - [ ] Page `/dashboard/base-donateur/donateurs/[id]`
   - [ ] Onglets (Vue d'ensemble, Historique, Profil, etc.)
   - [ ] Historique des transactions

3. **Formulaire Donateur**
   - [ ] Créer/Modifier donateur
   - [ ] Validation

### Phase 5 : Fonctionnalités Avancées (Semaine 3-4)

1. **Segments**
   - [ ] Gestion segments
   - [ ] Segmentation automatique

2. **Tags**
   - [ ] Gestion tags
   - [ ] Tags colorés

3. **Notes & Communications**
   - [ ] Ajout notes
   - [ ] Historique communications

4. **Export**
   - [ ] Export CSV/Excel
   - [ ] Rapports

## 📝 Fichiers à Créer

### Backend

```
backend/app/models/organization_donors/
├── __init__.py
├── donor.py
├── donation.py
├── payment_method.py
├── donor_segment.py
├── donor_tag.py
├── donor_note.py
├── donor_communication.py
└── donor_activity.py

backend/app/schemas/
└── organization_donors.py

backend/app/dependencies/
└── organization_db.py

backend/app/api/v1/endpoints/
└── organization_donors.py

backend/alembic/versions/
└── add_donor_tables_org.py
```

### Frontend

```
packages/types/src/
└── donor.ts

apps/web/src/lib/api/
└── donors.ts

apps/web/src/components/donors/
├── DonorList.tsx
├── DonorTable.tsx
├── DonorDetail.tsx
├── DonationHistory.tsx
├── DonorForm.tsx
└── ... (autres composants)

apps/web/src/app/[locale]/dashboard/base-donateur/donateurs/
├── page.tsx (liste)
└── [id]/
    └── page.tsx (détail)
```

## 🎯 Priorités

### MVP (Minimum Viable Product)

1. ✅ Modèles Donor et Donation
2. ✅ API CRUD donateurs
3. ✅ API CRUD dons
4. ✅ Liste des donateurs (frontend)
5. ✅ Page donateur individuel avec historique

### V2 (Fonctionnalités Avancées)

1. Segments et tags
2. Notes et communications
3. Export et rapports
4. Recherche avancée
5. Analytics détaillées

## 📚 Références

- [Nonprofit CRM Best Practices](https://altrata.com/articles/nonprofit-crm-best-practices)
- [Donor Management Best Practices](https://www.netsuite.com/portal/resource/articles/crm/donor-management-best-practices.shtml)
- [Microsoft Common Data Model for Nonprofits](https://learn.microsoft.com/en-us/industry/nonprofit/common-data-model-for-nonprofits)
- [CiviCRM Schema Design](https://docs.civicrm.org/dev/en/latest/framework/database/schema-design/)
