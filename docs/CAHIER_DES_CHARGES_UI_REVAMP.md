# Cahier des Charges - Revamp UI Complet

**Projet :** 26CausePilotAI  
**Date :** 1er février 2026  
**Auteur :** Manus AI  
**Statut :** En cours de rédaction

## 1. Introduction et Objectifs

Ce document détaille les spécifications techniques et fonctionnelles pour la création de **quatre pages DÉMO** destinées à guider un revamp complet de l'interface utilisateur (UI) de la plateforme 26CausePilotAI. L'objectif est de moderniser l'ensemble des composants et de l'expérience utilisateur en s'alignant sur les standards de design contemporains, tels que définis dans le document de stratégie `UI_REVAMP_STRATEGY.md`.

Ce cahier des charges s'adresse à l'outil d'implémentation (Cursor) et doit être suivi rigoureusement pour garantir la cohérence et la qualité du résultat final. Toutes les implémentations doivent utiliser la stack technique existante (Next.js, TypeScript, Tailwind CSS) et s'appuyer sur la structure de composants actuelle.

### 1.1. Pages DÉMO à Créer

1.  **Components Showcase (`/democomponents`)**: Un catalogue interactif de tous les composants UI de base, modernisés selon la nouvelle direction artistique.
2.  **Dashboard Analytics (`/demodashboard-v2`)**: Un tableau de bord analytique complet, mettant en œuvre les nouveaux composants de visualisation de données.
3.  **Data Tables Advanced (`/demodatatable`)**: Une page dédiée aux tables de données complexes, démontrant les fonctionnalités avancées de recherche, filtrage et interaction.
4.  **Forms & Workflows (`/demoforms`)**: Une page présentant des formulaires complexes et des workflows multi-étapes, avec une validation et une ergonomie améliorées.

### 1.2. Rappel de la Direction Artistique

- **Thème :** Dark UI premium et sophistiqué.
- **Couleurs :** Palette de noirs/gris profonds avec des accents de gradients vibrants (bleu/violet, vert/cyan, orange/rose).
- **Effets Visuels :** Utilisation subtile du glassmorphism (background-blur), d'ombres colorées (glow), et de bordures néon.
- **Interactions :** Micro-interactions fluides et significatives (hover, focus, active) avec des animations de 60fps.
- **Layout :** Espacement généreux, grilles équilibrées, et forte hiérarchie visuelle.

---

## 2. Spécifications de la Page DÉMO 1 : Components Showcase (`/democomponents`)

**Objectif :** Créer une page unique qui sert de catalogue visuel et interactif pour tous les composants UI de base modernisés. Chaque composant doit être présenté avec ses différentes variantes, états et options, conformément à la nouvelle direction artistique.

### 2.1. Structure de la Page

- **Layout Principal :** Une grille responsive (`grid`) qui s'adapte à la taille de l'écran.
- **Sidebar de Navigation :** Une sidebar fixe à gauche avec des liens de navigation (`<a>`) qui scrollent vers les sections correspondantes de la page.
- **Sections de Composants :** La page sera divisée en sections logiques, chacune dédiée à une catégorie de composants (e.g., "Buttons", "Form Elements", "Cards").
- **Titres de Section :** Chaque section doit commencer par un titre clair (e.g., `<h2>Buttons & Actions</h2>`) avec un style distinctif.
- **Conteneurs de Composants :** Dans chaque section, les composants seront présentés dans des conteneurs individuels (`Card` ou `div`) avec un titre décrivant la variante (e.g., "Primary Button", "Button with Icon").

### 2.2. Spécifications par Catégorie de Composants

#### 2.2.1. Buttons & Actions

- **`Button`**
  - **Variantes à présenter :** `primary`, `secondary`, `outline`, `ghost`, `link`.
  - **Nouvelle variante `gradient` :** Créer une variante `gradient` qui utilise le `--gradient-primary`.
  - **États à démontrer :** `default`, `hover`, `focus`, `active`, `disabled`, `loading`.
  - **Améliorations Visuelles :**
    - `hover`: Effet de scale `hover:scale-[1.03]` et légère augmentation de la luminosité du background ou du gradient.
    - `focus`: Ombre "glow" subtile (`shadow-primary-glow`) et `ring` visible.
    - `active`: Effet de scale `active:scale-[0.97]`.
    - `loading`: Le spinner doit remplacer l'icône (si présente) et le texte doit rester visible.
  - **Options à montrer :** Avec icône (gauche/droite), icône seule (bouton carré/rond), pleine largeur (`fullWidth`).

#### 2.2.2. Form Elements

- **`Input`, `Textarea`, `Select`**
  - **Améliorations Visuelles :**
    - **Background :** Utiliser `--background-secondary`.
    - **Bordure :** Bordure par défaut subtile (`border-gray-700`).
    - **État `focus` :** La bordure doit s'animer pour devenir un gradient fin (`--gradient-primary`) ou une couleur néon brillante (`--color-primary`). L'effet doit être une transition douce.
    - **Labels :** Implémenter des labels flottants qui se déplacent de l'intérieur du champ vers le haut lors du focus ou du remplissage.
  - **Variantes à présenter :** `default`, `with icon`, `with validation` (success/error), `disabled`.

- **`Checkbox`, `Radio`**
  - **Améliorations Visuelles :**
    - Remplacer les éléments natifs par des versions stylisées.
    - `checked`: L'arrière-plan doit être le `--color-primary` avec une icône de coche blanche.
    - `focus`: Ajouter un `ring` visible autour du contrôle.

- **`Switch`**
  - **Améliorations Visuelles :**
    - `on`: L'arrière-plan doit être le `--gradient-primary`.
    - `off`: L'arrière-plan doit être `--background-tertiary`.
    - Le "thumb" (cercle) doit avoir une animation de transition fluide.

#### 2.2.3. Cards & Containers

- **`Card`**
  - **Variante `default` :** Background `--background-secondary`, `rounded-lg`, ombre subtile `--shadow-md`.
  - **Nouvelle variante `glass` :** Implémenter l'effet de glassmorphism (`.glass-effect`). Le fond de la page doit avoir une image ou un motif pour rendre l'effet visible.
  - **Nouvelle variante `gradient-border` :** La carte doit avoir une bordure de 1px qui est un gradient (`--gradient-accent`). L'arrière-plan de la carte reste `--background-secondary`.
  - **Effet `hover` :** Sur les cartes cliquables, ajouter une légère élévation (`transform: translateY(-4px)`) et potentiellement un "glow" subtil sur les bordures.

#### 2.2.4. Badges & Labels

- **`Badge`**
  - **Variantes de couleur :** Présenter les badges pour chaque couleur sémantique (`success`, `warning`, `error`, `info`, `primary`).
  - **Nouvelle variante `gradient` :** Créer une variante qui utilise un des gradients (`--gradient-success`, etc.).
  - **Nouvelle variante `outline` :** Badge avec fond transparent et bordure colorée.
  - **Options à montrer :** Avec icône, avec un point lumineux ("dot indicator").

#### 2.2.5. Overlays

- **`Modal`, `Drawer`**
  - **Améliorations Visuelles :**
    - **Backdrop :** Le fond doit avoir un effet de `backdrop-blur` pour un look glassmorphism.
    - **Animations :** L'apparition et la disparition doivent être fluides (e.g., `fade-in` et `scale-up` pour le modal, `slide-in-from-right` pour le drawer).
    - **Background :** Le fond du modal/drawer doit être `--background-elevated` ou utiliser l'effet `.glass-effect`.

- **`Tooltip`, `Popover`, `Dropdown`**
  - **Améliorations Visuelles :**
    - Utiliser le background `--background-elevated` avec une ombre `--shadow-lg`.
    - Animations d'ouverture/fermeture rapides et subtiles.

### 2.3. Données Mock

- Tout le contenu textuel (titres, paragraphes, labels) doit être réaliste et en anglais.
- Utiliser des icônes de la bibliothèque `lucide-react` partout où c'est pertinent.

---

## 3. Spécifications de la Page DÉMO 2 : Dashboard Analytics (`/demodashboard-v2`)

**Objectif :** Construire un tableau de bord analytique visuellement riche et moderne, qui démontre l'utilisation des composants de visualisation de données (graphiques, statistiques) et des cartes modernisées.

### 3.1. Structure de la Page

- **Layout Principal :** Un layout de type dashboard avec une sidebar de navigation à gauche (peut être simulée ou réutilisée si elle existe) et une zone de contenu principale.
- **Grille Responsive :** Le contenu principal sera organisé en une grille CSS responsive (`grid`) avec plusieurs cellules de tailles différentes.
- **Header de Page :** Un en-tête en haut de la zone de contenu incluant :
  - Un titre de page, e.g., `<h1>Dashboard</h1>`.
  - Un sélecteur de période (`Dropdown` ou `Tabs`) avec les options : "24h", "7d", "30d", "90d", "1y".
  - Un bouton d'action principal, e.g., `<Button variant="gradient">+ Add Widget</Button>`.

### 3.2. Spécifications des Widgets du Dashboard

Le dashboard sera composé de plusieurs widgets, chacun contenu dans une `Card` modernisée.

#### 3.2.1. KPI Cards (Cartes de Métriques Clés)

- **Quantité :** Une ligne de 4 cartes en haut de la page.
- **Structure par Carte :**
  - Icône colorée dans un cercle (`--background-tertiary` avec une icône utilisant une couleur sémantique, e.g., `--color-primary`).
  - Titre de la métrique (e.g., "Total Revenue").
  - Valeur principale de la métrique (grande police, `font-bold`).
  - Indicateur de tendance (e.g., `+23.5%`) avec une icône flèche (`ArrowUp` ou `ArrowDown`) et une couleur sémantique (`text-green-500` ou `text-red-500`).
- **Style :** Utiliser la variante `glass` ou `gradient-border` pour ces cartes pour leur donner de l'importance.

#### 3.2.2. Revenue Chart (Graphique de Revenus)

- **Widget Principal :** Occupera une grande partie de la largeur (e.g., 2/3 de la grille).
- **Type de Graphique :** Un graphique en aires (`Area Chart`) ou en lignes (`Line Chart`).
- **Données :** Simuler une série temporelle sur 12 mois.
- **Améliorations Visuelles :**
  - **Gradient :** La zone sous la ligne doit être remplie avec un gradient vertical allant de `--color-primary` (en haut) à transparent (en bas).
  - **Ligne :** La ligne elle-même doit être d'une couleur vive (`--color-primary`).
  - **Tooltip :** Le tooltip au survol doit être stylisé (fond `glass`, typographie claire).
  - **Points :** Les points de données sur la ligne doivent avoir un effet de `hover` qui les agrandit.
- **Bibliothèque :** Utiliser `Recharts` ou `Chart.js` pour l'implémentation.

#### 3.2.3. Donut Chart (Graphique de Distribution)

- **Widget Secondaire :** Occupera une plus petite partie de la largeur (e.g., 1/3 de la grille).
- **Type de Graphique :** Un graphique en anneau (`Donut Chart`).
- **Données :** Simuler la distribution des donateurs par segment (e.g., "Major Donors", "Regular Donors", "New Donors").
- **Améliorations Visuelles :**
  - **Couleurs :** Utiliser les couleurs sémantiques (`--color-primary`, `--color-secondary`, `--color-info`, etc.) pour les segments.
  - **Centre :** Afficher la valeur totale au centre de l'anneau.
  - **Légende :** Une légende personnalisée et stylisée doit être affichée sous le graphique.

#### 3.2.4. Campaign Performance (Performance des Campagnes)

- **Type de Widget :** Une liste d'éléments dans une `Card`.
- **Structure par Élément :**
  - Titre de la campagne.
  - Une barre de progression (`Progress`) modernisée.
  - Texte indiquant la progression (e.g., "$45,200 / $50,000 (90.4%)").
- **Améliorations Visuelles de la `Progress` bar :**
  - L'arrière-plan de la barre doit être un gradient animé (`--gradient-success`).

#### 3.2.5. Recent Activity (Activité Récente)

- **Type de Widget :** Une `Timeline` modernisée dans une `Card`.
- **Structure par Élément de Timeline :**
  - Une icône dans un cercle pour représenter le type d'événement (e.g., nouvelle donation, nouveau donateur).
  - Un texte décrivant l'événement (e.g., "New donation of $500 from Sarah J.").
  - Un timestamp (e.g., "10 minutes ago").
- **Améliorations Visuelles de la `Timeline` :**
  - La ligne de connexion verticale doit être subtile (`border-gray-700`).
  - Les points sur la timeline doivent utiliser des couleurs sémantiques.

### 3.3. Données Mock

- Créer des données mock réalistes pour toutes les métriques et graphiques.
- Les noms, montants et dates doivent être variés pour donner vie au dashboard.

---

## 4. Spécifications de la Page DÉMO 3 : Data Tables Advanced (`/demodatatable`)

**Objectif :** Implémenter une page dédiée à la démonstration d'un composant `DataTable` hautement interactif et modernisé, intégrant des fonctionnalités avancées de recherche, de filtrage et de manipulation de données.

### 4.1. Structure de la Page

- **Layout Principal :** Une page pleine largeur centrée sur la table de données.
- **Header de Page :**
  - Titre de la page, e.g., `<h1>Donors Management</h1>`.
  - Un champ de recherche global (`SearchBar`) stylisé.
  - Un ensemble de filtres principaux (e.g., `Dropdown` pour les segments, `DatePicker` pour la plage de dates).
  - Un bouton pour les filtres avancés qui ouvre un `Drawer` ou un `Modal`.
  - Un bouton d'export (`ExportButton`) et un bouton d'action principal (e.g., "+ Add Donor").

### 4.2. Spécifications du Composant `DataTable`

Le composant `DataTable` existant doit être amélioré ou encapsulé pour inclure les fonctionnalités suivantes, en utilisant la nouvelle direction artistique.

- **Améliorations Visuelles :**
  - **Header de Table :** Le `<thead>` doit être "sticky" (rester visible lors du scroll vertical) et avoir un fond `--background-tertiary`.
  - **Lignes (`<tr>`) :**
    - Ajouter un effet de `hover` subtil (e.g., `background-color: --background-tertiary`).
    - Les lignes sélectionnées doivent avoir un fond distinctif (e.g., `background-color: rgba(var(--color-primary-rgb), 0.1)`).
    - Utiliser des bordures fines (`border-gray-800`) pour séparer les lignes.
  - **Cellules (`<td>`) :** Assurer un padding vertical et horizontal cohérent pour une bonne lisibilité.
  - **Pagination :** Les contrôles de pagination doivent utiliser les `Button` modernisés (variante `outline` ou `ghost`).

- **Fonctionnalités à Implémenter :**
  - **Recherche Globale :** Le `SearchBar` doit filtrer l'ensemble des données de la table en temps réel.
  - **Filtres par Colonne :** Ajouter des `Dropdown` ou `Input` dans les en-têtes de colonne pour un filtrage spécifique.
  - **Tri par Colonne :** Cliquer sur un en-tête de colonne doit trier les données (ascendant/descendant), avec un indicateur visuel (icône flèche).
  - **Sélection Multiple :** Ajouter une colonne de `Checkbox` pour permettre la sélection de plusieurs lignes.
  - **Actions en Vrac (Bulk Actions) :** Lorsqu'au moins une ligne est sélectionnée, une barre d'actions doit apparaître en haut ou en bas de la table (e.g., "Delete Selected", "Export Selected").
  - **Menu d'Actions par Ligne :** Chaque ligne doit avoir une colonne "Actions" avec un `Dropdown` (menu kebab) proposant des actions comme "View", "Edit", "Delete".

### 4.3. Contenu des Colonnes

La table doit présenter des données de donateurs riches et variées.

- **`Donor` :** `Avatar` modernisé + Nom + Email.
- **`Segment` :** `Badge` modernisé (e.g., "Major Donor", "New Donor").
- **`Total Donations` :** Montant formaté.
- **`Last Donation` :** Date formatée.
- **`Engagement Score` :** Une mini `Progress` bar ou un `Chart` radial.
- **`Status` :** Un `Badge` avec un point lumineux (`dot`).

### 4.4. Données Mock

- Générer une liste d'au moins 20-30 donateurs mock avec des données diversifiées pour permettre de tester la pagination, la recherche et le filtrage de manière réaliste.

---

## 5. Spécifications de la Page DÉMO 4 : Forms & Workflows (`/demoforms`)

**Objectif :** Présenter une collection de formulaires modernes et de workflows multi-étapes, mettant en avant une ergonomie supérieure, une validation en temps réel et l'utilisation des nouveaux styles de champs de formulaire.

### 5.1. Structure de la Page

- **Layout Principal :** Une grille à deux colonnes pour présenter différents types de formulaires côte à côte ou verticalement.
- **Sections :** Diviser la page en sections claires : "Multi-Step Campaign Wizard", "Advanced Profile Form", et "File Upload Showcase".

### 5.2. Spécifications des Formulaires

#### 5.2.1. Multi-Step Campaign Wizard (Assistant de Création de Campagne)

- **Composant Principal :** Utiliser le composant `Stepper` modernisé pour guider l'utilisateur à travers 4 étapes.
- **Améliorations du `Stepper` :**
  - L'étape active doit être mise en évidence avec la couleur `--color-primary` ou un gradient.
  - Les étapes complétées doivent afficher une icône de coche.
  - Les lignes de connexion entre les étapes doivent être stylisées.
- **Étapes du Formulaire :**
  1.  **`Campaign Details` :** Champs `Input` pour le nom de la campagne, `Textarea` pour la description.
  2.  **`Goals & Duration` :** Champs `Input` avec préfixe "$" pour l'objectif financier, `DatePicker` pour les dates de début et de fin.
  3.  **`Media & Content` :** Un composant `FileUpload` modernisé et un `RichTextEditor`.
  4.  **`Review & Launch` :** Un résumé de toutes les informations saisies (en lecture seule) et un bouton `<Button variant="gradient">Launch Campaign</Button>`.
- **Navigation :** Des boutons "Next Step" et "Previous Step" doivent permettre de naviguer entre les étapes. La validation doit être effectuée avant de passer à l'étape suivante.

#### 5.2.2. Advanced Profile Form (Formulaire de Profil Avancé)

- **Objectif :** Démontrer l'utilisation de tous les types de champs de formulaire modernisés dans un contexte réaliste.
- **Layout du Formulaire :** Une `Card` avec une grille à deux colonnes pour les champs.
- **Champs à Inclure :**
  - `Input` (pour le nom, l'email, le téléphone).
  - `Select` (pour le pays).
  - `Autocomplete` (pour les compétences).
  - `MultiSelect` (pour les centres d'intérêt).
  - `Switch` (pour les notifications par email).
  - `Radio` Group (pour le niveau d'expérience).
  - `Textarea` (pour la biographie).
- **Validation :** Mettre en œuvre une validation en temps réel avec des messages d'erreur clairs et des styles visuels (bordure rouge `error`).

#### 5.2.3. File Upload Showcase

- **Composant :** Utiliser `FileUploadWithPreview`.
- **Améliorations Visuelles :**
  - La zone de "drag and drop" doit être grande et visuellement engageante, avec une bordure pointillée qui devient solide et colorée (`--color-primary`) lors du survol d'un fichier.
  - La liste des fichiers uploadés doit montrer une miniature, le nom du fichier, la taille, et une barre de progression de l'upload.
  - Des actions pour "Supprimer" ou "Voir" le fichier doivent être présentes.

### 5.3. Données Mock

- Pré-remplir certains champs pour montrer l'apparence des formulaires avec des données.
- Les options pour les `Select`, `Autocomplete`, etc., doivent être fournies via des listes mock.

---

## 6. Exigences Techniques et Qualité

### 6.1. Stack Technique

- **Framework :** Next.js 16+
- **Langage :** TypeScript (mode `strict`)
- **Styling :** Tailwind CSS (aucune autre bibliothèque CSS autorisée)
- **Icônes :** Lucide React
- **Bibliothèques de Graphiques :** `Recharts` ou `Chart.js` sont autorisées pour la page `/demodashboard-v2`.

### 6.2. Qualité du Code

- **Réutilisabilité :** Les améliorations doivent être apportées directement aux composants existants dans `/apps/web/src/components/ui/` ou, si nécessaire, en créant de nouveaux composants hautement réutilisables.
- **Lisibilité :** Le code doit être propre, bien commenté (JSDoc) et suivre les conventions de nommage du projet.
- **Performance :** Éviter les re-renders inutiles. Utiliser `React.memo`, `useCallback`, `useMemo` lorsque c'est pertinent. Les animations doivent être performantes (privilégier `transform` et `opacity`).

### 6.3. Accessibilité (WCAG 2.1 AA)

- **Sémantique :** Utiliser des balises HTML sémantiques (`<nav>`, `<main>`, `<h1>`, etc.).
- **ARIA :** Ajouter les attributs ARIA nécessaires, en particulier pour les composants interactifs complexes.
- **Clavier :** Tous les éléments interactifs doivent être accessibles et utilisables via le clavier.
- **Focus :** Les états de focus doivent être clairement visibles et suivre un ordre logique.
- **Contrastes :** Respecter les ratios de contraste des couleurs définis dans la stratégie.

### 6.4. Responsive Design

- Toutes les pages et tous les composants doivent être parfaitement responsives, du mobile au grand écran de bureau.
- Utiliser l'approche "mobile-first" avec les breakpoints de Tailwind CSS.

## 7. Livrables

- **Quatre nouvelles pages DÉMO** fonctionnelles et stylisées, accessibles aux URLs spécifiées (`/democomponents`, `/demodashboard-v2`, `/demodatatable`, `/demoforms`).
- **Mise à jour des composants UI** dans le répertoire `/apps/web/src/components/ui/` avec les nouveaux styles et variantes.
- **Aucune donnée réelle ou appel API.** Toutes les données doivent être des mocks statiques définis directement dans les fichiers des pages ou dans un fichier de données mock séparé.

---
