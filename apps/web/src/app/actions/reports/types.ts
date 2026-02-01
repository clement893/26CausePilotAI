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
