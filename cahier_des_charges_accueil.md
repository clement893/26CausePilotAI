# Cahier des Charges : Refonte de la Page d'Accueil

## 1. Objectif Général

L'objectif est de remplacer la page d'accueil actuelle de l'application, située à l'adresse `https://modeleweb-production-32de.up.railway.app/fr`, par une nouvelle page d'accueil "DEMO" qui s'inspire fidèlement du design, du contenu et de l'expérience utilisateur du site vitrine officiel de CausePilot : `https://causepilot.ai/en`.

La nouvelle page doit servir de vitrine professionnelle et moderne pour la plateforme, en abandonnant le style de template générique actuel pour adopter une identité visuelle forte et cohérente avec la marque CausePilot.

## 2. Principes Directeurs

| Principe | Description |
| :--- | :--- |
| **Cohérence Visuelle** | Adopter intégralement la charte graphique du site `causepilot.ai/en` : palette de couleurs (bleu, blanc, gris foncé), typographie, espacements, et style des icônes. |
| **Simplicité et Clarté** | Le contenu doit être concis, en anglais, et centré sur la proposition de valeur principale, en éliminant les sections superflues de la page actuelle. |
| **Expérience Utilisateur** | Créer une navigation fluide et intuitive, avec des appels à l'action (CTA) clairs et bien positionnés. |
| **Modularité Technique** | La nouvelle page sera construite en utilisant des composants React réutilisables pour chaque section, facilitant la maintenance et l'évolutivité. |

## 3. Structure de la Nouvelle Page d'Accueil

La nouvelle page d'accueil sera une réplique fonctionnelle et stylistique de `https://causepilot.ai/en`. Elle sera composée des sections suivantes, à recréer en tant que composants React indépendants :

| Section | Description du Contenu et des Fonctionnalités |
| :--- | :--- |
| **En-tête (Header)** | - Logo CausePilot AI à gauche.<br>- Liens de navigation : `Features`, `Product Tour`, `Solutions`, `Pricing`, `About Us`, `Blog`, `Investors`.<br>- Bouton de changement de langue (FR/EN).<br>- Bouton pour basculer entre le thème clair et sombre.<br>- Bouton CTA principal : `Get Started`. |
| **Section "Hero"** | - Titre : "AI Fundraising Software for Modern Nonprofits".<br>- Sous-titre présentant la plateforme.<br>- Bouton CTA : `Join our Beta Testers`.<br>- Image de fond ou visuel du produit (dashboard). |
| **Section "Features"** | - Titre : "Powerful Features".<br>- Grille de 6 cartes présentant les fonctionnalités clés : `AI Copilot`, `Donor Management`, `Automated Campaigns`, `Smart Donation Forms`, `Impact Analytics`, `Secure & Compliant`. Chaque carte contiendra une icône, un titre et une brève description. |
| **Section "Interactive Demo"** | - Titre : "Experience the Magic".<br>- Un module interactif simple permettant de voir une transformation de texte par l'IA (peut être simulé en statique dans un premier temps). |
| **Section "Philosophy"** | - Titre : "Augmenting Humans, Not Replacing Them.".<br>- Un court paragraphe sur la vision de l'IA de CausePilot. |
| **Section "Newsletter"** | - Titre : "Stay Ahead of the Curve".<br>- Un champ de saisie pour l'email et un bouton d'abonnement. |
| **Pied de page (Footer)** | - Logo et slogan.<br>- Liens de navigation organisés en colonnes : `Product`, `Company`, `Legal`.<br>- Mention de copyright. |

## 4. Recommandations Techniques

### Fichiers à Créer et Modifier

- **Fichier principal de la page :**
  - Le contenu de `/home/ubuntu/26CausePilotAI/apps/web/src/app/[locale]/page.tsx` sera entièrement remplacé pour orchestrer l'affichage des nouvelles sections.

- **Nouveaux composants de section :**
  - Créer un dossier `/home/ubuntu/26CausePilotAI/apps/web/src/components/sections/home/` pour héberger les nouveaux composants.
  - `Header.tsx`
  - `Hero.tsx`
  - `Features.tsx`
  - `InteractiveDemo.tsx`
  - `Philosophy.tsx`
  - `Newsletter.tsx`
  - `Footer.tsx`

### Style et Intégration

- **Styling :** Utiliser **Tailwind CSS** pour styliser tous les composants, en respectant scrupuleusement le design du site de référence.
- **Composants UI :** Utiliser les composants de base existants dans `/home/ubuntu/26CausePilotAI/apps/web/src/components/ui/` (boutons, cartes, etc.) et les adapter si nécessaire.
- **Internationalisation (i18n) :** Le contenu sera en anglais. Les textes seront gérés via le système d'internationalisation en place (`next-intl`).
- **Responsive Design :** Assurer une présentation optimale sur toutes les tailles d'écran (mobile, tablette, bureau).

## 5. Livrables

Le livrable final sera un ensemble de recommandations claires et de spécifications techniques que l'utilisateur pourra transmettre à un développeur (via l'outil Cursor) pour l'implémentation. **Aucun code ne sera directement modifié ou poussé sur le dépôt par l'agent.**

Le document final inclura :

1.  La structure des nouveaux fichiers et composants à créer.
2.  Le contenu textuel (en anglais) pour chaque section.
3.  Des instructions précises sur le style à appliquer, basées sur l'analyse du site de référence.
