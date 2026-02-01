'use server';

/**
 * evaluateSegmentAction - Étape 3.2.1
 * Compte le nombre de donateurs correspondant aux règles (temps réel).
 */

import { prisma } from '@/lib/db';
import { ruleGroupToWhere } from '@/lib/segmentation/evaluate';
import type { SegmentRules } from '@/lib/segmentation/types';

export async function evaluateSegmentAction(
  organizationId: string,
  rules: SegmentRules
): Promise<{ error?: string; count?: number }> {
  try {
    const where = ruleGroupToWhere(rules.group, organizationId);
    const count = await prisma.donator.count({ where });
    return { count };
  } catch (e) {
    console.error('[evaluateSegmentAction]', e);
    return { error: 'Erreur lors de l\'évaluation' };
  }
}
