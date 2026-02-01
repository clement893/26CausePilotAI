# Instructions Détaillées - 4.1.2 : Dashboards Spécifiques

**Date:** 1er février 2026

---

## Contexte

Dashboards dédiés pour chaque module principal : Campagnes, Formulaires, Donateurs.

**Référence cahier des charges:** Section 11.2 - Dashboards Spécifiques

---

## Livrables

### 1. Pages

- **`/dashboard/campagnes/dashboard`** : Dashboard Campagnes (campagnes email).
- **`/dashboard/formulaires/dashboard`** : Dashboard Formulaires (formulaires de don).
- **`/dashboard/donateurs/dashboard`** : Dashboard Donateurs (LTV, nouveaux, etc.).

### 2. Composants

- **`CampaignsDashboard`** : KPIs (total campagnes, envoyées ce mois, brouillons, envoyées total) + graphiques (par statut, envoyées par mois).
- **`FormsDashboard`** : KPIs (formulaires, soumissions, total collecté, taux de conversion moyen) + graphiques (soumissions par mois, par formulaire).
- **`DonatorsDashboard`** : KPIs (total donateurs, nouveaux ce mois, LTV moyen, total dons) + graphiques (nouveaux par mois, dons par mois).

### 3. Actions Serveur

- **`getCampaignsDashboardData(organizationId)`** : Données campagnes (EmailCampaign).
- **`getFormsDashboardData(organizationId)`** : Données formulaires (DonationForm, DonationFormSubmission).
- **`getDonatorsDashboardData(organizationId)`** : Données donateurs (Donator, Donation).

---

## Fichiers créés

- `apps/web/src/app/actions/dashboard/getCampaignsDashboardData.ts`
- `apps/web/src/app/actions/dashboard/getFormsDashboardData.ts`
- `apps/web/src/app/actions/dashboard/getDonatorsDashboardData.ts`
- `apps/web/src/components/dashboard/CampaignsDashboard.tsx`
- `apps/web/src/components/dashboard/FormsDashboard.tsx`
- `apps/web/src/components/dashboard/DonatorsDashboard.tsx`
- `apps/web/src/app/[locale]/dashboard/campagnes/dashboard/page.tsx`
- `apps/web/src/app/[locale]/dashboard/formulaires/dashboard/page.tsx`
- `apps/web/src/app/[locale]/dashboard/donateurs/dashboard/page.tsx`
- `docs/ETAPE_4.1.2_DASHBOARDS_SPECIFIQUES.md`

---

## Checklist

- [x] Le dashboard des campagnes s'affiche correctement.
- [x] Le dashboard des formulaires s'affiche correctement.
- [x] Le dashboard des donateurs s'affiche correctement.
- [x] Les données sont pertinentes pour chaque module (KPIs + graphiques).
