# Audit Turborepo et organisation des fichiers

**Date :** 1er février 2026  
**Périmètre :** monorepo 26CausePilotAI (Turborepo, packages, apps/web, backend, scripts, docs)

---

## 1. Vue d’ensemble

| Élément | État actuel |
|--------|-------------|
| **Workspace** | pnpm (apps/*, backend, packages/*) |
| **Orchestration** | turbo.json présent, mais racine n’utilise pas `turbo run` pour build |
| **Apps** | 1 app Next.js (`apps/web`), backend Python hors npm |
| **Packages** | 10 (analytics, auth, campaigns, core, database, donators, forms, marketing, types, ui) |
| **Code partagé** | Seul `@modele/types` est utilisé par `apps/web` ; `@modele/database` (Prisma) utilisé indirectement via `db:generate` |

---

## 2. Audit détaillé

### 2.1 Turborepo et racine

**Points positifs**
- `turbo.json` définit des tâches (build, dev, lint, type-check, test) avec `dependsOn: ["^build"]` pour build.
- `globalDependencies` et `globalEnv` sont renseignés.
- Cache distant activé (`remoteCache.enabled`).

**Problèmes**
1. **Pas de pipeline Turbo à la racine**  
   - `package.json` racine : `dev` et `build` appellent `pnpm --filter @modele/web ...` et non `turbo run build` / `turbo run dev`.  
   - Les packages ne sont jamais construits dans une commande racine (sauf si on ajoute un script explicite).  
   - Conséquence : `dependsOn: ["^build"]` ne sert pas tant que le build n’est pas lancé via Turbo.

2. **Backend dans le workspace pnpm**  
   - `pnpm-workspace.yaml` inclut `backend`.  
   - Backend = Python (FastAPI), sans dépendances npm.  
   - Inutile dans le workspace pnpm et peut prêter à confusion (pnpm install dans backend, etc.).

3. **Scripts racine nombreux et ciblés web**  
   - Beaucoup de scripts (lint, test, format, validate:env, security:*, api:*, migrate:*, audit:*, etc.) ciblent surtout le frontend.  
   - Pas de script unique du type `turbo run build` ou `turbo run lint` pour tout le monorepo.

4. **Nom du projet**  
   - `package.json` racine : `"name": "modele-nextjs-fullstack"`.  
   - Dépôt / contexte : 26CausePilotAI.  
   - Incohérence de nommage à clarifier (produit vs template).

---

### 2.2 Packages

**État par package**

| Package | Contenu | Utilisé par apps/web |
|---------|---------|------------------------|
| `@modele/types` | Types partagés (api, donor, theme, user, etc.) | Oui (seul package en dépendance) |
| `@modele/database` | Schéma Prisma uniquement | Indirect (prisma generate depuis apps/web, @prisma/client dans apps/web) |
| `@modele/analytics` | Stub (index.ts vide) | Non |
| `@modele/auth` | Stub | Non |
| `@modele/campaigns` | Stub | Non |
| `@modele/core` | Stub | Non |
| `@modele/donators` | Stub | Non |
| `@modele/forms` | Stub | Non |
| `@modele/marketing` | Stub | Non |
| `@modele/ui` | Stub (const export) | Non |

**Problèmes**
1. **Packages “fantômes”**  
   - 8 packages (analytics, auth, campaigns, core, donators, forms, marketing, ui) sont dans le repo et dans `tsconfig.base.json` mais pas dans les dépendances de `apps/web`.  
   - Risque : confusion, maintenance inutile, fausse idée de découpage.

2. **Pas de build du package database**  
   - `packages/database` n’a pas de script `build` ; seul `prisma generate` est utilisé (depuis apps/web).  
   - Pas de `dist/` ; le client Prisma est consommé via `@prisma/client` dans apps/web.  
   - À documenter clairement (database = schéma + generate, pas de bundle).

3. **tsconfig.base.json**  
   - Définit des `paths` pour tous les `@modele/*`.  
   - `apps/web/tsconfig.json` ne garde que `@modele/types`.  
   - Incohérence : la base suggère un monorepo multi-packages, l’app n’en utilise qu’un.

---

### 2.3 Apps

**apps/web**

- Une seule app front ; pas d’autre app (ex. admin, landing) dans `apps/`.

**Structure `src/`**
- `app/` : App Router (actions, routes).
- `app/[locale]/` : grande partie des routes (dashboard, admin, rapports, etc.).
- `app/` (racine) : aussi des dossiers `admin/`, `auth/`, `dashboard/`, etc. → **doublon potentiel** avec `app/[locale]/`.
- `components/` : très gros (nombreux dossiers : donators, donors, dashboard, reports, workflow, etc.).
- `lib/` : tout le “shared” (auth, api, theme, errors, utils, segmentation, etc.).
- `hooks/`, `config/`, `i18n/`, `providers/`, `services/`, `utils/`, `types/`.

**Problèmes**
1. **Doublon de routes**  
   - Routes à la racine de `app/` (ex. `app/dashboard/`, `app/admin/`) et sous `app/[locale]/` (ex. `app/[locale]/dashboard/`, `app/[locale]/admin/`).  
   - Comportement Next : `/dashboard` vs `/fr/dashboard`.  
   - À trancher : tout sous [locale], ou bien rôle précis des routes racine (redirects, legacy, SEO).

2. **Tout dans une seule app**  
   - Actions, composants, lib, hooks, types sont dans `apps/web` sans extraction vers des packages.  
   - Le doc “REORGANISATION_TURBOREPO” prévoit une migration vers packages mais elle n’a pas été faite.

3. **Composants**  
   - Très nombreux dossiers (donators, donors, donations, dashboard, reports, workflow, reseau, etc.).  
   - Risque de chevauchement sémantique (ex. donators vs donors).  
   - Pas de frontière claire entre “UI générique” (candidat @modele/ui) et “features métier”.

4. **Actions**  
   - Une soixantaine de fichiers dans `app/actions/`, organisés par domaine (donation-forms, reports, workflows, etc.).  
   - Structure saine ; pas d’extraction vers des packages pour l’instant.

5. **Scripts**  
   - `apps/web/scripts/` (ex. build, validate-env, generate-frontend-api-manifest).  
   - Racine `scripts/` contient aussi des scripts front (audit, generate, theme, etc.).  
   - Répartition peu claire (qui lance quoi, depuis où).

---

### 2.4 Backend

- Python (FastAPI), dans `backend/`.
- Présent dans `pnpm-workspace.yaml` alors qu’il n’a pas de dépendances npm.
- Pas intégré à Turbo (pas de tâche `build`/`dev` backend dans turbo.json).
- Base de données : backend utilise probablement ses propres modèles (Alembic, etc.) ; front utilise Prisma (`packages/database`). Deux sources de vérité possibles pour le schéma DB.

---

### 2.5 Documentation et fichiers à la racine

- Beaucoup de fichiers markdown à la racine (CHANGELOG, CHECKLIST, CODE_STRUCTURE, COMMON_PATTERNS, GETTING_STARTED, TODO, etc.) et dans `docs/`.
- Certains noms sont génériques (“MODELE”, “template”) alors que le projet est 26CausePilotAI.
- `docs/` contient des guides par étape (ETAPE_4.2.1, etc.) et des sujets (THEME, MULTI_TENANCY, etc.) ; utile mais à ranger pour éviter la dispersion.

---

## 3. Plan d’amélioration

### 3.1 Court terme (sans refonte majeure)

| Priorité | Action |
|----------|--------|
| 1 | **Clarifier les routes Next**  
   - Documenter ou supprimer les routes sous `app/` (hors `[locale]`) : soit tout sous `[locale]`, soit documenter les exceptions (ex. `/dashboard` = redirect vers `/fr/dashboard`). |
| 2 | **Utiliser Turbo à la racine**  
   - Ajouter dans `package.json` racine : `"build:all": "turbo run build"`, `"lint:all": "turbo run lint"`.  
   - Optionnel : faire de `dev` un `turbo run dev --filter=@modele/web` pour rester cohérent avec Turbo. |
| 3 | **Backend hors workspace pnpm**  
   - Retirer `backend` de `pnpm-workspace.yaml` pour éviter toute ambiguïté (backend reste à la racine, géré par Python/pip/poetry). |
| 4 | **Documenter le rôle des packages**  
   - Dans `docs/` ou README : quels packages sont utilisés (types, database), lesquels sont des stubs pour plus tard (analytics, auth, etc.). |
| 5 | **Centraliser la doc racine**  
   - Déplacer les MD “guide” / “checklist” vers `docs/` et garder à la racine uniquement README, CHANGELOG, CONTRIBUTING, LICENSE, etc. |

---

### 3.2 Moyen terme (structure et packages)

| Priorité | Action |
|----------|--------|
| 1 | **Décider du sort des packages stubs**  
   - **Option A** : Garder les stubs et avancer la migration (voir REORGANISATION_TURBOREPO) en déplaçant du code de `apps/web` vers analytics, auth, campaigns, etc.  
   - **Option B** : Supprimer les stubs non utilisés (analytics, auth, campaigns, core, donators, forms, marketing, ui) et ne garder que `types` et `database` ; recréer des packages plus tard si besoin. |
| 2 | **Package database**  
   - Ajouter un script `build` qui ne fait qu’appeler `prisma generate` (pour que `turbo run build` fonctionne).  
   - Ou documenter que ce package n’a pas de build et que le client est généré depuis apps/web. |
| 3 | **Unifier app/ vs app/[locale]**  
   - Si l’objectif est tout i18n : déplacer les pages restantes sous `app/[locale]/` et faire de `app/page.tsx` une redirection vers la locale par défaut.  
   - Nettoyer les dossiers vides ou doublons sous `app/`. |
| 4 | **Composants**  
   - Faire un inventaire donators vs donors (fusion ou renommage).  
   - Définir une convention : par domaine (donations, reports, workflow) vs par type (ui, layout, forms). |
| 5 | **Scripts**  
   - Lister les scripts racine vs apps/web.  
   - Déplacer les scripts spécifiques au front dans `apps/web/scripts/` et n’appeler que depuis le package.json de l’app (ou via turbo). |

---

### 3.3 Long terme (architecture cible)

| Priorité | Action |
|----------|--------|
| 1 | **Migration vers packages (si option A)**  
   - Suivre le mapping de REORGANISATION_TURBOREPO : auth, core, donators, marketing, analytics, forms, campaigns, ui.  
   - Une domaine à la fois ; ajouter la dépendance dans apps/web et mettre à jour les imports. |
| 2 | **Package UI partagé**  
   - Extraire les composants vraiment réutilisables (Button, Card, Modal, Input, etc.) dans `@modele/ui`, build et consommation depuis apps/web. |
| 3 | **Backend et Turbo**  
   - Si on veut un seul CLI : ajouter des tâches Turbo pour le backend (ex. `backend:lint`, `backend:test`) en appelant des scripts shell/npx qui lancent ruff, pytest, etc. |
| 4 | **Nom du projet**  
   - Aligner `package.json` racine et docs sur le nom du produit (26CausePilotAI ou autre) pour éviter “modele-nextjs-fullstack” partout. |

---

## 4. Checklist de mise en œuvre

### Phase 1 – Quick wins
- [x] Retirer `backend` de `pnpm-workspace.yaml`.
- [x] Ajouter `build:all`, `lint:all`, `type-check:all`, `test:all` (turbo run) à la racine.
- [x] Documenter dans README et docs : packages utilisés vs stubs (`docs/PACKAGES.md`).
- [x] Documenter les routes `app/` vs `app/[locale]` (`docs/ROUTES_APP.md`). Ajouter script `build` à `@modele/database` pour Turbo.

### Phase 2 – Nettoyage
- [x] Déplacer les MD “guide/checklist” de la racine vers `docs/`.
- [x] Note donators vs donors : `docs/COMPOSANTS_DONATEURS_DONORS.md` (clarification à faire côté équipe).
- [x] Rédiger “Scripts” dans docs : qui lance quoi (root vs apps/web).

### Phase 3 – Packages
- [x] Option B appliquée : suppression des 8 packages stubs (analytics, auth, campaigns, donators, forms, marketing, ui). Paths retirés de tsconfig.base.json.
- [x] **Modules corrects** : recréation de **@modele/core** avec code réel (utils, errors, constants) ; apps/web dépend de @modele/core. Packages partagés : @modele/types, @modele/database, @modele/core.

### Phase 4 – Évolution
- [ ] Définir une cible “monorepo cible” (nombre de packages, responsabilités).
- [ ] Aligner le nom du projet (root package.json + docs).

---

## 5. Résumé

- **Turborepo** : configuré mais sous-exploité (pas de `turbo run` à la racine) ; backend dans le workspace pnpm sans besoin.
- **Packages** : seul `types` (et indirectement `database`) est utilisé ; 8 packages stubs créent de la confusion.
- **apps/web** : grosse app unique, routes en doublon (racine vs [locale]), composants et lib denses, peu d’extraction vers des packages.
- **Améliorations prioritaires** : utiliser Turbo à la racine, sortir le backend du workspace, clarifier routes et rôle des packages, puis soit migrer vers les packages existants soit supprimer les stubs et documenter.

Ce document peut servir de référence pour les prochaines décisions d’architecture et les tâches de refactoring.
