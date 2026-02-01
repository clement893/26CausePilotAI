'use server';

/**
 * createReport - Étape 4.2.1
 * Crée un nouveau rapport (sauvegarde la configuration).
 */

import { prisma } from '@/lib/db';
import type { ReportConfig } from './types';

export async function createReportAction(
  userId: string,
  name: string,
  config: ReportConfig,
  description?: string
): Promise<{ reportId?: string; error?: string }> {
  try {
    const report = await (prisma as unknown as { report: { create: (args: { data: { name: string; description: string | null; config: object; userId: string } }) => Promise<{ id: string }> } }).report.create({
      data: {
        name,
        description: description ?? null,
        config: config as unknown as object,
        userId,
      },
    });
    return { reportId: report.id };
  } catch (e) {
    console.error('[createReportAction]', e);
    return {
      error: e instanceof Error ? e.message : 'Erreur lors de la création du rapport',
    };
  }
}
