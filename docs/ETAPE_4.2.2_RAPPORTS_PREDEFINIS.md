# Étape 4.2.2 - Rapports Prédéfinis

**Date:** 1er février 2026  
**Référence cahier des charges:** Section 11.4 - Rapports Prédéfinis

---

## Objectifs

- Proposer une bibliothèque de rapports standards consultables en un clic.
- Couvrir les cas d'usage courants : rapport annuel des dons, performance mensuelle, dons par formulaire, donateurs par pays, résumé annuel.

---

## Livrables

### 1. Types et constantes

- **`PREDEFINED_REPORT_TYPES`** dans `apps/web/src/app/actions/reports/types.ts` :
  - `annual_donations` : Rapport annuel des dons (total par mois, année en cours).
  - `monthly_performance` : Performance mensuelle (dons par mois, 12 derniers mois).
  - `donations_by_form` : Dons par formulaire (année en cours).
  - `donors_by_country` : Donateurs par pays (année en cours).
  - `campaign_summary` : Résumé annuel (total des dons, année en cours).

### 2. Action serveur

- **`getPredefinedReportData(reportType, organizationId)`** dans `apps/web/src/app/actions/reports/getPredefinedReportData.ts` :
  - Construit une `ReportConfig` selon le type (métrique, dimension, période).
  - Délègue à `getReportData(organizationId, config)` pour récupérer les données.

### 3. Composant

- **`PredefinedReportsList`** dans `apps/web/src/components/reports/PredefinedReportsList.tsx` :
  - Affiche une liste de cartes (titre, description) avec un lien vers la vue du rapport prédéfini.

### 4. Pages

- **`/dashboard/rapports`** : mise à jour pour afficher en haut la section « Rapports prédéfinis » (`PredefinedReportsList`), puis « Mes rapports » (liste des rapports personnalisés).
- **`/dashboard/rapports/predefinis/[type]`** : page de visualisation d’un rapport prédéfini ; appelle `getPredefinedReportData(type, organizationId)` et affiche le résultat avec `ReportView`.

### 5. Exports

- **`components/reports/index.ts`** : export de `PredefinedReportsList`.

---

## Checklist de vérification

- [ ] La liste des rapports prédéfinis s'affiche correctement sur `/dashboard/rapports`.
- [ ] Chaque rapport prédéfini peut être consulté via le lien vers `/dashboard/rapports/predefinis/[type]`.
- [ ] Les données des rapports prédéfinis sont correctes (métrique, dimension, période selon le type).
