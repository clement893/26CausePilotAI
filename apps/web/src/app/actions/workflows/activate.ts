'use server';

/**
 * activateWorkflowAction - Étape 3.3.2
 * Active ou désactive un workflow (DRAFT <-> ACTIVE).
 */

import { prisma } from '@/lib/db';

export async function activateWorkflowAction(
  workflowId: string,
  organizationId: string,
  active: boolean
): Promise<{ error?: string }> {
  try {
    const row = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
    });
    if (!row) return { error: 'Workflow introuvable' };
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: active ? 'ACTIVE' : 'DRAFT' },
    });
    return {};
  } catch (e) {
    console.error('[activateWorkflowAction]', e);
    return { error: 'Erreur lors de l\'activation' };
  }
}
