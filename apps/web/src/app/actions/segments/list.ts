'use server';

/**
 * getSegmentsAction - Étape 3.2.2
 * Liste les segments (audiences) avec filtre par type, pagination, total.
 */

import { prisma } from '@/lib/db';

export type SegmentTypeFilter = 'STATIC' | 'DYNAMIC' | '';

export interface SegmentRow {
  id: string;
  name: string;
  description: string | null;
  type: string;
  donatorCount: number | null; // null = dynamique non rafraîchi
  createdAt: Date;
}

export async function getSegmentsAction(
  organizationId: string,
  options?: { type?: SegmentTypeFilter; limit?: number; offset?: number }
): Promise<{ error?: string; segments?: SegmentRow[]; total?: number }> {
  try {
    const where: { organizationId: string; type?: 'STATIC' | 'DYNAMIC' } = { organizationId };
    if (options?.type === 'STATIC' || options?.type === 'DYNAMIC') {
      where.type = options.type;
    }

    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;

    const [rows, total] = await Promise.all([
      prisma.audience.findMany({
        where,
        include: { _count: { select: { donators: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.audience.count({ where }),
    ]);

    type RowWithCount = (typeof rows)[number];
    const segments: SegmentRow[] = rows.map((r: RowWithCount) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      type: r.type,
      donatorCount:
        r.type === 'STATIC'
          ? r._count.donators
          : r.cachedDonatorCount != null
            ? r.cachedDonatorCount
            : null,
      createdAt: r.createdAt,
    }));

    return { segments, total };
  } catch (e) {
    console.error('[getSegmentsAction]', e);
    return { error: 'Erreur lors du chargement' };
  }
}
