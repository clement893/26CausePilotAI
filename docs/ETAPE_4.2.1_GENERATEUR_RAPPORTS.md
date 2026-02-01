# Étape 4.2.1 - Générateur de Rapports

**Date:** 1er février 2026  
**Référence cahier des charges:** Section 11.3 - Générateur de Rapports

---

## Objectifs

- Permettre aux utilisateurs de créer des rapports personnalisés en sélectionnant des métriques, dimensions et périodes.
- Afficher les rapports sous forme de tableau et de graphique.

---

## Livrables

### 1. Modèle Prisma

- **`Report`** dans `packages/database/prisma/schema.prisma` :
  - `id`, `name`, `description`, `config` (Json), `userId`, relation `user`, `createdAt`, `updatedAt`.

### 2. Types et constantes

- **`apps/web/src/app/actions/reports/types.ts`** :
  - `REPORT_METRICS` : total_donations, donor_count, donation_count, avg_donation.
  - `REPORT_DIMENSIONS` : none, month, country, form.
  - `ReportConfig`, `ReportDataRow`, `ReportDataResult`.

### 3. Actions serveur

- **`createReportAction(userId, name, config, description?)`** : crée un rapport.
- **`getReportAction(reportId, userId)`** : récupère un rapport (vérifie que l’utilisateur en est propriétaire).
- **`getReportData(organizationId, config)`** : récupère les données du rapport (dons, agrégations selon métrique/dimension/période).
- **`listReportsAction(userId)`** : liste les rapports de l’utilisateur.

### 4. Composants

- **`ReportBuilder`** : formulaire de configuration (nom, description, métrique, dimension, période). Soumet vers `onSubmit(name, description, config)`.
- **`ReportView`** : affiche titre, description, total, tableau et graphique (bar/line selon le nombre de lignes).

### 5. Pages

- **`/dashboard/rapports`** : liste des rapports de l’utilisateur, lien « Nouveau rapport ».
- **`/dashboard/rapports/new`** : création d’un rapport (ReportBuilder) ; après création, redirection vers `/dashboard/rapports/[id]`.
- **`/dashboard/rapports/[id]`** : visualisation d’un rapport (ReportView) avec données chargées via `getReportData(organizationId, config)`.

### 6. Navigation

- Entrée « Rapports » dans le menu **Analyse** pointe vers `/dashboard/rapports`.

---

## Checklist de vérification

- [ ] Un nouveau rapport peut être créé et sauvegardé.
- [ ] Le rapport généré affiche les bonnes données (métrique, dimension, période).
- [ ] Le rapport est affiché sous forme de tableau et de graphique.
- [ ] Exécuter la migration Prisma (`pnpm run db:migrate` ou `db:push`) pour créer la table `reports` si nécessaire.

---

## Données du rapport

Les données sont basées sur les **dons** (`Donation`) de l’organisation, filtrés par `status: 'completed'` et par période (`donatedAt` entre `dateFrom` et `dateTo`). Les dimensions `month`, `country`, `form` agrègent selon le mois, le pays du donateur ou le formulaire.
