'use server';

/**
 * saveDashboardLayout - Étape 4.1.1
 * Sauvegarde la disposition des widgets du dashboard pour l'utilisateur.
 */

import { prisma } from '@/lib/db';

export type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export async function saveDashboardLayoutAction(
  userId: string,
  layout: LayoutItem[]
): Promise<{ error?: string }> {
  try {
    await prisma.dashboardLayout.upsert({
      where: { userId },
      create: { userId, layout: layout as unknown as object },
      update: { layout: layout as unknown as object },
    });
    return {};
  } catch (e) {
    console.error('[saveDashboardLayoutAction]', e);
    return {
      error: e instanceof Error ? e.message : 'Erreur sauvegarde disposition',
    };
  }
}
