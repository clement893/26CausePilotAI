/**
 * Types pour le générateur de rapports - Étape 4.2.1
 */

export const REPORT_METRICS = [
  { value: 'total_donations', label: 'Total des dons' },
  { value: 'donor_count', label: 'Nombre de donateurs' },
  { value: 'donation_count', label: 'Nombre de dons' },
  { value: 'avg_donation', label: 'Don moyen' },
] as const;

export const REPORT_DIMENSIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'month', label: 'Par mois' },
  { value: 'country', label: 'Par pays' },
  { value: 'form', label: 'Par formulaire' },
] as const;

export type ReportMetric = (typeof REPORT_METRICS)[number]['value'];
export type ReportDimension = (typeof REPORT_DIMENSIONS)[number]['value'];

export interface ReportConfig {
  metric: ReportMetric;
  dimension: ReportDimension;
  dateFrom: string; // ISO date
  dateTo: string;   // ISO date
}

export interface ReportDataRow {
  label: string;
  value: number;
}

export interface ReportDataResult {
  rows: ReportDataRow[];
  summary?: number;
  error?: string;
}

/** Rapports prédéfinis - Étape 4.2.2 */
export const PREDEFINED_REPORT_TYPES = [
  {
    type: 'annual_donations',
    label: 'Rapport annuel des dons',
    description: 'Total des dons par mois pour l\'année en cours.',
  },
  {
    type: 'monthly_performance',
    label: 'Performance mensuelle',
    description: 'Dons et nombre de dons par mois sur les 12 derniers mois.',
  },
  {
    type: 'donations_by_form',
    label: 'Dons par formulaire',
    description: 'Répartition des dons par formulaire de collecte (année en cours).',
  },
  {
    type: 'donors_by_country',
    label: 'Donateurs par pays',
    description: 'Nombre de donateurs et montants par pays pour l\'année en cours.',
  },
  {
    type: 'campaign_summary',
    label: 'Résumé annuel',
    description: 'Total des dons, nombre de donateurs et nombre de dons pour l\'année.',
  },
] as const;

export type PredefinedReportType = (typeof PREDEFINED_REPORT_TYPES)[number]['type'];
