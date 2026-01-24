# 📋 Plan Complet : Système CRM de Donateurs

**Date de création :** 24 janvier 2026  
**Statut :** Plan d'implémentation  
**Version :** 1.0

---

## 🌐 Environnements et Accès

### Production
- **URL :** https://modeleweb-production-32de.up.railway.app/fr/dashboard/base-donateur/donateurs
- **Plateforme :** Railway
- **Page principale :** `/dashboard/base-donateur/donateurs`
- **Locale :** `/fr/` (français) ou `/en/` (anglais)

### Développement Local
- **URL :** http://localhost:3000/fr/dashboard/base-donateur/donateurs
- **Backend API :** http://localhost:8000

---

## 📊 Vue d'Ensemble

Ce document présente un plan complet pour finaliser et enrichir le système CRM de donateurs avec une base de données complète, des fonctionnalités CRM avancées, et une interface utilisateur moderne.

**Le système est actuellement déployé en production** et accessible via l'URL ci-dessus.

### Objectifs Principaux

1. ✅ **Base de données complète** : Modèles de données robustes pour tous les aspects des donateurs
2. ✅ **CRM fonctionnel** : Gestion complète des relations avec les donateurs
3. ✅ **Interface moderne** : Liste, recherche, filtres, pages détaillées
4. ✅ **Historique complet** : Suivi de toutes les transactions et interactions
5. ✅ **Segmentation** : Tags, segments, et catégorisation avancée
6. ✅ **Analytics** : Statistiques et rapports détaillés

---

## 🏗️ Architecture Actuelle

### ✅ Ce qui Existe Déjà

#### Backend - Modèles de Données
- ✅ `Donor` - Modèle principal des donateurs
- ✅ `Donation` - Modèle des dons/transactions
- ✅ `PaymentMethod` - Méthodes de paiement
- ✅ `DonorNote` - Notes sur les donateurs
- ✅ `DonorActivity` - Activités/interactions

#### Backend - API
- ✅ Endpoints CRUD de base pour donateurs
- ✅ Endpoints pour dons
- ✅ Endpoints pour historique et statistiques
- ✅ Schémas Pydantic (`organization_donors.py`)

#### Frontend
- ✅ Types TypeScript (`packages/types/src/donor.ts`)
- ✅ Client API (`apps/web/src/lib/api/donors.ts`)
- ✅ Page liste donateurs (`/dashboard/base-donateur/donateurs`)
- ✅ Page détail donateur (`/dashboard/base-donateur/donateurs/[id]`)

### ❌ Ce qui Manque

#### Backend - Modèles Manquants
- ❌ `DonorSegment` - Segments de donateurs
- ❌ `DonorTag` - Tags structurés (actuellement JSON dans Donor)
- ❌ `DonorCommunication` - Historique des communications
- ❌ `Campaign` - Campagnes de collecte
- ❌ `RecurringDonation` - Dons récurrents

#### Backend - Fonctionnalités Manquantes
- ❌ Endpoints pour segments
- ❌ Endpoints pour tags
- ❌ Endpoints pour communications
- ❌ Endpoints pour campagnes
- ❌ Export CSV/Excel
- ❌ Génération de reçus fiscaux
- ❌ Intégration avec processeurs de paiement

#### Frontend - Composants Manquants
- ❌ Composants de segmentation
- ❌ Composants de tags
- ❌ Composants de communications
- ❌ Composants d'export
- ❌ Composants de rapports/analytics
- ❌ Formulaires complets de création/modification

---

## 📐 Modèles de Données Détaillés

### 1. Donor (✅ Existe)

**Fichier :** `backend/app/models/organization_donors/donor.py`

**Champs principaux :**
- Informations de contact (email, nom, téléphone, adresse)
- Préférences de communication
- Statistiques calculées (total_donated, donation_count)
- Tags (JSON - à migrer vers table séparée)
- Champs personnalisés (JSON)

**Améliorations nécessaires :**
- [ ] Migration des tags vers table `DonorTag`
- [ ] Ajout de champs pour scoring/segmentation
- [ ] Ajout de champs pour engagement

### 2. Donation (✅ Existe)

**Fichier :** `backend/app/models/organization_donors/donation.py`

**Champs principaux :**
- Montant, devise, type de don
- Statut de paiement
- Informations de reçu fiscal
- Campagne associée (campaign_id existe mais pas de modèle)

**Améliorations nécessaires :**
- [ ] Créer modèle `Campaign`
- [ ] Ajouter support pour dons récurrents
- [ ] Ajouter support pour dons en nature

### 3. PaymentMethod (✅ Existe)

**Fichier :** `backend/app/models/organization_donors/payment_method.py`

**Statut :** Complet

### 4. DonorNote (✅ Existe)

**Fichier :** `backend/app/models/organization_donors/donor_note.py`

**Statut :** Complet

### 5. DonorActivity (✅ Existe)

**Fichier :** `backend/app/models/organization_donors/donor_activity.py`

**Statut :** Complet

### 6. DonorSegment (❌ À Créer)

**Fichier :** `backend/app/models/organization_donors/donor_segment.py`

```python
class DonorSegment(Base):
    """
    Donor Segment model
    
    Segments allow organizations to categorize donors based on criteria.
    """
    __tablename__ = "donor_segments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Criteria for automatic segmentation (JSON)
    criteria = Column(JSON, default=dict)  # {min_total_donated, max_total_donated, tags, etc.}
    
    # Manual assignment flag
    is_automatic = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    color = Column(String(7), nullable=True)  # Hex color for UI
    donor_count = Column(Integer, default=0, nullable=False)  # Calculated
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    donor_segment_assignments = relationship("DonorSegmentAssignment", back_populates="segment")
```

**Table de liaison :** `DonorSegmentAssignment`
```python
class DonorSegmentAssignment(Base):
    """Many-to-many relationship between donors and segments"""
    __tablename__ = "donor_segment_assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    segment_id = Column(UUID(as_uuid=True), ForeignKey("donor_segments.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    assigned_by = Column(Integer, nullable=True)  # FK to users.id
    
    __table_args__ = (
        UniqueConstraint('donor_id', 'segment_id', name='uq_donor_segment'),
    )
```

### 7. DonorTag (❌ À Créer)

**Fichier :** `backend/app/models/organization_donors/donor_tag.py`

```python
class DonorTag(Base):
    """
    Donor Tag model
    
    Structured tags for categorizing donors.
    Replaces JSON tags array in Donor model.
    """
    __tablename__ = "donor_tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)  # Hex color
    icon = Column(String(50), nullable=True)  # Icon name
    
    donor_count = Column(Integer, default=0, nullable=False)  # Calculated
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('organization_id', 'name', name='uq_org_tag_name'),
    )

class DonorTagAssignment(Base):
    """Many-to-many relationship between donors and tags"""
    __tablename__ = "donor_tag_assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("donor_tags.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    assigned_by = Column(Integer, nullable=True)
    
    __table_args__ = (
        UniqueConstraint('donor_id', 'tag_id', name='uq_donor_tag'),
    )
```

### 8. DonorCommunication (❌ À Créer)

**Fichier :** `backend/app/models/organization_donors/donor_communication.py`

```python
class DonorCommunication(Base):
    """
    Donor Communication model
    
    Tracks all communications with donors (emails, SMS, calls, letters).
    """
    __tablename__ = "donor_communications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    communication_type = Column(String(50), nullable=False)  # 'email', 'sms', 'letter', 'phone', 'in_person'
    subject = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    
    # Status tracking
    status = Column(String(50), default='sent', nullable=False)  # 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    
    # Timestamps
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    
    # Sender
    sent_by = Column(Integer, nullable=True)  # FK to users.id
    
    # Metadata
    metadata = Column(JSON, default=dict)  # Email provider response, etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    donor = relationship("Donor", back_populates="communications")
```

### 9. Campaign (❌ À Créer)

**Fichier :** `backend/app/models/organization_donors/campaign.py`

```python
class Campaign(Base):
    """
    Campaign model
    
    Fundraising campaigns that donations can be associated with.
    """
    __tablename__ = "campaigns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Campaign dates
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Goals
    goal_amount = Column(Numeric(12, 2), nullable=True)
    goal_donors = Column(Integer, nullable=True)
    
    # Status
    status = Column(String(50), default='draft', nullable=False)  # 'draft', 'active', 'paused', 'completed', 'cancelled'
    
    # Calculated stats
    total_raised = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    donor_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    donations = relationship("Donation", back_populates="campaign")
```

### 10. RecurringDonation (❌ À Créer)

**Fichier :** `backend/app/models/organization_donors/recurring_donation.py`

```python
class RecurringDonation(Base):
    """
    Recurring Donation model
    
    Manages recurring donation subscriptions.
    """
    __tablename__ = "recurring_donations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Amount & Frequency
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default='CAD', nullable=False)
    frequency = Column(String(50), nullable=False)  # 'monthly', 'quarterly', 'yearly'
    
    # Payment method
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=False)
    
    # Dates
    start_date = Column(DateTime(timezone=True), nullable=False)
    next_payment_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    status = Column(String(50), default='active', nullable=False)  # 'active', 'paused', 'cancelled', 'failed'
    
    # Statistics
    total_payments = Column(Integer, default=0, nullable=False)
    total_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    donor = relationship("Donor", back_populates="recurring_donations")
    payment_method = relationship("PaymentMethod")
    donations = relationship("Donation", back_populates="recurring_donation")
```

---

## 🔌 API Endpoints - Plan Complet

### Base Path
Tous les endpoints : `/api/v1/organizations/{organization_id}/donors`

### ✅ Endpoints Existants

#### Donateurs
- ✅ `GET /donors` - Liste avec pagination, filtres, recherche
- ✅ `GET /donors/{donor_id}` - Détails d'un donateur
- ✅ `POST /donors` - Créer un donateur
- ✅ `PATCH /donors/{donor_id}` - Modifier un donateur
- ✅ `DELETE /donors/{donor_id}` - Supprimer un donateur

#### Dons
- ✅ `GET /donors/{donor_id}/donations` - Liste des dons
- ✅ `POST /donors/{donor_id}/donations` - Créer un don
- ✅ `GET /donations/{donation_id}` - Détails d'un don
- ✅ `PATCH /donations/{donation_id}` - Modifier un don
- ✅ `POST /donations/{donation_id}/refund` - Rembourser un don

#### Historique & Stats
- ✅ `GET /donors/{donor_id}/history` - Historique complet
- ✅ `GET /donors/{donor_id}/stats` - Statistiques

### ❌ Endpoints à Créer

#### Tags
- ❌ `GET /tags` - Liste des tags
- ❌ `POST /tags` - Créer un tag
- ❌ `GET /tags/{tag_id}` - Détails d'un tag
- ❌ `PATCH /tags/{tag_id}` - Modifier un tag
- ❌ `DELETE /tags/{tag_id}` - Supprimer un tag
- ❌ `POST /donors/{donor_id}/tags` - Ajouter un tag à un donateur
- ❌ `DELETE /donors/{donor_id}/tags/{tag_id}` - Retirer un tag

#### Segments
- ❌ `GET /segments` - Liste des segments
- ❌ `POST /segments` - Créer un segment
- ❌ `GET /segments/{segment_id}` - Détails d'un segment
- ❌ `PATCH /segments/{segment_id}` - Modifier un segment
- ❌ `DELETE /segments/{segment_id}` - Supprimer un segment
- ❌ `GET /segments/{segment_id}/donors` - Donateurs dans le segment
- ❌ `POST /segments/{segment_id}/assign` - Assigner des donateurs
- ❌ `POST /segments/{segment_id}/recalculate` - Recalculer automatiquement

#### Communications
- ❌ `GET /donors/{donor_id}/communications` - Historique des communications
- ❌ `POST /donors/{donor_id}/communications` - Envoyer une communication
- ❌ `GET /communications/{communication_id}` - Détails d'une communication
- ❌ `PATCH /communications/{communication_id}` - Mettre à jour le statut

#### Notes
- ❌ `GET /donors/{donor_id}/notes` - Liste des notes
- ❌ `POST /donors/{donor_id}/notes` - Ajouter une note
- ❌ `GET /notes/{note_id}` - Détails d'une note
- ❌ `PATCH /notes/{note_id}` - Modifier une note
- ❌ `DELETE /notes/{note_id}` - Supprimer une note

#### Campagnes
- ❌ `GET /campaigns` - Liste des campagnes
- ❌ `POST /campaigns` - Créer une campagne
- ❌ `GET /campaigns/{campaign_id}` - Détails d'une campagne
- ❌ `PATCH /campaigns/{campaign_id}` - Modifier une campagne
- ❌ `DELETE /campaigns/{campaign_id}` - Supprimer une campagne
- ❌ `GET /campaigns/{campaign_id}/donations` - Dons de la campagne
- ❌ `GET /campaigns/{campaign_id}/stats` - Statistiques de la campagne

#### Dons Récurrents
- ❌ `GET /donors/{donor_id}/recurring` - Liste des dons récurrents
- ❌ `POST /donors/{donor_id}/recurring` - Créer un don récurrent
- ❌ `GET /recurring/{recurring_id}` - Détails d'un don récurrent
- ❌ `PATCH /recurring/{recurring_id}` - Modifier (pause/resume)
- ❌ `DELETE /recurring/{recurring_id}` - Annuler

#### Export & Rapports
- ❌ `GET /donors/export` - Export CSV/Excel
- ❌ `GET /donors/report` - Rapport détaillé
- ❌ `GET /stats/overview` - Statistiques globales
- ❌ `GET /stats/trends` - Tendances et analytics

#### Reçus Fiscaux
- ❌ `POST /donations/{donation_id}/receipt` - Générer un reçu
- ❌ `GET /donations/{donation_id}/receipt` - Télécharger un reçu
- ❌ `POST /donations/{donation_id}/receipt/send` - Envoyer un reçu par email
- ❌ `GET /donors/{donor_id}/receipts` - Liste des reçus

---

## 🎨 Frontend - Plan Complet

### ✅ Pages Existantes

- ✅ `/dashboard/base-donateur/donateurs` - Liste des donateurs
  - **Production :** https://modeleweb-production-32de.up.railway.app/fr/dashboard/base-donateur/donateurs
  - **Local :** http://localhost:3000/fr/dashboard/base-donateur/donateurs
- ✅ `/dashboard/base-donateur/donateurs/[id]` - Page détail donateur
  - **Production :** https://modeleweb-production-32de.up.railway.app/fr/dashboard/base-donateur/donateurs/{id}
  - **Local :** http://localhost:3000/fr/dashboard/base-donateur/donateurs/{id}

### ❌ Pages à Créer/Améliorer

#### Pages Principales
- ❌ `/dashboard/base-donateur/donateurs/new` - Créer un donateur
- ❌ `/dashboard/base-donateur/donateurs/[id]/edit` - Modifier un donateur
- ❌ `/dashboard/base-donateur/segments` - Gestion des segments
- ❌ `/dashboard/base-donateur/segments/[id]` - Détail segment
- ❌ `/dashboard/base-donateur/campaigns` - Gestion des campagnes
- ❌ `/dashboard/base-donateur/campaigns/[id]` - Détail campagne
- ❌ `/dashboard/base-donateur/reports` - Rapports et analytics
- ❌ `/dashboard/base-donateur/settings` - Paramètres (tags, champs personnalisés)

### Composants à Créer

#### Composants de Liste
```
components/donors/
├── DonorList.tsx              ✅ Existe (à améliorer)
├── DonorTable.tsx             ✅ Existe (à améliorer)
├── DonorFilters.tsx           ❌ À créer
├── DonorSearch.tsx            ❌ À créer
├── DonorExportButton.tsx      ❌ À créer
└── DonorBulkActions.tsx        ❌ À créer
```

#### Composants de Détail
```
components/donors/
├── DonorDetail.tsx            ✅ Existe (à améliorer)
├── DonorHeader.tsx            ❌ À créer
├── DonorStats.tsx             ❌ À créer
├── DonorTabs.tsx              ❌ À créer
├── DonorOverviewTab.tsx       ❌ À créer
├── DonationHistoryTab.tsx     ❌ À créer
├── DonorProfileTab.tsx        ❌ À créer
├── PaymentMethodsTab.tsx      ❌ À créer
├── CommunicationsTab.tsx       ❌ À créer
└── NotesActivitiesTab.tsx      ❌ À créer
```

#### Composants de Formulaire
```
components/donors/
├── DonorForm.tsx              ❌ À créer
├── DonorFormBasic.tsx         ❌ À créer
├── DonorFormAddress.tsx       ❌ À créer
├── DonorFormPreferences.tsx   ❌ À créer
└── DonorFormCustomFields.tsx  ❌ À créer
```

#### Composants de Dons
```
components/donors/
├── DonationHistory.tsx        ❌ À créer
├── DonationTimeline.tsx       ❌ À créer
├── DonationCard.tsx           ❌ À créer
├── DonationForm.tsx           ❌ À créer
└── RecurringDonationCard.tsx  ❌ À créer
```

#### Composants CRM
```
components/donors/
├── DonorTags.tsx              ❌ À créer
├── DonorSegments.tsx          ❌ À créer
├── DonorNotes.tsx             ❌ À créer
├── DonorCommunications.tsx     ❌ À créer
├── SegmentManager.tsx          ❌ À créer
└── TagManager.tsx             ❌ À créer
```

#### Composants Analytics
```
components/donors/
├── DonorStatsOverview.tsx     ❌ À créer
├── DonorTrendsChart.tsx       ❌ À créer
├── CampaignStats.tsx          ❌ À créer
└── ExportReports.tsx           ❌ À créer
```

---

## 🚀 Plan d'Implémentation par Phases

### Phase 1 : Fondations Backend (Semaine 1-2)

**Objectif :** Compléter les modèles de données manquants

#### Tâches
1. **Créer modèles manquants**
   - [ ] `DonorSegment` + `DonorSegmentAssignment`
   - [ ] `DonorTag` + `DonorTagAssignment`
   - [ ] `DonorCommunication`
   - [ ] `Campaign`
   - [ ] `RecurringDonation`

2. **Migrations Alembic**
   - [ ] Créer migration pour nouveaux modèles
   - [ ] Migration des tags JSON vers table `DonorTag`
   - [ ] Script de migration des données existantes

3. **Schémas Pydantic**
   - [ ] Ajouter schémas pour segments
   - [ ] Ajouter schémas pour tags
   - [ ] Ajouter schémas pour communications
   - [ ] Ajouter schémas pour campagnes
   - [ ] Ajouter schémas pour dons récurrents

4. **Relationships**
   - [ ] Mettre à jour les relationships dans les modèles existants
   - [ ] Ajouter back_populates appropriés

**Livrables :**
- ✅ Tous les modèles créés
- ✅ Migrations testées
- ✅ Schémas Pydantic complets

---

### Phase 2 : API Endpoints - Tags & Segments (Semaine 2-3)

**Objectif :** Implémenter les endpoints pour tags et segments

#### Tâches
1. **Endpoints Tags**
   - [ ] `GET /tags` - Liste
   - [ ] `POST /tags` - Créer
   - [ ] `GET /tags/{id}` - Détails
   - [ ] `PATCH /tags/{id}` - Modifier
   - [ ] `DELETE /tags/{id}` - Supprimer
   - [ ] `POST /donors/{id}/tags` - Assigner tag
   - [ ] `DELETE /donors/{id}/tags/{tag_id}` - Retirer tag

2. **Endpoints Segments**
   - [ ] `GET /segments` - Liste
   - [ ] `POST /segments` - Créer
   - [ ] `GET /segments/{id}` - Détails
   - [ ] `PATCH /segments/{id}` - Modifier
   - [ ] `DELETE /segments/{id}` - Supprimer
   - [ ] `GET /segments/{id}/donors` - Donateurs
   - [ ] `POST /segments/{id}/assign` - Assigner donateurs
   - [ ] `POST /segments/{id}/recalculate` - Recalculer

3. **Services**
   - [ ] `TagService` - Logique métier tags
   - [ ] `SegmentService` - Logique métier segments
   - [ ] Service de recalcul automatique des segments

4. **Tests**
   - [ ] Tests unitaires pour services
   - [ ] Tests d'intégration pour endpoints

**Livrables :**
- ✅ API tags fonctionnelle
- ✅ API segments fonctionnelle
- ✅ Tests passants

---

### Phase 3 : API Endpoints - Communications & Notes (Semaine 3-4)

**Objectif :** Implémenter les endpoints pour communications et notes

#### Tâches
1. **Endpoints Communications**
   - [ ] `GET /donors/{id}/communications` - Liste
   - [ ] `POST /donors/{id}/communications` - Envoyer
   - [ ] `GET /communications/{id}` - Détails
   - [ ] `PATCH /communications/{id}` - Mettre à jour statut

2. **Endpoints Notes**
   - [ ] `GET /donors/{id}/notes` - Liste
   - [ ] `POST /donors/{id}/notes` - Créer
   - [ ] `GET /notes/{id}` - Détails
   - [ ] `PATCH /notes/{id}` - Modifier
   - [ ] `DELETE /notes/{id}` - Supprimer

3. **Intégrations Email/SMS**
   - [ ] Service d'envoi d'emails
   - [ ] Service d'envoi de SMS (optionnel)
   - [ ] Webhooks pour statuts (delivered, opened, etc.)

**Livrables :**
- ✅ API communications fonctionnelle
- ✅ API notes fonctionnelle
- ✅ Intégration email de base

---

### Phase 4 : API Endpoints - Campagnes & Dons Récurrents (Semaine 4-5)

**Objectif :** Implémenter les endpoints pour campagnes et dons récurrents

#### Tâches
1. **Endpoints Campagnes**
   - [ ] `GET /campaigns` - Liste
   - [ ] `POST /campaigns` - Créer
   - [ ] `GET /campaigns/{id}` - Détails
   - [ ] `PATCH /campaigns/{id}` - Modifier
   - [ ] `DELETE /campaigns/{id}` - Supprimer
   - [ ] `GET /campaigns/{id}/donations` - Dons
   - [ ] `GET /campaigns/{id}/stats` - Statistiques

2. **Endpoints Dons Récurrents**
   - [ ] `GET /donors/{id}/recurring` - Liste
   - [ ] `POST /donors/{id}/recurring` - Créer
   - [ ] `GET /recurring/{id}` - Détails
   - [ ] `PATCH /recurring/{id}` - Pause/Resume
   - [ ] `DELETE /recurring/{id}` - Annuler

3. **Tâches Planifiées**
   - [ ] Système de tâches planifiées pour dons récurrents
   - [ ] Job pour traiter les paiements récurrents

**Livrables :**
- ✅ API campagnes fonctionnelle
- ✅ API dons récurrents fonctionnelle
- ✅ Système de traitement automatique

---

### Phase 5 : API Endpoints - Export & Rapports (Semaine 5-6)

**Objectif :** Implémenter les fonctionnalités d'export et de rapports

#### Tâches
1. **Export**
   - [ ] `GET /donors/export` - Export CSV
   - [ ] `GET /donors/export` - Export Excel
   - [ ] Filtres pour export
   - [ ] Export asynchrone (job queue)

2. **Rapports**
   - [ ] `GET /stats/overview` - Vue d'ensemble
   - [ ] `GET /stats/trends` - Tendances
   - [ ] `GET /donors/report` - Rapport détaillé
   - [ ] Rapports par période (jour, semaine, mois, année)

3. **Reçus Fiscaux**
   - [ ] `POST /donations/{id}/receipt` - Générer
   - [ ] `GET /donations/{id}/receipt` - Télécharger
   - [ ] `POST /donations/{id}/receipt/send` - Envoyer
   - [ ] Template de reçu fiscal
   - [ ] Génération PDF

**Livrables :**
- ✅ Export CSV/Excel fonctionnel
- ✅ Rapports détaillés
- ✅ Génération de reçus fiscaux

---

### Phase 6 : Frontend - Types & API Client (Semaine 6)

**Objectif :** Mettre à jour les types TypeScript et le client API

#### Tâches
1. **Types TypeScript**
   - [ ] Ajouter types pour segments
   - [ ] Ajouter types pour tags
   - [ ] Ajouter types pour communications
   - [ ] Ajouter types pour campagnes
   - [ ] Ajouter types pour dons récurrents

2. **Client API**
   - [ ] Fonctions pour tags
   - [ ] Fonctions pour segments
   - [ ] Fonctions pour communications
   - [ ] Fonctions pour campagnes
   - [ ] Fonctions pour dons récurrents
   - [ ] Fonctions pour export
   - [ ] Fonctions pour rapports

**Livrables :**
- ✅ Types complets
- ✅ Client API complet

---

### Phase 7 : Frontend - Composants de Base (Semaine 7-8)

**Objectif :** Créer les composants de base réutilisables

#### Tâches
1. **Composants de Liste**
   - [ ] `DonorFilters.tsx` - Filtres avancés
   - [ ] `DonorSearch.tsx` - Recherche
   - [ ] `DonorExportButton.tsx` - Export
   - [ ] `DonorBulkActions.tsx` - Actions groupées

2. **Composants de Détail**
   - [ ] `DonorHeader.tsx` - En-tête
   - [ ] `DonorStats.tsx` - Statistiques
   - [ ] `DonorTabs.tsx` - Système d'onglets

3. **Composants de Formulaire**
   - [ ] `DonorForm.tsx` - Formulaire principal
   - [ ] `DonorFormBasic.tsx` - Informations de base
   - [ ] `DonorFormAddress.tsx` - Adresse
   - [ ] `DonorFormPreferences.tsx` - Préférences

**Livrables :**
- ✅ Composants de base créés
- ✅ Intégration dans les pages existantes

---

### Phase 8 : Frontend - Composants CRM (Semaine 8-9)

**Objectif :** Créer les composants CRM (tags, segments, notes, communications)

#### Tâches
1. **Tags & Segments**
   - [ ] `DonorTags.tsx` - Gestion des tags
   - [ ] `DonorSegments.tsx` - Gestion des segments
   - [ ] `SegmentManager.tsx` - Gestionnaire de segments
   - [ ] `TagManager.tsx` - Gestionnaire de tags

2. **Notes & Communications**
   - [ ] `DonorNotes.tsx` - Liste et ajout de notes
   - [ ] `DonorCommunications.tsx` - Historique communications
   - [ ] Composant d'envoi de communication

**Livrables :**
- ✅ Composants CRM fonctionnels
- ✅ Intégration dans page détail donateur

---

### Phase 9 : Frontend - Composants de Dons (Semaine 9-10)

**Objectif :** Créer les composants pour gérer les dons

#### Tâches
1. **Historique des Dons**
   - [ ] `DonationHistory.tsx` - Historique complet
   - [ ] `DonationTimeline.tsx` - Timeline visuelle
   - [ ] `DonationCard.tsx` - Carte de don

2. **Formulaires de Dons**
   - [ ] `DonationForm.tsx` - Créer un don
   - [ ] `RecurringDonationCard.tsx` - Carte don récurrent
   - [ ] Formulaire don récurrent

3. **Reçus Fiscaux**
   - [ ] Composant d'affichage de reçu
   - [ ] Bouton de génération
   - [ ] Bouton d'envoi

**Livrables :**
- ✅ Composants de dons fonctionnels
- ✅ Intégration dans page détail donateur

---

### Phase 10 : Frontend - Pages Complètes (Semaine 10-11)

**Objectif :** Créer/compléter toutes les pages nécessaires

#### Tâches
1. **Pages Donateurs**
   - [ ] Améliorer page liste (`/donateurs`)
   - [ ] Améliorer page détail (`/donateurs/[id]`)
   - [ ] Créer page création (`/donateurs/new`)
   - [ ] Créer page modification (`/donateurs/[id]/edit`)

2. **Pages Segments**
   - [ ] Créer page liste (`/segments`)
   - [ ] Créer page détail (`/segments/[id]`)

3. **Pages Campagnes**
   - [ ] Créer page liste (`/campaigns`)
   - [ ] Créer page détail (`/campaigns/[id]`)

4. **Pages Rapports**
   - [ ] Créer page rapports (`/reports`)
   - [ ] Dashboard analytics

**Livrables :**
- ✅ Toutes les pages créées
- ✅ Navigation complète
- ✅ UX optimisée

---

### Phase 11 : Analytics & Dashboards (Semaine 11-12)

**Objectif :** Créer les dashboards et analytics

#### Tâches
1. **Dashboard Principal**
   - [ ] Vue d'ensemble avec KPIs
   - [ ] Graphiques de tendances
   - [ ] Top donateurs
   - [ ] Campagnes actives

2. **Analytics Avancées**
   - [ ] `DonorTrendsChart.tsx` - Graphiques de tendances
   - [ ] `CampaignStats.tsx` - Stats de campagnes
   - [ ] Rapports personnalisables

3. **Export & Rapports**
   - [ ] `ExportReports.tsx` - Interface d'export
   - [ ] Templates de rapports
   - [ ] Export programmé

**Livrables :**
- ✅ Dashboard complet
- ✅ Analytics fonctionnelles
- ✅ Rapports exportables

---

### Phase 12 : Tests & Optimisations (Semaine 12-13)

**Objectif :** Tests complets et optimisations

#### Tâches
1. **Tests Backend**
   - [ ] Tests unitaires pour tous les services
   - [ ] Tests d'intégration pour tous les endpoints
   - [ ] Tests de performance

2. **Tests Frontend**
   - [ ] Tests unitaires pour composants
   - [ ] Tests d'intégration pour pages
   - [ ] Tests E2E pour flux principaux

3. **Optimisations**
   - [ ] Optimisation des requêtes DB
   - [ ] Pagination efficace
   - [ ] Cache approprié
   - [ ] Lazy loading

4. **Documentation**
   - [ ] Documentation API
   - [ ] Documentation composants
   - [ ] Guide utilisateur

**Livrables :**
- ✅ Tests complets
- ✅ Performance optimisée
- ✅ Documentation complète

---

## 📊 Priorités et MVP

### MVP (Minimum Viable Product) - Semaines 1-6

**Fonctionnalités essentielles :**
1. ✅ Modèles de données complets
2. ✅ API CRUD complète pour donateurs et dons
3. ✅ Liste des donateurs avec recherche/filtres
4. ✅ Page détail donateur avec historique
5. ✅ Tags de base (même si JSON)
6. ✅ Notes sur donateurs

**Critères de succès MVP :**
- Un utilisateur peut créer, voir, modifier, supprimer un donateur
- Un utilisateur peut ajouter des dons à un donateur
- Un utilisateur peut voir l'historique complet d'un donateur
- Un utilisateur peut ajouter des notes
- Un utilisateur peut rechercher et filtrer les donateurs

### V2 - Fonctionnalités Avancées - Semaines 7-12

**Fonctionnalités avancées :**
1. Segments avec recalcul automatique
2. Tags structurés avec gestion
3. Communications (emails, SMS)
4. Campagnes de collecte
5. Dons récurrents
6. Export CSV/Excel
7. Rapports détaillés
8. Reçus fiscaux

### V3 - Optimisations & Extras - Semaines 13+

**Fonctionnalités supplémentaires :**
1. Analytics avancées
2. Intégrations paiement (Stripe, PayPal)
3. Automatisations (workflows)
4. Scoring de donateurs
5. Prédictions (ML)
6. API publique pour donateurs

---

## 🔐 Sécurité & Permissions

### Rôles et Permissions

#### SuperAdmin
- Accès à toutes les organisations
- Gestion complète

#### Organization Admin
- Gestion complète des donateurs de son organisation
- Accès à tous les rapports
- Gestion des campagnes

#### Organization Member
- Lecture/écriture limitée
- Pas d'accès aux données sensibles (numéros de carte)

#### Organization Viewer
- Lecture seule
- Pas de modification

### Validations

- [ ] Vérifier accès à l'organisation
- [ ] Vérifier permissions pour chaque action
- [ ] Masquer données sensibles (numéros de carte)
- [ ] Chiffrement des données sensibles
- [ ] Audit log pour actions importantes

---

## 📈 Métriques et KPIs

### Métriques Donateur
- Total donné (vie, année, mois)
- Nombre de dons
- Don moyen
- Dernier don
- Prochain don récurrent
- Tendance (augmentation/diminution)
- Score d'engagement

### Métriques Organisation
- Nombre total de donateurs
- Nouveaux donateurs (période)
- Donateurs actifs
- Montant total collecté
- Don moyen
- Taux de rétention
- Taux de croissance
- Taux de conversion

### Métriques Campagne
- Montant collecté
- Nombre de donateurs
- Taux de conversion
- Coût par donateur acquis
- ROI

---

## 🛠️ Technologies et Outils

### Backend
- **Framework :** FastAPI
- **ORM :** SQLAlchemy 2.0
- **Base de données :** PostgreSQL
- **Migrations :** Alembic
- **Validation :** Pydantic
- **Tests :** pytest

### Frontend
- **Framework :** Next.js 14+ (App Router)
- **UI :** React, Tailwind CSS
- **State :** Zustand (optionnel)
- **Forms :** React Hook Form
- **Charts :** Recharts / Chart.js
- **Export :** xlsx / csv-writer

### Intégrations
- **Email :** SendGrid / AWS SES
- **SMS :** Twilio (optionnel)
- **Paiement :** Stripe / PayPal
- **PDF :** ReportLab / WeasyPrint

---

## 📝 Checklist de Déploiement

### Pré-déploiement
- [ ] Tous les tests passent
- [ ] Documentation complète
- [ ] Migration de base de données testée
- [ ] Backup de la base de données
- [ ] Variables d'environnement configurées

### Déploiement
- [ ] Exécuter migrations
- [ ] Déployer backend
- [ ] Déployer frontend
- [ ] Vérifier endpoints API
- [ ] Vérifier pages frontend

### Post-déploiement
- [ ] Monitoring en place
- [ ] Logs vérifiés
- [ ] Performance vérifiée
- [ ] Feedback utilisateurs collecté

---

## 📚 Ressources et Références

### Documentation Interne
- `docs/DONOR_CRM_PLAN.md` - Plan original
- `backend/DATABASE_SCHEMA.md` - Schéma de base de données
- `CODE_STRUCTURE.md` - Structure du code

### Standards et Bonnes Pratiques
- [Nonprofit CRM Best Practices](https://altrata.com/articles/nonprofit-crm-best-practices)
- [Donor Management Best Practices](https://www.netsuite.com/portal/resource/articles/crm/donor-management-best-practices.shtml)
- [Microsoft Common Data Model for Nonprofits](https://learn.microsoft.com/en-us/industry/nonprofit/common-data-model-for-nonprofits)

---

## ✅ Résumé

Ce plan fournit une feuille de route complète pour finaliser le système CRM de donateurs. Il est organisé en 12 phases sur 13 semaines, avec des priorités claires (MVP, V2, V3).

**Prochaines étapes immédiates :**
1. Valider ce plan avec l'équipe
2. Commencer Phase 1 : Créer les modèles manquants
3. Mettre en place le suivi de progression

**Questions ou clarifications nécessaires ?**
- Priorités spécifiques à ajuster ?
- Fonctionnalités supplémentaires à inclure ?
- Contraintes techniques à considérer ?
