# Étape 6.2.3 : Leaderboard P2P

**Date:** 1er février 2026

## Contexte

Cette étape implémente le leaderboard (classement) pour les campagnes P2P, permettant d'afficher le classement des participants et équipes selon le montant collecté.

**Référence:** Module P2P - Leaderboard

## Objectifs

- Créer un système de classement pour les participants P2P
- Créer un système de classement pour les équipes P2P
- Afficher le leaderboard sur une page publique
- Permettre de filtrer par participants ou équipes
- Afficher les statistiques de chaque participant/équipe

## Architecture

### Actions Serveur

#### `getP2PLeaderboard`

**Fichier:** `apps/web/src/app/actions/p2p/getLeaderboard.ts`

Récupère le classement des participants et/ou équipes d'une campagne P2P.

**Paramètres:**
- `campaignSlug`: Slug de la campagne
- `type?`: Type de classement ('participants', 'teams', ou 'both')
- `limit?`: Nombre maximum d'entrées à retourner (défaut: 100)
- `organizationId?`: ID de l'organisation (pour validation)

**Retourne:**
- Informations de la campagne
- Liste des participants classés par montant collecté (décroissant)
- Liste des équipes classées par montant collecté (décroissant)

**Données retournées pour chaque participant:**
- Rang (position dans le classement)
- ID, nom, prénom, slug
- Montant collecté
- Nombre de dons
- Objectif (si défini)
- Pourcentage de progression
- Équipe (si membre d'une équipe)
- Photo de profil (si disponible)

**Données retournées pour chaque équipe:**
- Rang (position dans le classement)
- ID, nom, slug
- Montant collecté
- Nombre de membres
- Nombre de dons
- Objectif (si défini)
- Pourcentage de progression

### Pages Publiques

#### Page du Leaderboard

**Fichier:** `apps/web/src/app/[locale]/p2p/[campaignSlug]/leaderboard/page.tsx`

**Route:** `/p2p/[campaignSlug]/leaderboard`

Page publique affichant le classement des participants et équipes.

**Fonctionnalités:**
- Affichage du classement des participants
- Affichage du classement des équipes (si la campagne les permet)
- Onglets pour basculer entre participants et équipes
- Icônes de classement (trophée pour 1er, médaille pour 2e, etc.)
- Barres de progression vers l'objectif
- Liens vers les pages individuelles des participants/équipes
- Statistiques détaillées (montant collecté, nombre de dons, membres)

**Design:**
- Classement visuel avec icônes pour les 3 premiers
- Cartes pour chaque participant/équipe avec statistiques
- Barres de progression pour visualiser l'avancement vers l'objectif
- Design responsive et moderne

## Flux d'Utilisation

### 1. Accès au Leaderboard

1. Accéder à `/p2p/[campaignSlug]/leaderboard`
2. Le système charge automatiquement le classement de la campagne
3. Si la campagne permet les équipes, deux onglets sont disponibles

### 2. Visualisation du Classement

1. Par défaut, l'onglet "Participants" ou "Équipes" est sélectionné selon la disponibilité
2. Les participants/équipes sont classés par montant collecté (décroissant)
3. Les 3 premiers ont des icônes spéciales (trophée, médaille, award)
4. Chaque entrée affiche :
   - Le rang
   - Le nom
   - Le montant collecté
   - Le nombre de dons
   - La progression vers l'objectif (si défini)
   - Un bouton pour voir la page complète

### 3. Navigation

1. Cliquer sur "Voir la page" pour accéder à la page du participant
2. Cliquer sur "Voir l'équipe" pour accéder à la page de l'équipe
3. Basculer entre les onglets pour voir les différents classements

## Exemples d'URLs

- Leaderboard : `/p2p/course-pour-la-cause/leaderboard`
- Page participant : `/p2p/course-pour-la-cause/jean-dupont`
- Page équipe : `/p2p/course-pour-la-cause/equipe/les-coureurs`

## Checklist de Vérification

- [x] L'action `getP2PLeaderboard` fonctionne et retourne les classements
- [x] Le classement est trié par montant collecté (décroissant)
- [x] Les participants sont correctement classés
- [x] Les équipes sont correctement classées (si applicable)
- [x] La page du leaderboard s'affiche correctement
- [x] Les onglets fonctionnent (participants/équipes)
- [x] Les icônes de classement s'affichent pour les 3 premiers
- [x] Les barres de progression fonctionnent
- [x] Les liens vers les pages individuelles fonctionnent
- [x] Le design est responsive

## Notes Techniques

1. **Tri**: Le classement est basé sur le montant collecté (`totalRaised`) en ordre décroissant. En cas d'égalité, l'ordre peut être basé sur la date de création ou le nombre de dons.

2. **Performance**: Pour les grandes campagnes, on limite le nombre de résultats (par défaut 100). On pourrait ajouter la pagination si nécessaire.

3. **Statut**: Seuls les participants/équipes actifs sont affichés dans le leaderboard.

4. **Calcul du rang**: Le rang est calculé côté serveur lors de la récupération des données, en fonction de l'ordre de tri.

5. **Mise à jour en temps réel**: Le leaderboard est mis à jour à chaque chargement de la page. Pour une mise à jour en temps réel, on pourrait utiliser WebSockets ou polling.

## Prochaines Étapes

- [ ] Ajouter la pagination pour les grandes campagnes
- [ ] Ajouter des filtres (par équipe, par objectif atteint, etc.)
- [ ] Ajouter des graphiques de progression dans le temps
- [ ] Implémenter la mise à jour en temps réel (WebSockets)
- [ ] Ajouter des badges/récompenses pour les classements
- [ ] Créer un widget de leaderboard à intégrer dans d'autres pages
- [ ] Ajouter des statistiques supplémentaires (moyenne par donateur, etc.)
- [ ] Implémenter un système de classement par période (quotidien, hebdomadaire, mensuel)
