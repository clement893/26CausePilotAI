'use server';

/**
 * getReport - Étape 4.2.1
 * Récupère un rapport par id (pour affichage).
 */

import { prisma } from '@/lib/db';
import type { ReportConfig } from './types';

export async function getReportAction(
  reportId: string,
  userId: string
): Promise<{ report?: { id: string; name: string; description: string | null; config: ReportConfig }; error?: string }> {
  try {
    const report = await (prisma as unknown as { report: { findFirst: (args: { where: { id: string; userId: string } }) => Promise<{ id: string; name: string; description: string | null; config: unknown } | null> } }).report.findFirst({
      where: { id: reportId, userId },
    });
    if (!report) {
      return { error: 'Rapport introuvable' };
    }
    return {
      report: {
        id: report.id,
        name: report.name,
        description: report.description,
        config: report.config as ReportConfig,
      },
    };
  } catch (e) {
    console.error('[getReportAction]', e);
    return {
      error: e instanceof Error ? e.message : 'Erreur lors du chargement du rapport',
    };
  }
}
