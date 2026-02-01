'use server';

/**
 * refreshSegmentAction - Étape 3.2.2
 * Recalcule la taille d'un segment dynamique (évalue les règles, met à jour cachedDonatorCount).
 */

import { prisma } from '@/lib/db';
import { evaluateSegmentAction } from './evaluate';
import type { SegmentRules } from '@/lib/segmentation/types';

export async function refreshSegmentAction(
  segmentId: string,
  organizationId: string
): Promise<{ error?: string; count?: number }> {
  try {
    const audience = await prisma.audience.findFirst({
      where: { id: segmentId, organizationId },
    });
    if (!audience) return { error: 'Segment introuvable' };
    if (audience.type !== 'DYNAMIC') {
      return { error: 'Le rafraîchissement ne s\'applique qu\'aux segments dynamiques' };
    }
    const rules = audience.rules as SegmentRules | null;
    if (!rules?.group) return { error: 'Règles manquantes' };

    const res = await evaluateSegmentAction(organizationId, rules);
    if (res.error) return { error: res.error };
    const count = res.count ?? 0;

    await prisma.audience.update({
      where: { id: segmentId },
      data: { cachedDonatorCount: count },
    });

    return { count };
  } catch (e) {
    console.error('[refreshSegmentAction]', e);
    return { error: 'Erreur lors du rafraîchissement' };
  }
}
