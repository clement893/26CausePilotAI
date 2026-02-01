'use server';

/**
 * getDashboardLayout - Étape 4.1.1
 * Récupère la disposition sauvegardée des widgets pour l'utilisateur.
 */

import { prisma } from '@/lib/db';

export type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'kpi-donors', x: 0, y: 0, w: 3, h: 2 },
  { i: 'kpi-donations', x: 3, y: 0, w: 3, h: 2 },
  { i: 'kpi-month', x: 6, y: 0, w: 3, h: 2 },
  { i: 'kpi-new', x: 9, y: 0, w: 3, h: 2 },
  { i: 'chart-donations', x: 0, y: 2, w: 8, h: 3 },
  { i: 'recent-activity', x: 8, y: 2, w: 4, h: 3 },
];

export async function getDashboardLayoutAction(
  userId: string
): Promise<{ layout: LayoutItem[]; error?: string }> {
  try {
    const row = await prisma.dashboardLayout.findUnique({
      where: { userId },
    });
    if (!row || !Array.isArray(row.layout)) {
      return { layout: DEFAULT_LAYOUT };
    }
    const layout = row.layout as LayoutItem[];
    return { layout };
  } catch (e) {
    console.error('[getDashboardLayoutAction]', e);
    return { layout: DEFAULT_LAYOUT, error: 'Erreur chargement disposition' };
  }
}
