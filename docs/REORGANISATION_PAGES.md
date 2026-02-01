# Réorganisation des Pages (Routes Dashboard)

**Date:** 1er février 2026

---

## Contexte

Simplification de la structure des routes du dashboard pour des URLs plus courtes et plus logiques.

---

## Changements effectués

| Ancienne route | Nouvelle route |
|----------------|----------------|
| `/dashboard/base-donateur/donateurs` | `/dashboard/donateurs` |
| `/dashboard/base-donateur/donateurs/[id]` | `/dashboard/donateurs/[id]` |
| `/dashboard/base-donateur/donateurs/[id]/edit` | `/dashboard/donateurs/[id]/edit` |
| `/dashboard/base-donateur/donateurs/new` | `/dashboard/donateurs/new` |
| `/dashboard/formulaires/formulaires` | `/dashboard/formulaires` |
| `/dashboard/campagnes/campagnes` | `/dashboard/campagnes` |

---

## Fichiers modifiés / créés

- **Nouvelle structure :**
  - `apps/web/src/app/[locale]/dashboard/donateurs/` — liste, new, [id], [id]/edit (avec DonateursContent, DonorProfileContent)
  - `apps/web/src/app/[locale]/dashboard/formulaires/page.tsx` — page liste (remplace formulaires/formulaires/page.tsx)
  - `apps/web/src/app/[locale]/dashboard/campagnes/page.tsx` — page liste (remplace campagnes/campagnes/page.tsx)

- **Liens mis à jour :**
  - `lib/navigation/index.tsx` — Donateurs, Formulaires, Campagnes
  - `components/donations/DonationTable.tsx` — lien vers profil donateur
  - `components/donation-subscriptions/SubscriptionTable.tsx` — lien vers profil donateur
  - `components/donators/DonatorHeader.tsx`, `DonatorTable.tsx` — basePath
  - `app/[locale]/dashboard/page.tsx` — liens Donateurs et Campagnes
  - `app/[locale]/dashboard/formulaires/[id]/edit/page.tsx`, `new/page.tsx` — liens vers liste formulaires

- **Anciens dossiers supprimés :**
  - `dashboard/base-donateur/donateurs/` (tout le sous-dossier)
  - `dashboard/formulaires/formulaires/` (page déplacée à la racine formulaires)
  - `dashboard/campagnes/campagnes/` (page déplacée à la racine campagnes)

---

## Vérifications

- [x] Les dossiers de pages ont été réorganisés.
- [x] Tous les liens internes ont été mis à jour.
- [ ] La navigation et l’accès aux pages sont à valider manuellement (aucune 404 attendue).
