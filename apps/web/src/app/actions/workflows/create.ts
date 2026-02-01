'use server';

/**
 * createWorkflowAction - Étape 3.3.2
 * Crée un workflow (DRAFT).
 */

import { prisma } from '@/lib/db';

export async function createWorkflowAction(
  organizationId: string,
  name: string = 'Nouveau workflow'
): Promise<{ error?: string; id?: string }> {
  try {
    const row = await prisma.workflow.create({
      data: {
        organizationId,
        name,
        status: 'DRAFT',
        nodes: [],
        edges: [],
      },
    });
    return { id: row.id };
  } catch (e) {
    console.error('[createWorkflowAction]', e);
    return { error: 'Erreur lors de la création' };
  }
}
