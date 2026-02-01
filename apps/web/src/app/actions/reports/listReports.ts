'use server';

/**
 * listReports - Étape 4.2.1
 * Liste les rapports de l'utilisateur.
 */

import { prisma } from '@/lib/db';

export type ReportListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
};

export async function listReportsAction(
  userId: string
): Promise<{ reports?: ReportListItem[]; error?: string }> {
  try {
    const reportModel = (prisma as unknown as { report: { findMany: (args: { where: { userId: string }; orderBy: { updatedAt: string }; select: { id: true; name: true; description: true; createdAt: true } }) => Promise<{ id: string; name: string; description: string | null; createdAt: Date }[]> } }).report;
    const rows = await reportModel.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, description: true, createdAt: true },
    });
    return {
      reports: rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        createdAt: r.createdAt,
      })),
    };
  } catch (e) {
    console.error('[listReportsAction]', e);
    return {
      error: e instanceof Error ? e.message : 'Erreur lors du chargement des rapports',
    };
  }
}
