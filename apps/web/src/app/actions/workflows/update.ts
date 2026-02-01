'use server';

/**
 * updateWorkflowAction - Étape 3.3.2
 * Met à jour le nom et le graphe (nodes, edges) d'un workflow.
 */

import { prisma } from '@/lib/db';

export async function updateWorkflowAction(
  workflowId: string,
  organizationId: string,
  payload: { name?: string; nodes?: unknown; edges?: unknown }
): Promise<{ error?: string }> {
  try {
    const row = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
    });
    if (!row) return { error: 'Workflow introuvable' };
    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        ...(payload.name != null && { name: payload.name }),
        ...(payload.nodes != null && { nodes: payload.nodes as object }),
        ...(payload.edges != null && { edges: payload.edges as object }),
      },
    });
    return {};
  } catch (e) {
    console.error('[updateWorkflowAction]', e);
    return { error: 'Erreur lors de la sauvegarde' };
  }
}
