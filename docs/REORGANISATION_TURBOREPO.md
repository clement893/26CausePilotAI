# Réorganisation du Turborepo

**Date:** 1er février 2026

---

## Contexte

Réorganisation de la structure du Turborepo pour refléter les modules fonctionnels et améliorer la maintenabilité.

**Décision (Option B, fév. 2026)** : les packages stubs (analytics, auth, campaigns, core, donators, forms, marketing, ui) ont été **supprimés**. Seuls **@modele/types** et **@modele/database** sont conservés. Tout le code métier reste dans `apps/web`. Ce document est conservé comme **référence** si une migration vers des packages est décidée plus tard.

---

## Structure actuelle des packages

```
/packages
  /database    → @modele/database   (Prisma, schéma)
  /types       → @modele/types      (types partagés)
```

---

## Structure « cible » (référence pour une future migration)

Si on recrée des packages plus tard :

```
/packages
  /analytics   → @modele/analytics   (analytics, rapports)
  /auth        → @modele/auth       (authentification, session)
  /campaigns   → @modele/campaigns   (campagnes multi-canal)
  /core        → @modele/core       (utils, erreurs, logger, constants)
  /database    → @modele/database   (Prisma, schéma) — existant
  /donators    → @modele/donators   (base donateur, dons)
  /forms       → @modele/forms      (formulaires, hooks forms)
  /marketing   → @modele/marketing   (templates, campagnes email, segments, workflows)
  /types       → @modele/types      (types partagés) — existant
  /ui          → @modele/ui         (composants UI réutilisables)
```

---

## État actuel (après Option B)

- **Packages :** Seuls `types` et `database` existent. Pas de stubs.
- **Code métier :** Tout reste dans `apps/web` (lib, components, app/actions, etc.).
- **tsconfig.base.json :** Paths uniquement pour `@modele/types` et `@modele/database`.

---

## Migration progressive

Pour déplacer le code existant vers un package :

1. **Déclarer la dépendance** dans `apps/web/package.json` :
   ```json
   "@modele/auth": "workspace:*"
   ```

2. **Déplacer les fichiers** (ex. `apps/web/src/lib/auth/*` → `packages/auth/src/`).

3. **Exporter** depuis `packages/auth/src/index.ts`.

4. **Remplacer les imports** dans l’app :
   - Avant : `import { ... } from '@/lib/auth'`
   - Après : `import { ... } from '@modele/auth'`

5. **Mettre à jour les dépendances** du package (ex. `@modele/auth` peut dépendre de `@modele/types`).

---

## Mapping suggéré (code → package)

| Package        | Code actuel (apps/web) à migrer |
|----------------|----------------------------------|
| @modele/auth   | `lib/auth/*`, `app/auth/*`, `hooks/useAuth.ts`, `hooks/use-session.ts` |
| @modele/core   | `lib/utils/*`, `lib/errors/*`, `lib/logger*`, `lib/constants/*` |
| @modele/donators| `components/donators/*`, `app/actions/donations/*`, pages base-donateur/dons |
| @modele/marketing | `components/email-editor/*`, `components/segmentation/*`, `components/workflow/*`, `lib/segmentation/*`, `lib/workflow/*`, actions email-campaigns, templates, segments, workflows |
| @modele/analytics | `lib/api/analytics.ts`, `lib/marketing/analytics.ts` |
| @modele/forms  | `hooks/forms/*`, composants formulaire réutilisables |
| @modele/campaigns | Pages/actions campagnes (courriels, médias sociaux) |
| @modele/ui     | Composants UI partagés (Button, Card, Modal, etc.) |

---

## Checklist (référence pour une future migration)

- [x] Option B appliquée : stubs supprimés, seuls types et database restent.
- [ ] Si migration future : créer les packages au besoin, déplacer le code, mettre à jour les imports.
- [ ] L’application se build et se lance correctement après chaque migration.

Pour builder tous les packages : `pnpm run build:all` ou `pnpm -r build` (à la racine).
