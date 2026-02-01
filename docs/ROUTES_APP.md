# Routes Next.js : `app/` vs `app/[locale]/`

**Référence :** Audit Turborepo (`docs/AUDIT_TURBOREPO_ET_ORGANISATION.md`)

---

## Organisation actuelle

- **`app/[locale]/`** : application principale internationalisée (fr, en). Layout, providers, et la grande majorité des pages (dashboard, admin, rapports, auth, etc.) sont sous `[locale]`. Les URLs sont de la forme `/fr/dashboard`, `/en/dashboard`.
- **`app/` (racine)** : routes sans segment de locale : `app/page.tsx`, `app/dashboard/`, `app/admin/`, `app/auth/`, etc. Les URLs sont `/`, `/dashboard`, `/admin`, etc.

Avec **next-intl**, le layout racine (`app/layout.tsx`) ne fait que passer les enfants ; le layout réel (html, body, providers) est dans `app/[locale]/layout.tsx`.

---

## Comportement

- **`/`** → `app/page.tsx` (racine)
- **`/fr`**, **`/en`** → `app/[locale]/page.tsx`
- **`/dashboard`** → `app/dashboard/` (sans locale)
- **`/fr/dashboard`**, **`/en/dashboard`** → `app/[locale]/dashboard/` (avec locale)

Selon la config next-intl (middleware, defaultLocale), les utilisateurs peuvent être redirigés de `/` vers `/fr` ou `/en`. Les deux arbres (avec et sans locale) coexistent ; pour une base uniquement i18n, on pourrait à terme tout regrouper sous `[locale]` et faire de `/dashboard` une redirection vers `/fr/dashboard`.

---

## Fichiers partagés

- **`app/actions/`** : server actions utilisées par les pages (sous `[locale]` ou racine).
- **`app/api/`** : API routes Next.js (sans locale).
- **`app/layout.tsx`**, **`app/globals.css`**, **`app/error.tsx`**, etc. : communs à toute l’app.

---

## Évolutions possibles

1. **Tout sous [locale]** : déplacer les pages restantes sous `app/[locale]/` et faire de `/dashboard` (etc.) des redirections vers `/[locale]/dashboard`.
2. **Documenter les exceptions** : si certaines routes doivent rester sans locale (ex. webhooks, API), les lister ici ou dans le README.
