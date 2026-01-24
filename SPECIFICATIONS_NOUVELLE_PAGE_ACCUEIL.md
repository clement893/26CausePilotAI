# Spécifications Techniques : Nouvelle Page d'Accueil CausePilot

**Auteur :** Manus AI  
**Date :** 24 janvier 2026  
**Projet :** 26CausePilotAI  
**Objectif :** Remplacer la page d'accueil actuelle par une version inspirée du site vitrine officiel

## Vue d'Ensemble

Ce document présente les spécifications techniques complètes pour la refonte de la page d'accueil de la plateforme CausePilot. L'objectif est de remplacer la page actuelle, qui présente un style de template générique, par une page d'accueil professionnelle et moderne qui reflète fidèlement l'identité visuelle et l'expérience utilisateur du site vitrine officiel disponible à l'adresse `https://causepilot.ai/en`.

La nouvelle page servira de vitrine principale pour la plateforme, en mettant l'accent sur la simplicité, la clarté et une proposition de valeur centrée sur l'intelligence artificielle appliquée au fundraising pour les organisations à but non lucratif.

## Analyse Comparative

### Page Actuelle vs. Site Vitrine

Le tableau suivant présente une comparaison détaillée entre la page actuelle et le site vitrine de référence :

| Aspect | Page Actuelle | Site Vitrine (Référence) |
|:-------|:--------------|:-------------------------|
| **Langue** | Français | Anglais |
| **Style Visuel** | Template générique avec fond vert foncé et orange | Design moderne, épuré avec bleu, blanc et gris |
| **Complexité** | Nombreuses sections détaillées (8+ sections) | Sections ciblées et concises (6 sections principales) |
| **Message Principal** | "Transformez votre collecte de fonds" | "AI Fundraising Software for Modern Nonprofits" |
| **Approche CTA** | Multiples boutons "Démarrer gratuitement" | Bouton principal "Join our Beta Testers" |
| **Fonctionnalités** | 6 cartes détaillées avec listes à puces | 6 cartes simples avec icônes colorées |
| **Témoignages** | 3 témoignages avec photos | Non visible dans la première vue |
| **Démonstration** | Absente | Section interactive "Experience the Magic" |

## Architecture des Composants

### Structure des Fichiers

La nouvelle page d'accueil sera construite selon une architecture modulaire, avec des composants React réutilisables. Voici la structure des fichiers à créer ou modifier :

```
apps/web/src/
├── app/
│   └── [locale]/
│       └── page.tsx                    [À REMPLACER ENTIÈREMENT]
└── components/
    ├── sections/
    │   └── home/                       [NOUVEAU DOSSIER]
    │       ├── HomeHeader.tsx          [NOUVEAU]
    │       ├── HomeHero.tsx            [NOUVEAU]
    │       ├── HomeFeatures.tsx        [NOUVEAU]
    │       ├── HomeDemo.tsx            [NOUVEAU]
    │       ├── HomePhilosophy.tsx      [NOUVEAU]
    │       └── HomeNewsletter.tsx      [NOUVEAU]
    └── ui/
        └── [composants existants à réutiliser]
```

### Composants à Créer

Chaque section de la nouvelle page sera implémentée comme un composant React indépendant, facilitant la maintenance et les tests. Les composants suivants devront être créés dans le dossier `/apps/web/src/components/sections/home/` :

**1. HomeHeader.tsx**

Ce composant remplacera l'en-tête actuel et contiendra la navigation principale de la page d'accueil.

**Éléments à inclure :**
- Logo CausePilot AI aligné à gauche
- Menu de navigation horizontal avec les liens : Features, Product Tour, Solutions, Pricing, About Us, Blog, Investors
- Sélecteur de langue (FR/EN) avec icône de drapeau
- Bouton de basculement du thème (clair/sombre)
- Bouton CTA "Get Started" avec style bleu proéminent

**Style Tailwind CSS :**
- Fond blanc avec ombre légère : `bg-white dark:bg-gray-900 shadow-sm`
- Navigation sticky : `sticky top-0 z-50`
- Liens avec hover : `hover:text-blue-600 transition-colors`
- Bouton CTA : `bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg`

**2. HomeHero.tsx**

La section hero est la première impression visuelle de la page. Elle doit capturer immédiatement l'attention et communiquer la proposition de valeur principale.

**Éléments à inclure :**
- Badge "New: AI Copilot for Fundraising" avec icône étoile
- Titre principal en grandes lettres : "AI Fundraising Software for Modern Nonprofits"
- Sous-titre explicatif : "Empower your organization with CausePilot AI. The all-in-one platform that combines predictive donor analytics, automated stewardship, and intelligent insights to maximize your impact."
- Indication temporelle : "Launching globally in 2027"
- Bouton CTA principal : "Join our Beta Testers"
- Badge "COMING SOON • 2027"
- Image du dashboard sur laptop (à droite ou en arrière-plan)

**Style Tailwind CSS :**
- Section pleine hauteur : `min-h-screen flex items-center`
- Fond blanc ou gris très clair : `bg-white dark:bg-gray-50`
- Titre : `text-5xl md:text-7xl font-bold text-gray-900`
- Mot "Modern Nonprofits" en bleu : `text-blue-600`
- Sous-titre : `text-xl md:text-2xl text-gray-600 max-w-3xl`
- Bouton CTA : `bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg`

**3. HomeFeatures.tsx**

Cette section présente les six fonctionnalités principales de la plateforme sous forme de grille de cartes.

**Éléments à inclure :**
- Titre de section : "Powerful Features"
- Sous-titre : "Everything you need to scale your impact"
- Description : "Replace fragmented tools with one unified platform designed for the modern nonprofit era."
- Grille de 6 cartes (2 colonnes sur mobile, 3 sur desktop)

**Contenu des 6 cartes :**

| Icône | Titre | Description |
|:------|:------|:------------|
| 🤖 Robot | AI Copilot | Leverage generative AI for nonprofits to get intelligent recommendations on when to ask, how much to ask, and who to target. |
| 👥 Personnes | Donor Management | A 360-degree view of your supporters. Track history, preferences, and engagement in one secure nonprofit CRM. |
| ⚡ Éclair | Automated Campaigns | Set up multi-channel communication flows that nurture donors automatically while you sleep. |
| ❤️ Cœur | Smart Donation Forms | Conversion-optimized forms that adapt suggested amounts based on donor history and profile. |
| 📊 Graphique | Impact Analytics | Real-time dashboards that turn complex data into actionable insights for your board and team. |
| 🛡️ Bouclier | Secure & Compliant | Enterprise-grade security with automated tax receipting and compliance built-in. |

**Style Tailwind CSS :**
- Grille responsive : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- Cartes : `bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow`
- Icônes : Utiliser des icônes colorées (orange, bleu, rouge) dans des cercles de fond clair
- Titre de carte : `text-xl font-bold text-gray-900 mb-3`
- Description : `text-gray-600 text-base leading-relaxed`

**4. HomeDemo.tsx**

Section interactive permettant de démontrer la capacité de transformation de texte par l'IA.

**Éléments à inclure :**
- Badge "Try It Yourself"
- Titre : "Experience the Magic"
- Sous-titre : "See how CausePilot AI transforms generic fundraising appeals into compelling, donor-centric messages in seconds."
- Zone de démonstration avec 3 messages prédéfinis sélectionnables
- Bouton "Enhance with AI" (peut être simulé en statique dans un premier temps)

**Messages prédéfinis :**
1. "We need money for our new program."
2. "Please donate to help us reach our goal."
3. "Our annual gala is coming up soon."

**Style Tailwind CSS :**
- Section avec fond légèrement grisé : `bg-gray-50 dark:bg-gray-900 py-24`
- Zone de démonstration : `bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto`
- Messages sélectionnables : `border-2 border-gray-200 hover:border-blue-500 rounded-lg p-4 cursor-pointer transition-colors`

**5. HomePhilosophy.tsx**

Section présentant la philosophie de CausePilot concernant l'utilisation de l'IA.

**Éléments à inclure :**
- Titre : "Meet Your New Assistant"
- Sous-titre : "Augmenting Humans, Not Replacing Them."
- Paragraphe explicatif : "We believe the future of fundraising isn't about replacing connection with automation—it's about amplifying human capacity with AI. CausePilot handles the data, the patterns, and the admin, so your fundraisers can focus on what only humans can do: building deep, meaningful relationships."
- 3 points clés avec icônes :
  - Predictive donor scoring to identify major gift potential
  - Automated content generation for campaign emails
  - Smart segmentation based on engagement behavior
- Phrase d'accroche : "Fundraising has fundamentally changed."
- Bouton CTA : "Join our Beta Testers"

**Style Tailwind CSS :**
- Section : `bg-white dark:bg-gray-800 py-24`
- Layout en deux colonnes : `grid md:grid-cols-2 gap-12 items-center`
- Points clés avec checkmarks : `flex items-start gap-3 text-gray-700`

**6. HomeNewsletter.tsx**

Section d'inscription à la newsletter, positionnée avant le footer.

**Éléments à inclure :**
- Titre : "Stay Ahead of the Curve"
- Sous-titre : "Get the latest fundraising insights delivered to your inbox."
- Description : "Join 2,000+ nonprofit leaders receiving our weekly 'Tech for Good' digest. No spam, just impact."
- Champ de saisie email avec placeholder "name@organization.org"
- Bouton "Subscribe to Newsletter"
- Mention "Unsubscribe at any time" en petit texte

**Style Tailwind CSS :**
- Section : `bg-blue-50 dark:bg-blue-900/20 py-16`
- Formulaire : `flex flex-col sm:flex-row gap-4 max-w-xl mx-auto`
- Input : `flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500`
- Bouton : `bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold`

## Palette de Couleurs

La nouvelle page adoptera la palette de couleurs du site vitrine officiel, qui se distingue par sa sobriété et son professionnalisme :

| Élément | Couleur | Code Tailwind |
|:--------|:--------|:--------------|
| **Primaire (CTA)** | Bleu vif | `blue-600` (#2563EB) |
| **Primaire Hover** | Bleu foncé | `blue-700` (#1D4ED8) |
| **Fond Principal** | Blanc | `white` (#FFFFFF) |
| **Fond Alternatif** | Gris très clair | `gray-50` (#F9FAFB) |
| **Texte Principal** | Gris foncé | `gray-900` (#111827) |
| **Texte Secondaire** | Gris moyen | `gray-600` (#4B5563) |
| **Icônes Colorées** | Orange, Bleu, Rouge | Variés selon contexte |
| **Bordures** | Gris clair | `gray-200` (#E5E7EB) |

## Typographie

Le système typographique suivra les standards modernes du web, avec une hiérarchie claire et des tailles adaptatives :

| Élément | Taille Mobile | Taille Desktop | Poids | Classe Tailwind |
|:--------|:--------------|:---------------|:------|:----------------|
| **Titre H1 (Hero)** | 3rem (48px) | 4.5rem (72px) | Bold (700) | `text-5xl md:text-7xl font-bold` |
| **Titre H2 (Sections)** | 2.25rem (36px) | 3rem (48px) | Bold (700) | `text-4xl md:text-5xl font-bold` |
| **Titre H3 (Cartes)** | 1.25rem (20px) | 1.5rem (24px) | Bold (700) | `text-xl md:text-2xl font-bold` |
| **Sous-titres** | 1.125rem (18px) | 1.25rem (20px) | Normal (400) | `text-lg md:text-xl` |
| **Corps de texte** | 1rem (16px) | 1rem (16px) | Normal (400) | `text-base` |
| **Petit texte** | 0.875rem (14px) | 0.875rem (14px) | Normal (400) | `text-sm` |

## Responsive Design

La page doit être entièrement responsive et offrir une expérience optimale sur tous les appareils. Voici les breakpoints à respecter :

| Breakpoint | Largeur | Adaptations Principales |
|:-----------|:--------|:------------------------|
| **Mobile** | < 768px | Navigation hamburger, grille 1 colonne, textes réduits |
| **Tablette** | 768px - 1024px | Grille 2 colonnes pour features, navigation horizontale |
| **Desktop** | > 1024px | Grille 3 colonnes, espacement généreux, textes pleins |

## Internationalisation

Le contenu de la nouvelle page sera en **anglais** par défaut, conformément au site vitrine de référence. Le système d'internationalisation `next-intl` déjà en place dans le projet sera utilisé pour gérer les traductions.

**Fichiers de traduction à créer/modifier :**
- `/apps/web/src/messages/en.json` : Ajouter les clés pour la nouvelle page d'accueil
- `/apps/web/src/messages/fr.json` : Ajouter les traductions françaises si nécessaire

**Structure des clés de traduction suggérée :**
```json
{
  "home": {
    "hero": {
      "badge": "New: AI Copilot for Fundraising",
      "title": "AI Fundraising Software for Modern Nonprofits",
      "subtitle": "Empower your organization with CausePilot AI...",
      "cta": "Join our Beta Testers"
    },
    "features": {
      "title": "Powerful Features",
      "subtitle": "Everything you need to scale your impact"
    }
  }
}
```

## Implémentation Technique

### Étapes d'Implémentation Recommandées

L'implémentation devra suivre une approche méthodique et progressive pour assurer la qualité et la maintenabilité du code :

**Phase 1 : Préparation**
1. Créer le dossier `/apps/web/src/components/sections/home/`
2. Créer les fichiers de traduction avec les clés nécessaires
3. Identifier et préparer les assets (images, icônes)

**Phase 2 : Création des Composants**
1. Créer `HomeHeader.tsx` avec la navigation
2. Créer `HomeHero.tsx` avec la section principale
3. Créer `HomeFeatures.tsx` avec la grille de fonctionnalités
4. Créer `HomeDemo.tsx` avec la démonstration interactive
5. Créer `HomePhilosophy.tsx` avec le message de vision
6. Créer `HomeNewsletter.tsx` avec le formulaire d'inscription

**Phase 3 : Intégration**
1. Remplacer le contenu de `/apps/web/src/app/[locale]/page.tsx`
2. Importer et orchestrer tous les nouveaux composants
3. Tester la navigation et les interactions

**Phase 4 : Tests et Ajustements**
1. Tester sur mobile, tablette et desktop
2. Vérifier l'accessibilité (WCAG AA)
3. Optimiser les performances (lazy loading, images)
4. Tester le mode sombre

### Exemple de Structure du Fichier Principal

Le fichier `/apps/web/src/app/[locale]/page.tsx` devra être restructuré pour orchestrer l'affichage des nouveaux composants :

```typescript
'use client';

import { HomeHeader } from '@/components/sections/home/HomeHeader';
import { HomeHero } from '@/components/sections/home/HomeHero';
import { HomeFeatures } from '@/components/sections/home/HomeFeatures';
import { HomeDemo } from '@/components/sections/home/HomeDemo';
import { HomePhilosophy } from '@/components/sections/home/HomePhilosophy';
import { HomeNewsletter } from '@/components/sections/home/HomeNewsletter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HomeHeader />
      <HomeHero />
      <HomeFeatures />
      <HomeDemo />
      <HomePhilosophy />
      <HomeNewsletter />
    </div>
  );
}
```

### Composants UI à Réutiliser

Le projet dispose déjà d'une bibliothèque de composants UI dans `/apps/web/src/components/ui/`. Les composants suivants pourront être réutilisés :

- **Button / ButtonLink** : Pour tous les boutons CTA
- **Card** : Pour les cartes de fonctionnalités
- **Badge** : Pour les badges "New", "Coming Soon", etc.
- **Container** : Pour centrer et limiter la largeur du contenu
- **Grid** : Pour les layouts en grille responsive

## Accessibilité

La nouvelle page doit respecter les standards d'accessibilité WCAG AA. Voici les points clés à vérifier :

| Critère | Exigence | Implémentation |
|:--------|:---------|:---------------|
| **Contraste** | Ratio minimum 4.5:1 pour le texte | Utiliser les couleurs définies dans la palette |
| **Navigation Clavier** | Tous les éléments interactifs accessibles | Ajouter `tabIndex` et gérer `onKeyDown` |
| **Textes Alternatifs** | Images avec attribut `alt` descriptif | Ajouter `alt` à toutes les images |
| **Structure Sémantique** | Utiliser les balises HTML appropriées | `<header>`, `<main>`, `<section>`, `<footer>` |
| **Focus Visible** | Indicateur de focus clair | Utiliser `focus:ring-2 focus:ring-blue-500` |

## Performance

Pour garantir une expérience utilisateur optimale, les optimisations suivantes devront être appliquées :

**Images :**
- Utiliser le composant `next/image` pour l'optimisation automatique
- Format WebP avec fallback
- Lazy loading pour les images en dessous du fold

**Code :**
- Code splitting automatique de Next.js
- Lazy loading des composants non critiques avec `React.lazy()`
- Minimiser les dépendances externes

**Métriques Cibles :**
- First Contentful Paint (FCP) : < 1.8s
- Largest Contentful Paint (LCP) : < 2.5s
- Cumulative Layout Shift (CLS) : < 0.1
- Time to Interactive (TTI) : < 3.5s

## Prochaines Étapes

Une fois ce document validé, les étapes suivantes seront :

1. **Validation du cahier des charges** par l'utilisateur
2. **Transmission des spécifications** à l'outil d'implémentation (Cursor)
3. **Développement des composants** selon les spécifications
4. **Tests et ajustements** sur environnement de développement
5. **Revue et validation** de la page complète
6. **Déploiement** sur la branche staging pour tests finaux
7. **Mise en production** après validation finale

## Conclusion

Ce document fournit toutes les spécifications techniques nécessaires pour implémenter la nouvelle page d'accueil de CausePilot. L'approche modulaire et la réutilisation des composants existants garantiront une implémentation efficace et maintenable. La nouvelle page offrira une expérience utilisateur moderne et professionnelle, alignée avec l'identité visuelle du site vitrine officiel.
