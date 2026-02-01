'use server';

/**
 * getPredefinedReportData - Étape 4.2.2
 * Retourne les données pour un type de rapport prédéfini.
 */

import { getReportData } from './getReportData';
import type { ReportConfig } from './types';
import type { PredefinedReportType } from './types';

function getConfigForType(type: PredefinedReportType): ReportConfig {
  const now = new Date();
  const year = now.getFullYear();

  switch (type) {
    case 'annual_donations':
      return {
        metric: 'total_donations',
        dimension: 'month',
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
    case 'monthly_performance': {
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const from = new Date(to);
      from.setMonth(from.getMonth() - 11);
      return {
        metric: 'total_donations',
        dimension: 'month',
        dateFrom: from.toISOString().slice(0, 10),
        dateTo: to.toISOString().slice(0, 10),
      };
    }
    case 'donations_by_form':
      return {
        metric: 'total_donations',
        dimension: 'form',
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
    case 'donors_by_country':
      return {
        metric: 'donor_count',
        dimension: 'country',
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
    case 'campaign_summary':
      return {
        metric: 'total_donations',
        dimension: 'none',
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
    default:
      return {
        metric: 'total_donations',
        dimension: 'none',
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
  }
}

export async function getPredefinedReportData(
  reportType: PredefinedReportType,
  organizationId: string
) {
  const config = getConfigForType(reportType);
  return getReportData(organizationId, config);
}
