# Instructions Détaillées - 4.1.1 : Dashboard Principal

**Date:** 1er février 2026

---

## Contexte

Dashboard central qui agrège les KPIs de tous les modules. Page d'accueil du dashboard, personnalisable (drag & drop de widgets).

**Référence cahier des charges:** Section 11.1 - Dashboard Principal

---

## Livrables

### 1. Modèle Prisma

- **`DashboardLayout`** : `id`, `userId` (unique), `user` (relation User), `layout` (Json), `createdAt`, `updatedAt`. Table `dashboard_layouts`.

### 2. Page

- **`/app/[locale]/dashboard/page.tsx`** : Page principale du dashboard (utilise `DashboardMainContent`).

### 3. Composants

- **`DashboardGrid`** : Grille réactive (react-grid-layout), drag & drop, sauvegarde du layout.
- **`Widget`** : Base pour tous les widgets (header optionnel + contenu, poignée de drag).
- **`KPIWidget`** : KPI avec valeur, tendance, sparkline optionnel.
- **`ChartWidget`** : Graphique (bar, line, pie) avec filtres optionnels.
- **`RecentActivityWidget`** : Liste des dernières activités (dons, etc.) avec liens.

### 4. Actions Serveur

- **`getDashboardData(organizationId)`** : KPIs (donateurs, total dons, dons du mois, nouveaux), activité récente, données graphique (dons par mois).
- **`getDashboardLayoutAction(userId)`** : Récupère le layout sauvegardé (ou défaut).
- **`saveDashboardLayoutAction(userId, layout)`** : Sauvegarde la disposition des widgets.

### 5. Dépendance

- **`react-grid-layout`** : Grille drag & drop (styles importés dans `DashboardGrid.tsx`).

---

## Fichiers créés / modifiés

- `packages/database/prisma/schema.prisma` : modèle `DashboardLayout` + relation `User.dashboardLayout`.
- `apps/web/src/components/dashboard/` : `Widget`, `KPIWidget`, `ChartWidget`, `RecentActivityWidget`, `DashboardGrid`, `index.ts`.
- `apps/web/src/app/actions/dashboard/` : `getDashboardData.ts`, `getDashboardLayout.ts`, `saveDashboardLayout.ts`.
- `apps/web/src/app/[locale]/dashboard/` : `DashboardMainContent.tsx`, `page.tsx` (remplacé par la vue grille).
- `apps/web/package.json` : dépendance `react-grid-layout`.

---

## Vérifications

- [x] Le dashboard s'affiche avec des données (KPIs, graphique, activité).
- [x] Les widgets peuvent être déplacés et redimensionnés (mode « Modifier la disposition »).
- [x] La disposition est sauvegardée et restaurée par utilisateur (via `DashboardLayout`).
- [ ] Responsive / mobile à valider manuellement.

---

## Note

L’identifiant utilisateur pour le layout (`userId`) provient du store d’auth (`useAuthStore().user.id`). Si l’auth utilise un backend externe, s’assurer que cet id correspond à `User.id` en base pour que la sauvegarde du layout fonctionne.
