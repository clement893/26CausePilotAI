# Étape 6.2.2 : Tableau de bord Ambassadeur P2P

**Date:** 1er février 2026

## Contexte

Cette étape implémente le tableau de bord ambassadeur pour les participants P2P, leur permettant de gérer leur page de collecte, voir leurs statistiques et partager leur page.

**Référence:** Module P2P - Tableau de bord ambassadeur

## Objectifs

- Créer un tableau de bord pour les participants P2P
- Afficher les statistiques de collecte en temps réel
- Permettre le partage de la page de collecte
- Afficher l'historique des dons
- Fournir des outils marketing pour les participants

## Architecture

### Actions Serveur

#### 1. `getP2PParticipantStats`

**Fichier:** `apps/web/src/app/actions/p2p/getParticipantStats.ts`

Récupère les statistiques complètes d'un participant P2P pour le tableau de bord.

**Paramètres:**
- `participantId`: ID du participant
- `organizationId`: ID de l'organisation

**Retourne:**
- Informations du participant
- Informations de la campagne
- Informations de l'équipe (si applicable)
- Progression vers l'objectif
- Dons récents
- Tendances des dons
- Top donateurs
- Statistiques de partage

#### 2. `getP2PParticipantByEmail`

**Fichier:** `apps/web/src/app/actions/p2p/getParticipantByEmail.ts`

Récupère tous les participants P2P associés à un email (pour permettre à un utilisateur de voir toutes ses pages de collecte).

**Paramètres:**
- `email`: Email de l'utilisateur
- `campaignId?`: Filtrer par campagne (optionnel)
- `organizationId?`: Filtrer par organisation (optionnel)

**Retourne:**
- Liste des participants avec leurs campagnes

### Pages

#### Tableau de bord Ambassadeur

**Fichier:** `apps/web/src/app/[locale]/dashboard/p2p/ambassadeur/page.tsx`

**Route:** `/dashboard/p2p/ambassadeur`

Page principale du tableau de bord pour les participants P2P.

**Fonctionnalités:**
- Détection automatique de l'utilisateur connecté
- Liste de toutes les pages de collecte de l'utilisateur
- Sélection d'une page de collecte (si plusieurs)
- Affichage des statistiques détaillées
- Outils de partage

### Composants

#### `P2PParticipantDashboard`

**Fichier:** `apps/web/src/components/p2p/P2PParticipantDashboard.tsx`

Composant principal affichant le tableau de bord d'un participant.

**Sections:**
1. **En-tête avec actions rapides**
   - Nom du participant
   - Nom de la campagne
   - Bouton pour voir la page publique
   - Bouton de partage
   - Barre de progression vers l'objectif

2. **Statistiques principales**
   - Montant collecté
   - Nombre de dons
   - Objectif (si défini)
   - Jours restants (si date de fin définie)

3. **Informations de l'équipe** (si applicable)
   - Nom de l'équipe
   - Montant collecté par l'équipe
   - Nombre de membres

4. **Outils de partage**
   - URL de la page (copiable)
   - Boutons de partage (email, partage natif)
   - Lien direct vers la page publique

5. **Dons récents**
   - Liste des derniers dons reçus
   - Nom du donateur (si non anonyme)
   - Montant
   - Message du donateur (si fourni)
   - Date du don

6. **Tendances des dons** (si données disponibles)
   - Graphique des dons par période
   - Montant et nombre de dons par jour/semaine

## Flux d'Utilisation

### 1. Accès au Tableau de bord

1. L'utilisateur se connecte avec son compte
2. Accède à `/dashboard/p2p/ambassadeur`
3. Le système récupère automatiquement tous les participants associés à son email
4. Si plusieurs participants, un sélecteur permet de choisir lequel afficher

### 2. Visualisation des Statistiques

1. Le tableau de bord affiche automatiquement les statistiques du participant sélectionné
2. Les statistiques incluent :
   - Montant collecté vs objectif
   - Nombre de dons reçus
   - Progression en pourcentage
   - Jours restants (si applicable)
   - Informations de l'équipe (si membre d'une équipe)

### 3. Partage de la Page

1. L'utilisateur clique sur "Partager"
2. Plusieurs options disponibles :
   - Copier le lien dans le presse-papier
   - Partager par email
   - Utiliser l'API de partage native du navigateur
3. Le lien peut être partagé sur les réseaux sociaux, par email, SMS, etc.

### 4. Consultation de l'Historique

1. La section "Dons récents" affiche les derniers dons reçus
2. Chaque don affiche :
   - Nom du donateur (ou "Donateur anonyme")
   - Montant
   - Message (si fourni)
   - Date

## Intégration avec le Système de Dons

**Note importante:** Pour que les statistiques de dons soient complètes, il faut :

1. **Lier les dons aux participants** : Lors de la création d'un don sur une page de participant, le système doit enregistrer le `participantId` dans les métadonnées du don.

2. **Mettre à jour les statistiques** : Les statistiques (`totalRaised`, `donationCount`) doivent être mises à jour automatiquement lors de la création/completion d'un don.

3. **Récupérer les dons** : L'action `getP2PParticipantStats` doit interroger la table des dons pour récupérer les dons associés au participant.

## Exemples d'URLs

- Tableau de bord : `/dashboard/p2p/ambassadeur`

## Checklist de Vérification

- [x] L'action `getP2PParticipantStats` fonctionne et retourne les statistiques
- [x] L'action `getP2PParticipantByEmail` récupère tous les participants d'un utilisateur
- [x] La page du tableau de bord détecte automatiquement l'utilisateur connecté
- [x] Le sélecteur de participant fonctionne (si plusieurs participants)
- [x] Les statistiques sont affichées correctement
- [x] La barre de progression fonctionne
- [x] Les outils de partage fonctionnent
- [x] L'historique des dons s'affiche (quand disponible)
- [x] Les informations de l'équipe s'affichent (si applicable)

## Notes Techniques

1. **Authentification**: Le tableau de bord nécessite une authentification. Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion.

2. **Multi-participants**: Un utilisateur peut avoir plusieurs pages de collecte (dans différentes campagnes). Le tableau de bord permet de sélectionner laquelle afficher.

3. **Statistiques en temps réel**: Les statistiques sont recalculées à chaque chargement de la page. Pour des performances optimales, on pourrait implémenter un système de cache ou de mise à jour en temps réel.

4. **Partage**: Le système utilise l'API Web Share si disponible, avec un fallback vers la copie dans le presse-papier.

5. **Données manquantes**: Certaines données (comme les dons récents, les tendances) nécessitent une intégration complète avec le système de dons. Pour l'instant, ces sections sont préparées mais peuvent être vides.

## Prochaines Étapes

- [ ] Intégrer complètement avec le système de dons pour récupérer les dons réels
- [ ] Créer une table de tracking des partages pour les statistiques de partage
- [ ] Ajouter des graphiques plus détaillés (tendances, comparaisons)
- [ ] Implémenter des notifications pour les nouveaux dons
- [ ] Ajouter des outils marketing avancés (templates d'emails, messages pré-rédigés)
- [ ] Créer un système de badges/récompenses pour les participants
- [ ] Ajouter des comparaisons avec d'autres participants ou équipes
- [ ] Implémenter un système de goals personnalisés (étapes intermédiaires)
