'use server';

/**
 * createSegmentAction - Étape 3.2.1
 * Crée un segment (Audience) statique ou dynamique.
 */

import { prisma } from '@/lib/db';
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
    const audience = await prisma.audience.create({
      data: {
        organizationId,
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        rules: input.type === 'DYNAMIC' && input.rules ? (input.rules as object) : undefined,
      },
    });
    return { id: audience.id };
  } catch (e) {
    console.error('[createSegmentAction]', e);
    return { error: 'Erreur lors de la création du segment' };
  }
}
