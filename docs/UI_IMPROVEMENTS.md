# Améliorations UI – Plan d'action

Proposition d’évolutions pour rendre l’interface moins plate et plus moderne, tout en restant cohérente avec le thème et l’accessibilité.

---

## 1. **Profondeur et ombres**

| Élément | Actuel | Proposition |
|--------|--------|-------------|
| **Cards** | `shadow-sm`, hover léger | `shadow-md` par défaut, `shadow-lg` + légère translation au hover (`-translate-y-0.5`) |
| **Buttons** | Transition basique | Légère `scale(1.02)` au hover, ombre plus marquée sur primary |
| **Modals / Dropdowns** | Ombre simple | `shadow-2xl`, `backdrop-blur-sm` sur l’overlay |
| **Sidebar** | Fond uni | Légère bordure droite ou ombre portée pour la séparer du contenu |

**Implémenté :** Cards avec `rounded-xl`, `shadow-md`, hover lift + `shadow-lg`. **Button** : `hover:scale-[1.02]`, `active:scale-[0.98]`, `disabled:scale-100`. **Modal** : overlay `backdrop-blur-sm`, panel `shadow-2xl`, `md:rounded-xl`. **Sidebar** : ombre portée à droite (`shadow-[4px_0_16px...]`).

---

## 2. **Micro-interactions et animations**

| Élément | Proposition |
|--------|-------------|
| **Listes (donateurs, segments, etc.)** | Apparition en stagger : `animation-delay` progressif sur chaque item (`.stagger-1`, `.stagger-2`, …) |
| **Boutons** | `transition-all duration-200`, `hover:scale-[1.02]`, `active:scale-[0.98]` |
| **Cards cliquables** | Hover : léger lift, bordure primary/20, `transition-all duration-300` |
| **Chargement** | Skeleton avec léger pulse au lieu d’un spinner seul |
| **Navigation** | Item actif : fond subtle + bordure gauche colorée (déjà partiel dans la sidebar) |

**Implémenté :** Utilitaire `.stagger-fade-in` + délais dans `globals.css`. Cards hover amélioré. **Loading** : `LoadingSkeleton` (card, stats) sur donateurs (liste + détail), segments, campagnes ; header + grille de skeletons au lieu de « Chargement... ».

---

## 3. **Typographie**

| Élément | Proposition |
|--------|-------------|
| **Titres de page** | `text-3xl` / `text-4xl`, `font-bold`, `tracking-tight`, gradient optionnel (`bg-gradient-to-r` + `bg-clip-text`) |
| **Sous-titres** | `text-muted-foreground`, `text-lg` |
| **Hiérarchie** | Espacement clair entre sections (`space-y-8` ou `gap-8`) |
| **Corps** | `text-base` (16px) pour la lisibilité |

---

## 4. **Couleur et contraste**

| Élément | Proposition |
|--------|-------------|
| **En-têtes de section** | Petit gradient ou accent (icône dans un `rounded-lg` coloré) |
| **Cards “feature”** | Bordure gauche colorée (`border-l-4 border-l-primary`) ou fond `from-primary/5 to-transparent` |
| **Badges** | Variants plus marqués (success, warning, info) avec fond et texte contrastés |
| **Zones d’action** | CTAs avec `shadow-lg` et hover plus visible |

---

## 5. **Layout et espacement**

| Élément | Actuel | Proposition |
|--------|--------|-------------|
| **Container** | `px-4 sm:px-6 lg:px-8` | Garder ou légèrement augmenter (`xl:px-12`) pour plus de respiration |
| **Grilles** | `gap-4` | `gap-6` ou `gap-8` sur les grilles de cards |
| **Sections** | Variable | `mb-8` ou `mb-10` entre blocs majeurs |
| **Main (dashboard)** | Fond `background` | Fond légèrement différencié : `bg-muted/20` ou `bg-muted/30` |

**Implémenté :** Main du dashboard avec `bg-muted/20` pour distinguer du contenu.

---

## 6. **Composants**

| Composant | Proposition |
|-----------|-------------|
| **Input** | `focus:ring-2 focus:ring-primary/20`, `transition-shadow duration-200`, bordures `rounded-lg` |
| **Card** | Variant optionnel `elevated` : `shadow-lg` par défaut, `rounded-2xl` |
| **Sidebar** | Item actif : `bg-primary/10` + `border-l-2 border-primary`, `font-medium` |
| **Empty states** | Illustration ou icône large, texte centré, CTA mis en avant |

**Implémenté :** **Input** : `focus:ring-primary/20` / `focus:ring-error-500/20`, `focus:ring-offset-2`. **Textarea**, **Select** : idem. **Checkbox** : `focus:ring-primary/20` / `focus:ring-error-500/20`, `focus:ring-offset-0`, `rounded`, `transition-all duration-200`. **Container** : `xl:px-12`, `2xl:px-14`. **Empty states** (donateurs, segments, campagnes, tags) : icône dans `rounded-2xl bg-primary/10`, titre + sous-titre, CTA primary avec `shadow-lg hover:shadow-xl`.

---

## 7. **Tendances “moderne”**

| Pratique | Application |
|----------|-------------|
| **Coins plus arrondis** | Cards `rounded-xl` (12px), modals `rounded-2xl` |
| **Backdrop blur** | Overlays modals, tooltips, dropdowns (`backdrop-blur-sm`) |
| **Dégradés discrets** | Headers de page, boutons primary (déjà en place sur donateurs) |
| **Dark mode** | Vérifier contrastes, ombres et bordures en dark |

---

## 8. **Résumé des changements déjà appliqués**

1. **`Card`** : `rounded-xl`, `shadow-md`, hover avec lift + `shadow-lg`, `transition-all duration-300`.
2. **`globals.css`** : utilitaires `.card-hover-lift`, `.stagger-fade-in` avec délais (`.stagger-delay-1` … `.stagger-delay-6`).
3. **Dashboard layout** : zone main avec `bg-muted/20` pour un fond légèrement différencié.
4. **Sidebar** : item actif avec `border-l-2 border-l-primary`, `bg-primary/10`, `transition-all duration-200`.
5. **Page Donateurs** : grille `gap-6`, animation `stagger-fade-in` sur les cards, délais progressifs.
6. **Pages Segments & Campagnes** : en-têtes unifiés (icône, gradient), stagger sur les grilles, `Card` elevated sur empty states, `text-muted-foreground` / `bg-muted`.
7. **Card** : variant `elevated` (`rounded-2xl`, `shadow-lg`, `hover:shadow-xl`).
8. **Input** : `focus:ring-primary/20` ou `focus:ring-error-500/20`, `focus:ring-offset-2`.
9. **Textarea** : focus ring aligné sur Input, `rounded-lg`, `transition-all duration-200`.
10. **Select** : focus ring aligné sur Input/Textarea, `rounded-lg`, `transition-all duration-200`.
11. **Container** : `xl:px-12`, `2xl:px-14`.
12. **Empty states** (donateurs, segments, campagnes, tags) : icône `rounded-2xl bg-primary/10`, titre, sous-titre, CTA primary `shadow-lg`.
13. **Page Tags** : en-tête unifié (icône Tag, gradient), LoadingSkeleton, Card no-org. **TagManager** : skeleton, stagger, empty state unifié, libellés FR.
14. **Dashboard principal** : stagger sur la grille « Key Features » (6 cards), `h-full` sur les cards.
15. **Checkbox** : focus ring `primary/20` / `error-500/20`, `rounded`, `transition-all duration-200`.
16. **SettingsNavigation** : grille `gap-6`, stagger sur les cards, suppression `{' '}` inutiles.

---

## 9. **Prochaines étapes suggérées**

1. ~~Appliquer `stagger-fade-in` aux listes (donateurs, segments, etc.).~~ ✅ Fait (donateurs, segments, campagnes).
2. ~~Renforcer le style des items actifs dans la Sidebar.~~ ✅ Fait.
3. ~~Ajouter un variant `elevated` au composant Card.~~ ✅ Fait (`elevated` → `rounded-2xl`, `shadow-lg`, `hover:shadow-xl`).
4. ~~Uniformiser les en-têtes de page (gradient, icône, espacement).~~ ✅ Fait (donateurs, segments, campagnes).
5. Audit accessibilité (focus, contraste) après ces changements.
6. ~~Loading skeleton sur pages clés~~ ✅ Donateurs (liste + détail), segments, campagnes.
7. ~~Input focus, Container padding, Empty states~~ ✅ Input ring/offset, Container xl:px-12 2xl:px-14, empty states unifiés.
8. ~~Textarea focus, Page Tags~~ ✅ Textarea focus ring, Tags header + skeleton + TagManager (stagger, empty state, FR).
9. ~~Select focus, Dashboard Key Features stagger~~ ✅ Select focus ring, Dashboard grille Key Features avec stagger.
10. ~~Checkbox focus, SettingsNavigation stagger~~ ✅ Checkbox focus ring + transition, Settings navigation gap-6 + stagger.

---

*Document généré pour guider les évolutions UI. À adapter selon les retours design et produit.*
