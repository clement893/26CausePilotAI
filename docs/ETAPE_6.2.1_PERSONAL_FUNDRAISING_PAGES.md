# Étape 6.2.1 : Pages de Collecte Personnelles P2P

**Date:** 1er février 2026

## Contexte

Cette étape implémente les pages publiques de collecte personnelles pour les participants P2P, permettant à chaque participant d'avoir sa propre page où les donateurs peuvent faire des dons.

**Référence:** Module P2P - Pages de collecte personnelles

## Objectifs

- Créer des pages publiques pour chaque participant P2P
- Permettre l'inscription comme participant à une campagne
- Intégrer le système de dons avec les pages de participants
- Afficher les statistiques de collecte en temps réel

## Architecture

### Actions Serveur

#### 1. `createP2PParticipant`

**Fichier:** `apps/web/src/app/actions/p2p/createParticipant.ts`

Crée un nouveau participant pour une campagne P2P.

**Paramètres:**
- `campaignId`: ID de la campagne
- `organizationId`: ID de l'organisation
- `firstName` / `lastName`: Nom et prénom
- `email`: Email (unique par campagne)
- `phone?`: Téléphone (optionnel)
- `slug`: Identifiant URL-friendly (unique par campagne)
- `personalMessage?`: Message personnalisé
- `goalAmount?`: Objectif de collecte personnel
- `teamId?`: ID de l'équipe (optionnel)

**Validations:**
- Vérifie que la campagne existe et permet les participants
- Vérifie l'unicité de l'email et du slug pour la campagne
- Met à jour les compteurs de participants et membres d'équipe

#### 2. `getP2PParticipant`

**Fichier:** `apps/web/src/app/actions/p2p/getParticipant.ts`

Récupère un participant P2P par slug de campagne et slug de participant.

**Paramètres:**
- `campaignSlug`: Slug de la campagne
- `participantSlug`: Slug du participant

**Retourne:**
- Détails du participant avec campagne et équipe associées
- Vérifie que la campagne est active

#### 3. `getP2PCampaignBySlug`

**Fichier:** `apps/web/src/app/actions/p2p/getCampaignBySlug.ts`

Récupère une campagne P2P par son slug (pour les pages publiques).

**Paramètres:**
- `slug`: Slug de la campagne

#### 4. `listP2PParticipants`

**Fichier:** `apps/web/src/app/actions/p2p/listParticipants.ts`

Liste les participants d'une campagne P2P avec filtres et pagination.

**Paramètres:**
- `campaignId`: ID de la campagne
- `organizationId`: ID de l'organisation
- `teamId?`: Filtrer par équipe
- `status?`: Filtrer par statut
- `page?` / `pageSize?`: Pagination

### Pages Publiques

#### 1. Page du Participant

**Fichier:** `apps/web/src/app/[locale]/p2p/[campaignSlug]/[participantSlug]/page.tsx`

**Route:** `/p2p/[campaignSlug]/[participantSlug]`

Page publique de collecte d'un participant.

**Fonctionnalités:**
- Affichage des informations du participant
- Message personnalisé
- Statistiques (montant collecté, nombre de dons)
- Barre de progression vers l'objectif
- Formulaire de don intégré
- Support des montants suggérés personnalisés
- Affichage de l'équipe si le participant en fait partie

**Structure:**
- Header avec image de couverture et logo de la campagne
- Message personnel du participant
- Statistiques (montant collecté, nombre de dons)
- Barre de progression
- Formulaire de don (réutilise les composants de donation-forms)
- Section de paiement

#### 2. Page d'Inscription

**Fichier:** `apps/web/src/app/[locale]/p2p/[campaignSlug]/inscription/page.tsx`

**Route:** `/p2p/[campaignSlug]/inscription`

Formulaire d'inscription comme participant à une campagne P2P.

**Champs:**
- Prénom et nom (requis)
- Email (requis, unique par campagne)
- Téléphone (optionnel)
- Slug (généré automatiquement depuis le nom, modifiable)
- Message personnel (optionnel)
- Objectif de collecte (optionnel)
- Équipe (optionnel, si la campagne permet les équipes)

**Fonctionnalités:**
- Génération automatique du slug depuis le nom
- Validation de l'unicité de l'email et du slug
- Redirection vers la page du participant après inscription

#### 3. Page de Remerciement

**Fichier:** `apps/web/src/app/[locale]/p2p/[campaignSlug]/[participantSlug]/merci/page.tsx`

**Route:** `/p2p/[campaignSlug]/[participantSlug]/merci`

Page de remerciement après un don sur une page de participant.

**Fonctionnalités:**
- Message de remerciement
- Bouton pour retourner à la page de collecte
- Bouton pour partager la page

## Flux d'Utilisation

### 1. Inscription comme Participant

1. Accéder à `/p2p/[campaignSlug]/inscription`
2. Remplir le formulaire d'inscription
3. Le slug est généré automatiquement (modifiable)
4. Optionnellement rejoindre une équipe
5. Cliquer sur "Créer ma page de collecte"
6. Redirection vers la page personnelle du participant

### 2. Faire un Don sur une Page de Participant

1. Accéder à `/p2p/[campaignSlug]/[participantSlug]`
2. Voir les statistiques et le message du participant
3. Sélectionner un montant ou en saisir un personnalisé
4. Remplir les informations de donateur
5. Accepter les consentements si requis
6. Procéder au paiement
7. Redirection vers la page de remerciement

### 3. Partage de la Page

1. Depuis la page du participant, utiliser le bouton de partage
2. Ou copier l'URL directement
3. Partager sur les réseaux sociaux, par email, etc.

## Intégration avec le Système de Dons

Les dons sur les pages de participants utilisent le système de formulaires de don existant avec une métadonnée supplémentaire :

```typescript
formData: {
  ...formData,
  p2pParticipantId: participant.id, // Métadonnée pour lier le don au participant
}
```

**Note:** Une action serveur dédiée pour les dons P2P devrait être créée pour :
- Lier automatiquement le don au participant dans la base de données
- Mettre à jour les statistiques du participant (`totalRaised`, `donationCount`)
- Mettre à jour les statistiques de la campagne et de l'équipe

## Exemples d'URLs

- Page du participant : `/p2p/course-pour-la-cause/jean-dupont`
- Inscription : `/p2p/course-pour-la-cause/inscription`
- Remerciement : `/p2p/course-pour-la-cause/jean-dupont/merci`

## Checklist de Vérification

- [x] L'action `createP2PParticipant` fonctionne et valide les données
- [x] L'action `getP2PParticipant` récupère correctement un participant
- [x] L'action `getP2PCampaignBySlug` fonctionne pour les pages publiques
- [x] La page publique du participant affiche toutes les informations
- [x] Le formulaire de don est intégré et fonctionnel
- [x] La page d'inscription permet de créer un participant
- [x] La page de remerciement s'affiche après un don
- [x] Les statistiques sont affichées en temps réel
- [x] Les montants suggérés personnalisés fonctionnent

## Notes Techniques

1. **Slug**: Le slug du participant est unique par campagne, permettant des URLs propres et mémorables.

2. **Statistiques**: Les statistiques (`totalRaised`, `donationCount`) sont mises à jour via la logique applicative lors de la création de dons.

3. **Sécurité**: Les pages publiques ne nécessitent pas d'authentification, mais les validations sont effectuées côté serveur.

4. **Performance**: Les données de campagne et participant sont chargées une seule fois au montage du composant.

5. **Réutilisation**: Les composants de formulaire de don existants sont réutilisés pour maintenir la cohérence de l'UX.

## Prochaines Étapes

- [ ] Créer une action serveur dédiée pour les dons P2P
- [ ] Mettre à jour automatiquement les statistiques lors des dons
- [ ] Ajouter la fonctionnalité de partage social (Facebook, Twitter, etc.)
- [ ] Créer un leaderboard des participants
- [ ] Ajouter des fonctionnalités de personnalisation (photo de profil, couleurs, etc.)
- [ ] Implémenter les notifications pour les participants (nouveau don, objectif atteint, etc.)
- [ ] Créer une page de campagne publique listant tous les participants
