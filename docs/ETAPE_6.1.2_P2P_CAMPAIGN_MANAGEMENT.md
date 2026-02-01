# Étape 6.1.2 : Gestion des Campagnes P2P

**Date:** 1er février 2026

## Contexte

Cette étape implémente la gestion complète des campagnes P2P (peer-to-peer), permettant aux organisations de créer, modifier, supprimer et visualiser leurs campagnes de collecte peer-to-peer.

**Référence:** Module P2P - Gestion des campagnes

## Objectifs

- Créer une interface complète pour gérer les campagnes P2P
- Permettre la création, modification, suppression et visualisation des campagnes
- Afficher les statistiques de chaque campagne
- Intégrer avec le modèle de données P2P créé à l'étape 6.1.1

## Architecture

### Actions Serveur

#### 1. `listP2PCampaigns`

**Fichier:** `apps/web/src/app/actions/p2p/listCampaigns.ts`

Liste les campagnes P2P d'une organisation avec pagination et filtres.

**Paramètres:**
- `organizationId`: ID de l'organisation
- `status?`: Filtre par statut (DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED)
- `page?`: Numéro de page (défaut: 1)
- `pageSize?`: Taille de page (défaut: 20)

**Utilisation:**
```typescript
import { listP2PCampaigns } from '@/app/actions/p2p';

const result = await listP2PCampaigns({
  organizationId: 'org-id',
  status: 'ACTIVE',
  page: 1,
  pageSize: 20,
});
```

#### 2. `createP2PCampaign`

**Fichier:** `apps/web/src/app/actions/p2p/createCampaign.ts`

Crée une nouvelle campagne P2P.

**Paramètres:**
- `organizationId`: ID de l'organisation
- `name`: Nom de la campagne
- `slug`: Identifiant URL-friendly (unique)
- `description?`: Description
- `startDate?` / `endDate?`: Dates de début et fin
- `goalAmount?`: Objectif de collecte
- `goalParticipants?`: Objectif de participants
- `allowTeams?`: Permet les équipes (défaut: true)
- `allowIndividualParticipants?`: Permet les participants individuels (défaut: true)
- `minTeamSize?` / `maxTeamSize?`: Contraintes de taille d'équipe
- `coverImage?` / `logo?` / `primaryColor?`: Branding

**Utilisation:**
```typescript
import { createP2PCampaign } from '@/app/actions/p2p';

const result = await createP2PCampaign({
  organizationId: 'org-id',
  name: 'Course pour la cause',
  slug: 'course-pour-la-cause',
  goalAmount: 50000,
  allowTeams: true,
});
```

#### 3. `getP2PCampaign`

**Fichier:** `apps/web/src/app/actions/p2p/getCampaign.ts`

Récupère les détails d'une campagne P2P.

**Paramètres:**
- `campaignId`: ID de la campagne
- `organizationId`: ID de l'organisation

#### 4. `updateP2PCampaign`

**Fichier:** `apps/web/src/app/actions/p2p/updateCampaign.ts`

Met à jour une campagne P2P existante.

**Paramètres:** Tous les champs de création sont optionnels pour la mise à jour.

#### 5. `deleteP2PCampaign`

**Fichier:** `apps/web/src/app/actions/p2p/deleteCampaign.ts`

Supprime une campagne P2P et toutes ses données associées (participants, équipes).

### Composants UI

#### 1. `P2PCampaignCard`

**Fichier:** `apps/web/src/components/p2p/P2PCampaignCard.tsx`

Carte pour afficher une campagne dans la liste.

**Props:**
- `campaign`: Données de la campagne
- `onView?`: Callback pour voir les détails
- `onEdit?`: Callback pour modifier
- `onDelete?`: Callback pour supprimer

**Fonctionnalités:**
- Affiche les statistiques (montant collecté, participants, équipes)
- Barre de progression vers l'objectif
- Badge de statut coloré
- Dates de début et fin

#### 2. `P2PCampaignList`

**Fichier:** `apps/web/src/components/p2p/P2PCampaignList.tsx`

Liste des campagnes avec empty state.

**Props:**
- `campaigns`: Liste des campagnes
- `isLoading?`: État de chargement
- `onCreateClick?`: Callback pour créer une campagne
- `onCampaignClick?`: Callback pour voir une campagne
- `onCampaignEdit?`: Callback pour modifier
- `onCampaignDelete?`: Callback pour supprimer

### Pages

#### 1. Liste des Campagnes

**Fichier:** `apps/web/src/app/[locale]/dashboard/p2p/campagnes/page.tsx`

Page principale listant toutes les campagnes P2P.

**Fonctionnalités:**
- Affichage de la liste des campagnes
- Bouton pour créer une nouvelle campagne
- Actions sur chaque campagne (voir, modifier, supprimer)
- Empty state avec CTA pour créer la première campagne

#### 2. Création de Campagne

**Fichier:** `apps/web/src/app/[locale]/dashboard/p2p/campagnes/new/page.tsx`

Formulaire de création d'une nouvelle campagne P2P.

**Champs du formulaire:**
- Nom de la campagne (requis)
- Slug (généré automatiquement depuis le nom, modifiable)
- Description
- Dates de début et fin
- Objectifs (montant et participants)
- Configuration (équipes, participants individuels)
- Contraintes de taille d'équipe
- Couleur principale

#### 3. Détail d'une Campagne

**Fichier:** `apps/web/src/app/[locale]/dashboard/p2p/campagnes/[id]/page.tsx`

Page de détail d'une campagne P2P.

**Fonctionnalités:**
- Affichage des statistiques (montant collecté, participants, équipes)
- Barre de progression vers l'objectif
- Informations générales (statut, dates, slug)
- Configuration (équipes, participants)
- Bouton pour modifier la campagne

## Flux d'Utilisation

### 1. Créer une Campagne

1. Accéder à `/dashboard/p2p/campagnes`
2. Cliquer sur "Créer une campagne"
3. Remplir le formulaire de création
4. Le slug est généré automatiquement depuis le nom (modifiable)
5. Configurer les options (équipes, participants, objectifs)
6. Cliquer sur "Créer la campagne"
7. Redirection vers la page de détail

### 2. Voir les Détails d'une Campagne

1. Cliquer sur une carte de campagne dans la liste
2. Voir les statistiques en temps réel
3. Consulter la configuration
4. Modifier ou supprimer la campagne

### 3. Modifier une Campagne

1. Depuis la liste ou la page de détail, cliquer sur "Modifier"
2. Modifier les champs souhaités
3. Sauvegarder les modifications

### 4. Supprimer une Campagne

1. Cliquer sur "Supprimer" (depuis la liste ou la page de détail)
2. Confirmer la suppression
3. La campagne et toutes ses données associées sont supprimées

## Exemples d'Utilisation

### Exemple 1 : Créer une Campagne avec Équipes

```typescript
import { createP2PCampaign } from '@/app/actions/p2p';

const result = await createP2PCampaign({
  organizationId: 'org-id',
  name: 'Défi collectif 2026',
  slug: 'defi-collectif-2026',
  description: 'Relevez le défi avec votre équipe !',
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  goalAmount: 100000,
  goalParticipants: 200,
  allowTeams: true,
  allowIndividualParticipants: true,
  minTeamSize: 3,
  maxTeamSize: 10,
  primaryColor: '#3B82F6',
});
```

### Exemple 2 : Lister les Campagnes Actives

```typescript
import { listP2PCampaigns } from '@/app/actions/p2p';

const result = await listP2PCampaigns({
  organizationId: 'org-id',
  status: 'ACTIVE',
  pageSize: 50,
});

if (result.success && result.campaigns) {
  result.campaigns.forEach(campaign => {
    console.log(`${campaign.name}: ${campaign.totalRaised} CAD collectés`);
  });
}
```

## Checklist de Vérification

- [x] Les actions serveur CRUD sont créées et fonctionnelles
- [x] Le composant `P2PCampaignCard` affiche correctement les campagnes
- [x] Le composant `P2PCampaignList` gère l'empty state
- [x] La page de liste affiche toutes les campagnes
- [x] La page de création permet de créer une campagne
- [x] La page de détail affiche les informations complètes
- [x] Les statistiques sont calculées et affichées
- [x] La navigation entre les pages fonctionne
- [x] Les erreurs sont gérées gracieusement

## Notes Techniques

1. **Slug**: Le slug est généré automatiquement depuis le nom mais peut être modifié manuellement. Il doit être unique et respecter le pattern `[a-z0-9-]+`.

2. **Statistiques**: Les statistiques (`totalRaised`, `participantCount`, etc.) sont calculées et mises à jour via la logique applicative. Elles peuvent être recalculées périodiquement.

3. **Suppression en cascade**: La suppression d'une campagne supprime automatiquement tous les participants et équipes associés grâce à `onDelete: Cascade` dans Prisma.

4. **Validation**: Les validations sont effectuées côté serveur pour garantir l'intégrité des données.

5. **Performance**: La pagination est implémentée pour gérer un grand nombre de campagnes.

## Prochaines Étapes

- [ ] Créer la page d'édition de campagne
- [ ] Ajouter la gestion des participants (création, modification, suppression)
- [ ] Ajouter la gestion des équipes
- [ ] Créer les pages publiques pour les participants
- [ ] Intégrer avec le système de dons pour lier les dons aux participants
- [ ] Ajouter des fonctionnalités de leaderboard
- [ ] Implémenter les notifications pour les participants
