# Étape 4.2.3 - Export et Planification des Rapports

**Date:** 1er février 2026  
**Référence cahier des charges:** Section 11.5 - Export et Planification

---

## Objectifs

- Permettre l'export des rapports en PDF et CSV.
- Permettre la planification de l'envoi récurrent d'un rapport par email (fréquence, destinataires).

---

## Livrables

### 1. Modèle Prisma

- **`ReportSchedule`** dans `packages/database/prisma/schema.prisma` :
  - `id`, `name`, `userId`, `reportId?`, `predefinedReportType?`, `frequency` (daily | weekly | monthly), `recipients` (Json, tableau d'emails), `nextRunAt?`, `createdAt`, `updatedAt`.
  - Relation `user` vers `User`. Soit `reportId` (rapport personnalisé), soit `predefinedReportType` (rapport prédéfini).

### 2. Composants

- **`ExportButtons`** (`components/reports/ExportButtons.tsx`) :
  - Boutons « Exporter en PDF » et « Exporter en CSV ».
  - Reçoit : `title`, `description?`, `rows`, `summary?`, `metricLabel?`.
  - PDF : génération côté client avec `jspdf` (titre, description, total, tableau).
  - CSV : génération côté client (en-tête Libellé,Valeur, lignes, encodage UTF-8 avec BOM).

- **`ScheduleReportModal`** (`components/reports/ScheduleReportModal.tsx`) :
  - Modale (Modal) avec formulaire : nom de la planification, fréquence (Quotidien / Hebdomadaire / Mensuel), destinataires (textarea, un email par ligne ou séparés par virgules).
  - Props : `isOpen`, `onClose`, `onSuccess?`, `reportId?`, `predefinedReportType?`, `reportName`, `userId`.
  - Soumission → `scheduleReportAction`.

### 3. Action serveur

- **`scheduleReportAction(input)`** (`app/actions/reports/scheduleReport.ts`) :
  - Crée un `ReportSchedule` avec `nextRunAt` calculé selon la fréquence (ex. lendemain 9h pour daily).
  - L'exécution réelle (cron/worker qui envoie les emails) est à implémenter séparément.

### 4. Intégration

- **Page rapport personnalisé** (`/dashboard/rapports/[id]`) : barre avec `ExportButtons` + bouton « Planifier » ouvrant `ScheduleReportModal` (reportId, reportName, userId).
- **Page rapport prédéfini** (`/dashboard/rapports/predefinis/[type]`) : même barre avec `ExportButtons` + « Planifier » (visible si utilisateur connecté) ouvrant `ScheduleReportModal` (predefinedReportType, reportName, userId).

### 5. Dépendances

- **jspdf** : déjà présent dans `apps/web/package.json` pour la génération PDF.
- **CSV** : génération manuelle (pas de papaparse).

---

## Checklist de vérification

- [ ] Les rapports peuvent être exportés en PDF (bouton sur la page de visualisation).
- [ ] Les rapports peuvent être exportés en CSV.
- [ ] Le bouton « Planifier » ouvre la modale et permet de configurer fréquence et destinataires.
- [ ] La planification est enregistrée (table `report_schedules`).
- [ ] Exécuter la migration Prisma (`pnpm run db:migrate` ou `db:push`) pour créer la table `report_schedules`.
- [ ] L'envoi effectif des rapports planifiés (cron/worker) reste à implémenter.
