# Réorganisation du Turborepo

**Date:** 1er février 2026

---

## Contexte

Réorganisation de la structure du Turborepo pour refléter les modules fonctionnels et améliorer la maintenabilité.

---

## Nouvelle structure des packages

```
/packages
  /analytics   → @modele/analytics   (analytics, rapports)
  /auth        → @modele/auth       (authentification, session)
  /campaigns   → @modele/campaigns   (campagnes multi-canal)
  /core        → @modele/core       (utils, erreurs, logger, constants)
  /database    → @modele/database    (Prisma, schéma) — existant
  /donators    → @modele/donators   (base donateur, dons)
  /forms       → @modele/forms      (formulaires, hooks forms)
  /marketing   → @modele/marketing   (templates, campagnes email, segments, workflows)
  /types       → @modele/types      (types partagés) — existant
  /ui          → @modele/ui         (composants UI réutilisables)
```

---

## État actuel

- **Créés :** Tous les nouveaux packages sont créés avec un point d’entrée `src/index.ts` (export minimal).
- **Code existant :** Reste pour l’instant dans `apps/web`. La migration vers les packages peut se faire progressivement.
- **tsconfig.base.json :** Paths ajoutés pour `@modele/analytics`, `@modele/auth`, etc., afin de permettre les imports une fois les dépendances déclarées.
- **turbo.json :** Aucun changement nécessaire ; la tâche `build` avec `dependsOn: ["^build"]` prend en compte les nouveaux packages.

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

## Checklist de vérification

- [x] Tous les nouveaux packages sont créés.
- [ ] Le code existant a été déplacé (migration progressive).
- [x] Les `package.json` des packages sont à jour.
- [ ] Les imports dans l’application sont mis à jour (au fil de la migration).
- [ ] L’application se build et se lance correctement après chaque migration.

Pour builder tous les packages : `pnpm -r build` (à la racine).
