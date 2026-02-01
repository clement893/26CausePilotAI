'use server';

/**
 * createSegmentAction - Étape 3.2.1
 * Crée un segment (Audience) statique ou dynamique.
 * Pour DYNAMIC, calcule et stocke cachedDonatorCount (Étape 3.2.2).
 */

import { prisma } from '@/lib/db';
import { evaluateSegmentAction } from './evaluate';
import type { SegmentRules } from '@/lib/segmentation/types';

export interface CreateSegmentInput {
  name: string;
  description: string | null;
  type: 'STATIC' | 'DYNAMIC';
  rules?: SegmentRules | null;
}

export async function createSegmentAction(
  organizationId: string,
  input: CreateSegmentInput
): Promise<{ error?: string; id?: string }> {
  try {
    let cachedDonatorCount: number | undefined;
    if (input.type === 'DYNAMIC' && input.rules) {
      const res = await evaluateSegmentAction(organizationId, input.rules);
      cachedDonatorCount = res.count ?? 0;
    }

    const audience = await prisma.audience.create({
      data: {
        organizationId,
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        rules: input.type === 'DYNAMIC' && input.rules ? (input.rules as object) : undefined,
        cachedDonatorCount,
      },
    });
    return { id: audience.id };
  } catch (e) {
    console.error('[createSegmentAction]', e);
    return { error: 'Erreur lors de la création du segment' };
  }
}
