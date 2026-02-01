'use server';

/**
 * deleteSegmentAction - Étape 3.2.2
 * Supprime un segment (Audience) après vérification organisation.
 */

import { prisma } from '@/lib/db';

export async function deleteSegmentAction(
  segmentId: string,
  organizationId: string
): Promise<{ error?: string }> {
  try {
    const audience = await prisma.audience.findFirst({
      where: { id: segmentId, organizationId },
    });
    if (!audience) return { error: 'Segment introuvable' };

    await prisma.audience.delete({ where: { id: segmentId } });
    return {};
  } catch (e) {
    console.error('[deleteSegmentAction]', e);
    return { error: 'Erreur lors de la suppression' };
  }
}
