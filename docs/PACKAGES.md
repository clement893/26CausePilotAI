# Packages du monorepo

**Référence :** Audit Turborepo (`docs/AUDIT_TURBOREPO_ET_ORGANISATION.md`)

---

## Packages utilisés par l’application

| Package | Rôle | Consommé par |
|--------|------|---------------|
| **@modele/types** | Types TypeScript partagés (api, donor, theme, user, portal, etc.) | `apps/web` (dépendance directe) |
| **@modele/database** | Schéma Prisma (organisations, users, dons, rapports, etc.) | `apps/web` via `db:generate` (schema dans ce package) et `@prisma/client` |
| **@modele/core** | Utilitaires partagés : errors (types, AppError, utils), utils (dateUtils, fileValidation, rateLimiter, validationTypes), constants (portal) | `apps/web` ; `lib/errors` ré-exporte depuis core |

---

**Modules corrects (fév. 2026)** : après l’Option B (suppression des stubs), le package **@modele/core** a été recréé avec du code réel migré depuis `apps/web`. L’app utilise core pour les erreurs ; `lib/errors/api` (Sentry, logger) reste dans l’app.

---

## Build

- **`pnpm build:all`** (racine) : `turbo run build` — build des 3 packages (`types`, `database`, `core`) puis de l’app. L’app web peut échouer si les variables d’environnement (ex. `NEXT_PUBLIC_API_URL`) ne sont pas définies ou en cas d’erreur Turbopack (ex. symlinks sous Windows) — utiliser `USE_WEBPACK=true pnpm build` dans `apps/web` si besoin.
- **`@modele/database`** : script `build` = `prisma generate` (génère le client Prisma dans `node_modules`).
- **`apps/web`** : exécute aussi `db:generate` avec le schema de `packages/database` pour générer le client dans son propre `node_modules` (usage courant).
