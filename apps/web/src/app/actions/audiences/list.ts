'use server';

/**
 * listAudiencesAction - Étape 3.1.3
 * Liste les audiences de l'organisation (pour sélection dans le wizard campagne).
 */

import { prisma } from '@/lib/db';

export interface AudienceRow {
  id: string;
  name: string;
  description: string | null;
  type: string;
  donatorCount: number;
}

export async function listAudiencesAction(
  organizationId: string
): Promise<{ error?: string; audiences?: AudienceRow[] }> {
  try {
    const rows = await prisma.audience.findMany({
      where: { organizationId },
      include: { _count: { select: { donators: true } } },
      orderBy: { name: 'asc' },
    });
    type RowWithCount = (typeof rows)[number];
    const audiences: AudienceRow[] = rows.map((r: RowWithCount) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      type: r.type,
      donatorCount:
        r.type === 'STATIC'
          ? r._count.donators
          : r.cachedDonatorCount ?? 0,
    }));
    return { audiences };
  } catch (e) {
    console.error('[listAudiencesAction]', e);
    return { error: 'Erreur lors du chargement' };
  }
}
