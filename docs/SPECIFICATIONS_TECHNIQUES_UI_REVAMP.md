# Spécifications Techniques - Revamp UI des Composants

**Projet :** 26CausePilotAI  
**Date :** 1er février 2026  
**Auteur :** Manus AI  
**Objectif :** Fournir des instructions techniques détaillées pour la modernisation des composants React et l'implémentation des nouvelles pages DÉMO.

## 1. Contexte Technique

Ce document est le complément technique du `CAHIER_DES_CHARGES_UI_REVAMP.md`. Il contient des exemples de code, des classes Tailwind CSS, et des modifications d'API de composants nécessaires pour réaliser la vision design.

- **Stack :** React 19, Next.js 16, TypeScript, Tailwind CSS.
- **Fichiers Cibles :** Les composants situés dans `/apps/web/src/components/ui/`.
- **Convention :** Toutes les modifications doivent être faites de manière à maximiser la réutilisabilité et à ne pas introduire de "breaking changes" si possible.

---

## 2. Modifications du Système de Thème (`tokens.ts`)

Avant de modifier les composants, le fichier de tokens de thème doit être mis à jour pour inclure la nouvelle palette de couleurs et les nouveaux effets.

**Fichier à modifier :** `/apps/web/src/lib/theme/tokens.ts` (ou fichier équivalent)

Ajouter les variables CSS suivantes à la configuration du thème Tailwind ou dans un fichier CSS global.

```css
:root {
  /* Palette Dark UI */
  --background-primary: #0A0A0F;
  --background-secondary: #13131A;
  --background-tertiary: #1C1C26;
  --background-elevated: #252532;

  --text-primary: #FFFFFF;
  --text-secondary: #A0A0B0;
  --text-tertiary: #6B6B7B;

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
  --gradient-success: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
  --gradient-warning: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  --gradient-accent: linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%);

  /* Couleurs Sémantiques */
  --color-primary: #667EEA;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Ombres Glow */
  --shadow-primary-glow: 0 0 20px rgba(102, 126, 234, 0.4);
}
```

---

## 3. Spécifications Techniques par Composant

### 3.1. Composant `Button`

**Fichier à modifier :** `/apps/web/src/components/ui/Button.tsx`

#### 3.1.1. Ajout de la variante `gradient`

Il faut ajouter une nouvelle variante `gradient` à l'objet `variants` du composant.

```typescript
// Dans Button.tsx, ajouter à l'objet `variants`

const variants = {
  // ... autres variantes
  gradient: [
    'text-white',
    'bg-gradient-to-r from-primary-500 to-secondary-500',
    'hover:from-primary-600 hover:to-secondary-600',
    'focus:ring-primary-500',
  ].join(' '),
};
```

Il faudra également mettre à jour le type `ButtonVariant` pour inclure `'gradient'`. 

```typescript
// Dans ./types.ts ou directement dans Button.tsx
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'gradient';
```

#### 3.1.2. Amélioration des états `hover`, `focus`, `active`

Modifier les `baseStyles` pour intégrer les nouvelles micro-interactions.

```typescript
// Dans Button.tsx, mettre à jour `baseStyles`

const baseStyles = [
  'font-medium',
  'rounded-lg',
  'transition-all',
  'duration-200',
  'transform',
  'hover:scale-[1.03]', // Effet de zoom au survol
  'active:scale-[0.97]', // Effet de pression au clic
  'disabled:scale-100',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-offset-2',
  'focus:ring-offset-background-primary', // Assurer le contraste du ring
  'disabled:opacity-50',
  'disabled:cursor-not-allowed',
].join(' ');
```

Pour l'état `focus` avec "glow", on peut utiliser une classe utilitaire si elle est définie dans le CSS global, ou l'appliquer via le `ring`.

```typescript
// Exemple pour la variante `primary`
primary: createVariantStyles(
  // ...
  ['focus:ring-primary-500', 'focus:ring-opacity-50', 'dark:focus:ring-primary-400'],
  // ...
),
```

### 3.2. Composant `Card`

**Fichier à modifier :** `/apps/web/src/components/ui/Card.tsx`

#### 3.2.1. Ajout de la variante `glass`

Ajouter une nouvelle prop `variant` au composant `Card` pour gérer les différentes apparences.

```typescript
// Mettre à jour CardProps
export interface CardProps extends ... {
  variant?: 'default' | 'glass' | 'gradient-border';
}

// Dans le composant Card
const cardClasses = clsx(
  'rounded-lg',
  'shadow-md',
  'bg-background-secondary',
  {
    // ...
    'glass-effect': variant === 'glass',
    'p-0': variant === 'gradient-border',
  },
  className
);
```

Il faudra définir la classe `.glass-effect` dans un fichier CSS global.

```css
/* Dans un fichier CSS global, e.g., app.css */
.glass-effect {
  background: rgba(28, 28, 38, 0.6); /* --background-tertiary à 60% */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### 3.2.2. Ajout de la variante `gradient-border`

Cette variante nécessite une structure HTML imbriquée pour que le gradient de la bordure ne soit pas affecté par le fond de la carte.

```tsx
// Dans le rendu du composant Card
if (variant === 'gradient-border') {
  return (
    <div className={clsx('rounded-lg p-[1px]', 'bg-gradient-to-r from-accent-500 to-primary-500', className)}>
      <div className="bg-background-secondary rounded-[7px] p-6">
        {children}
      </div>
    </div>
  );
}
```

### 3.3. Composants de Formulaire (`Input`, `Select`, etc.)

**Fichiers à modifier :** `/apps/web/src/components/ui/Input.tsx`, etc.

L'effet de bordure `focus` avec gradient est complexe à réaliser uniquement avec Tailwind. Une approche consiste à utiliser des pseudo-éléments.

```css
/* Dans un fichier CSS global */
.form-input-glow {
  position: relative;
  background-clip: padding-box; /* Important */
  border: 1px solid transparent;
}

.form-input-glow:focus-within {
  border-color: transparent;
}

.form-input-glow::before {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: -1;
  margin: -1px; /* Épaisseur de la bordure */
  border-radius: inherit; /* Suivre le radius du parent */
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 200ms ease-in-out;
}

.form-input-glow:focus-within::before {
  opacity: 1;
}
```

Ensuite, appliquer la classe `.form-input-glow` au conteneur du champ de formulaire et s'assurer que le champ lui-même a un fond opaque (`bg-background-secondary`).

---

### 3.4. Composant `Progress`

**Fichier à modifier :** `/apps/web/src/components/ui/Progress.tsx`

L'objectif est de rendre la barre de progression plus dynamique en utilisant un fond de gradient animé.

```tsx
// Dans le composant Progress

// Le conteneur de la barre de progression
<div className="w-full bg-background-tertiary rounded-full h-2.5">
  // La barre de progression elle-même
  <div
    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2.5 rounded-full animate-pulse"
    style={{ width: `${value}%` }}
  ></div>
</div>
```

L'utilisation de `animate-pulse` peut donner un effet de chargement subtil. Pour une animation de remplissage, des techniques CSS plus avancées (transitions sur la largeur) sont nécessaires et doivent être assurées.

### 3.5. Composant `Alert`

**Fichier à modifier :** `/apps/web/src/components/ui/Alert.tsx`

L'alerte doit être modernisée avec une bordure latérale colorée et une icône.

```tsx
// Dans le composant Alert, adapter la structure

const alertClasses = clsx(
  'p-4 rounded-lg flex items-start',
  'bg-background-secondary',
  'border-l-4',
  {
    'border-primary-500': variant === 'info',
    'border-green-500': variant === 'success',
    'border-yellow-500': variant === 'warning',
    'border-red-500': variant === 'error',
  }
);

return (
  <div className={alertClasses} role="alert">
    <IconComponent className="h-5 w-5 mr-3" /> // Icone dynamique selon la variante
    <div>
      <h3 className="font-medium text-text-primary">{title}</h3>
      <div className="text-sm text-text-secondary">{children}</div>
    </div>
  </div>
);
```

### 3.6. Composant `Modal`

**Fichier à modifier :** `/apps/web/src/components/ui/Modal.tsx`

Le modal doit utiliser un fond `glassmorphism` et des animations fluides. Cela se fait souvent au niveau du composant qui gère l'overlay (e.g., Radix UI, Headless UI).

```tsx
// En supposant l'utilisation d'une bibliothèque comme Headless UI

<Transition.Root show={isOpen} as={Fragment}>
  <Dialog as="div" className="relative z-50" onClose={onClose}>
    {/* Backdrop */}
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" />
    </Transition.Child>

    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="relative transform overflow-hidden rounded-lg glass-effect p-6 shadow-xl transition-all">
            {/* Contenu du Modal */}
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-text-primary">
              {title}
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-text-secondary">{children}</p>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition.Root>
```

---

## 4. Création des Nouvelles Pages DÉMO

Pour chaque nouvelle page DÉMO, créer un nouveau fichier dans `/apps/web/src/app/[locale]/`. Par exemple, pour la page `Components Showcase` :

**Fichier à créer :** `/apps/web/src/app/[locale]/democomponents/page.tsx`

```tsx
// Exemple de structure pour /democomponents/page.tsx

import { Button, Card, Input, ... } from '@/components/ui';

export default function DemoComponentsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Components Showcase</h1>

      {/* Section Buttons */}
      <section id="buttons" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Primary Button">
            <Button variant="primary">Click me</Button>
          </Card>
          <Card title="Gradient Button">
            <Button variant="gradient">Click me</Button>
          </Card>
          {/* ... autres variantes de boutons ... */}
        </div>
      </section>

      {/* Section Forms */}
      <section id="forms" className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
        {/* ... composants de formulaire ... */}
      </section>

      {/* ... autres sections ... */}
    </div>
  );
}
```

Cette structure doit être répétée pour les autres pages DÉMO, en utilisant les spécifications du Cahier des Charges pour construire le contenu de chaque page avec les composants modernisés.

---
