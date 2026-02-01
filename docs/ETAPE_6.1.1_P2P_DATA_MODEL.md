# Étape 6.1.1 : Modèle de Données P2P (Peer-to-Peer)

**Date:** 1er février 2026

## Contexte

Cette étape définit le modèle de données pour les campagnes de collecte peer-to-peer (P2P), permettant aux organisations de créer des campagnes où des participants individuels ou des équipes collectent des fonds.

**Référence:** Module P2P - Campagnes peer-to-peer

## Objectifs

- Créer les modèles de données pour les campagnes P2P
- Permettre la création de participants individuels et d'équipes
- Suivre les statistiques de collecte par participant et par équipe
- Intégrer avec le système de dons existant

## Architecture

### Modèles de Données

#### 1. P2PCampaign (Campagne P2P)

**Fichier:** `packages/database/prisma/schema.prisma`

Campagne principale de collecte peer-to-peer.

**Champs principaux:**
- `id`: Identifiant unique
- `organizationId`: Organisation propriétaire
- `name`: Nom de la campagne
- `description`: Description de la campagne
- `slug`: Identifiant URL-friendly (unique)
- `startDate` / `endDate`: Dates de début et fin
- `goalAmount`: Objectif de collecte global
- `goalParticipants`: Objectif de nombre de participants
- `status`: Statut (DRAFT, ACTIVE, PAUSED, COMPLETED, CANCELLED)
- `allowTeams`: Permet la création d'équipes
- `allowIndividualParticipants`: Permet les participants individuels
- `minTeamSize` / `maxTeamSize`: Contraintes sur la taille des équipes
- `totalRaised`: Montant total collecté (calculé)
- `participantCount`: Nombre de participants (calculé)
- `teamCount`: Nombre d'équipes (calculé)

**Relations:**
- `participants`: Liste des participants (P2PParticipant[])
- `teams`: Liste des équipes (P2PTeam[])

**Index:**
- `organizationId`, `status`, `slug`, `startDate`, `endDate`

#### 2. P2PTeam (Équipe P2P)

**Fichier:** `packages/database/prisma/schema.prisma`

Équipe de participants collectant ensemble.

**Champs principaux:**
- `id`: Identifiant unique
- `campaignId`: Campagne parente
- `name`: Nom de l'équipe
- `description`: Description de l'équipe
- `slug`: Identifiant URL-friendly (unique par campagne)
- `teamLeaderId`: ID du participant chef d'équipe
- `goalAmount`: Objectif de collecte de l'équipe
- `totalRaised`: Montant total collecté par l'équipe (calculé)
- `memberCount`: Nombre de membres (calculé)

**Relations:**
- `campaign`: Campagne parente (P2PCampaign)
- `participants`: Membres de l'équipe (P2PParticipant[])

**Contraintes:**
- `slug` unique par campagne (`@@unique([campaignId, slug])`)

**Index:**
- `campaignId`, `teamLeaderId`

#### 3. P2PParticipant (Participant P2P)

**Fichier:** `packages/database/prisma/schema.prisma`

Participant individuel (peut être membre d'une équipe ou indépendant).

**Champs principaux:**
- `id`: Identifiant unique
- `campaignId`: Campagne parente
- `teamId`: Équipe (optionnel, null si participant individuel)
- `firstName` / `lastName`: Nom et prénom
- `email`: Email (unique par campagne)
- `phone`: Téléphone (optionnel)
- `slug`: Identifiant URL-friendly pour la page personnelle (unique par campagne)
- `personalMessage`: Message personnalisé sur la page de collecte
- `goalAmount`: Objectif de collecte personnel
- `status`: Statut (ACTIVE, INACTIVE, COMPLETED)
- `totalRaised`: Montant total collecté (calculé)
- `donationCount`: Nombre de dons reçus (calculé)
- `profileImage`: URL de la photo de profil
- `customFields`: Champs personnalisés additionnels (JSON)

**Relations:**
- `campaign`: Campagne parente (P2PCampaign)
- `team`: Équipe (optionnel, P2PTeam?)

**Contraintes:**
- `slug` unique par campagne (`@@unique([campaignId, slug])`)
- `email` unique par campagne (`@@unique([campaignId, email])`)

**Index:**
- `campaignId`, `teamId`, `email`, `status`

### Enums

#### P2PCampaignStatus
- `DRAFT`: Brouillon
- `ACTIVE`: Active
- `PAUSED`: En pause
- `COMPLETED`: Terminée
- `CANCELLED`: Annulée

#### P2PParticipantStatus
- `ACTIVE`: Actif
- `INACTIVE`: Inactif
- `COMPLETED`: Objectif atteint

## Relations avec les Modèles Existants

### Organisation
- Chaque campagne P2P appartient à une organisation (`organizationId`)
- Relation avec `Organization` via `onDelete: Cascade`

### Dons
- Les dons sont liés aux participants/équipes via le champ `campaignId` dans le modèle `Donation`
- Un champ additionnel peut être ajouté pour référencer directement le participant (`p2pParticipantId`)

### Donateurs
- Les participants P2P peuvent être des donateurs existants (identifiés par email)
- Ou de nouveaux participants qui ne sont pas encore dans le système de donateurs

## Structure de Données

```
Organization
  └── P2PCampaign (1-N)
       ├── P2PParticipant (1-N) [individuels]
       └── P2PTeam (1-N)
            └── P2PParticipant (1-N) [membres d'équipe]
```

## Exemples d'Utilisation

### Exemple 1 : Campagne avec Participants Individuels

```prisma
// Créer une campagne
const campaign = await prisma.p2PCampaign.create({
  data: {
    organizationId: 'org-id',
    name: 'Course pour la cause',
    slug: 'course-pour-la-cause',
    allowIndividualParticipants: true,
    allowTeams: false,
    goalAmount: 50000,
    status: 'ACTIVE',
  },
});

// Créer un participant
const participant = await prisma.p2PParticipant.create({
  data: {
    campaignId: campaign.id,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@example.com',
    slug: 'jean-dupont',
    goalAmount: 1000,
    status: 'ACTIVE',
  },
});
```

### Exemple 2 : Campagne avec Équipes

```prisma
// Créer une campagne avec équipes
const campaign = await prisma.p2PCampaign.create({
  data: {
    organizationId: 'org-id',
    name: 'Défi collectif',
    slug: 'defi-collectif',
    allowTeams: true,
    minTeamSize: 3,
    maxTeamSize: 10,
    goalAmount: 100000,
    status: 'ACTIVE',
  },
});

// Créer une équipe
const team = await prisma.p2PTeam.create({
  data: {
    campaignId: campaign.id,
    name: 'Équipe Alpha',
    slug: 'equipe-alpha',
    goalAmount: 10000,
  },
});

// Ajouter des membres à l'équipe
const member1 = await prisma.p2PParticipant.create({
  data: {
    campaignId: campaign.id,
    teamId: team.id,
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie@example.com',
    slug: 'marie-martin',
    goalAmount: 2000,
    status: 'ACTIVE',
  },
});
```

## Migration de Base de Données

Pour créer les tables P2P dans la base de données :

```bash
cd apps/web
pnpm db:push
# ou
pnpm db:migrate dev --name add_p2p_models
```

## Types TypeScript

Les types seront générés automatiquement par Prisma après la migration :

```typescript
import { P2PCampaign, P2PTeam, P2PParticipant, P2PCampaignStatus, P2PParticipantStatus } from '@prisma/client';
```

## Checklist de Vérification

- [x] Le modèle `P2PCampaign` est créé avec tous les champs nécessaires
- [x] Le modèle `P2PTeam` est créé avec relation vers campagne
- [x] Le modèle `P2PParticipant` est créé avec support individuel et équipe
- [x] Les enums `P2PCampaignStatus` et `P2PParticipantStatus` sont définis
- [x] Les relations entre modèles sont correctement configurées
- [x] Les index sont créés pour optimiser les requêtes
- [x] Les contraintes d'unicité sont définies (slug, email)
- [x] La relation avec `Organization` est configurée

## Notes Techniques

1. **Slugs**: Les slugs sont uniques par campagne pour permettre des URLs propres comme `/p2p/campaign-slug/participant-slug`

2. **Statistiques Calculées**: Les champs `totalRaised`, `participantCount`, etc. sont calculés et mis à jour via des triggers ou de la logique applicative

3. **Participants vs Donateurs**: Les participants P2P ne sont pas nécessairement des donateurs existants. Ils peuvent être identifiés par email pour faire le lien, mais peuvent aussi être de nouveaux participants

4. **Flexibilité**: Le modèle supporte à la fois les participants individuels et les équipes, avec des options de configuration par campagne

5. **Extensibilité**: Le champ `customFields` (JSON) permet d'ajouter des champs personnalisés sans modifier le schéma

## Prochaines Étapes

- [ ] Créer les actions serveur pour gérer les campagnes P2P
- [ ] Créer les composants UI pour la création et gestion de campagnes
- [ ] Créer les pages publiques pour les participants
- [ ] Intégrer avec le système de dons pour lier les dons aux participants
- [ ] Ajouter des fonctionnalités de leaderboard et de classement
- [ ] Implémenter les notifications et emails pour les participants
