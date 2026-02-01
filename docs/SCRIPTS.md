# Scripts : qui lance quoi

**Référence :** Audit Turborepo (`docs/AUDIT_TURBOREPO_ET_ORGANISATION.md`)

---

## Racine du monorepo (`package.json`)

| Script | Commande | Rôle |
|--------|----------|------|
| `dev` | `pnpm --filter @modele/web dev` | Lancer le frontend Next.js en dev |
| `build` | `pnpm --filter @modele/web build` | Builder uniquement l’app web |
| `build:all` | `turbo run build` | Builder tous les packages puis l’app (Turbo) |
| `lint` | `pnpm --recursive lint` | Lint récursif (tous les packages/apps) |
| `lint:all` | `turbo run lint` | Lint via Turbo (cache) |
| `type-check` | `pnpm --recursive type-check` | Vérification de types récursive |
| `type-check:all` | `turbo run type-check` | Type-check via Turbo |
| `test` | `pnpm --recursive test` | Tests récursifs |
| `test:all` | `turbo run test` | Tests via Turbo |
| `format` | `prettier --write "**/*.{ts,tsx,...}"` | Formatage Prettier (racine) |
| `validate:env` | `pnpm --filter @modele/web env:validate` | Valider les variables d’env frontend |
| `validate:env:backend` | `cd backend && python -m app.core.config` | Valider la config backend (Python) |
| `security:scan` | script shell/ps1 | Scan de sécurité |
| `security:audit` | pnpm audit + safety (backend) | Audit de dépendances |
| `api:check` | `node scripts/check-api-connections.js` | Vérifier les connexions API |
| `audit:code`, `audit:performance` | scripts node | Audits code / perfs |
| `generate:secrets` | `node scripts/generate-secrets.js` | Générer des secrets |

Les scripts dans **`scripts/`** (racine) sont des utilitaires Node (audits, migrations, génération, etc.) appelés par ces commandes ou utilisés manuellement.

---

## App web (`apps/web/package.json`)

| Script | Rôle |
|--------|------|
| `dev` | `next dev` |
| `build` | Build Next.js (avec prebuild : api:manifest, etc.) |
| `lint` | `next lint` |
| `type-check` | `tsc --noEmit --incremental` |
| `test` | `vitest run` |
| `db:generate` | `prisma generate --schema=../../packages/database/prisma/schema.prisma` |
| `env:validate` | `node scripts/validate-env.js` |
| `api:manifest` | `node scripts/generate-frontend-api-manifest.js` |

Les scripts dans **`apps/web/scripts/`** sont spécifiques au frontend (validation env, manifest API, build fallback, etc.).

---

## Backend (`backend/`)

Le backend est en **Python** (FastAPI). Il n’est plus dans le workspace pnpm. Pour lancer / tester :

- Depuis la racine : `cd backend && python run.py` (ou selon la doc backend).
- Scripts définis dans `backend/package.json` (npm/pnpm) si présents : `pnpm --filter @modele/backend <script>` **ne fonctionne plus** car backend a été retiré du workspace ; utiliser `cd backend` puis les commandes Python (pytest, ruff, etc.).
