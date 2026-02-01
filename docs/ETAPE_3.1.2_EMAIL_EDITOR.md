# Instructions Détaillées pour Cursor - Étape 3.1.2

**Phase:** 3 - Marketing & Communications  
**Étape:** 3.1 - Module Campagnes Email  
**Fonctionnalité:** 3.1.2 - Éditeur d'Emails (Drag & Drop)  
**Prérequis:** Étape 3.1.1 complétée

---

## Contexte

Nous créons un éditeur d'emails visuel de type "drag & drop" pour permettre aux utilisateurs de créer des templates d'emails responsive sans écrire de code. Cet éditeur est une fonctionnalité clé du module marketing.

**Référence cahier des charges:** Section 8.2 - Éditeur d'Emails Intuitif

---

## 1. Page de l'Éditeur d'Emails

**Créer:** `/apps/web/src/app/[locale]/dashboard/marketing/templates/[id]/edit/page.tsx`

### Structure de la Page

Layout en 3 colonnes :

**Colonne gauche : Blocs**
- Liste des blocs disponibles (Texte, Image, Bouton, Séparateur, Colonnes)
- Clic pour ajouter un bloc à la zone de travail

**Colonne centrale : Zone de travail**
- La surface où l'email est construit
- Drag & drop pour réordonner les blocs
- Sélection des blocs pour les éditer

**Colonne droite : Inspecteur**
- Affiche les propriétés du bloc sélectionné (contenu, couleur, police, etc.)
- Permet de modifier les propriétés
- Intégration Unsplash pour la recherche d'images (si `UNSPLASH_ACCESS_KEY` configuré)

### Fonctionnalités

- **Drag & drop** des blocs (réordonnancement avec @hello-pangea/dnd)
- **Édition en ligne** du texte et des propriétés via l’inspecteur
- **Recherche d’images** via l’API Unsplash (`/api/unsplash/search`)
- **Preview** Desktop / Mobile (boutons dans l’en-tête)
- **Sauvegarde automatique** (débounce 5 s)
- **Export en HTML** (modal avec copier)

---

## 2. Composants Réutilisables

- **EmailEditor** - Le composant principal de l’éditeur (3 colonnes)
- **BlockPalette** - La liste des blocs à gauche (boutons pour ajouter)
- **Workspace** - La zone de travail centrale (DragDropContext, réordonnancement)
- **InspectorPanel** - Le panneau de propriétés à droite
- **BlockRenderer** - Rendu d’un bloc dans le workspace
- **blocksToHtml** - Génération HTML à partir des blocs

---

## 3. Dépendances NPM

- `@hello-pangea/dnd` - Éditeur drag & drop (fork maintenu de react-beautiful-dnd)
- `unsplash-js` - Client Unsplash pour la recherche d’images (API route)

Variable d’environnement optionnelle : `UNSPLASH_ACCESS_KEY` (côté serveur pour `/api/unsplash/search`).

---

## 4. Vérifications Importantes

- ✅ L’éditeur drag & drop fonctionne (réordonnancement des blocs)
- ✅ La modification des propriétés des blocs fonctionne (inspecteur)
- ✅ La preview Desktop/Mobile et l’export HTML sont disponibles
- ✅ La sauvegarde automatique et l’export HTML fonctionnent

---

## 5. Prochaine Étape

Une fois cette étape complétée, Manus préparera les instructions pour **3.1.3 - Interface de Gestion des Campagnes**.
