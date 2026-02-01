'use server';

/**
 * getWorkflowAction - Étape 3.3.2
 * Récupère un workflow par ID pour l'organisation.
 */

import { prisma } from '@/lib/db';

export interface WorkflowDraft {
  id: string;
  name: string;
  status: string;
  nodes: unknown;
  edges: unknown;
}

export async function getWorkflowAction(
  workflowId: string,
  organizationId: string
): Promise<{ error?: string; workflow?: WorkflowDraft }> {
  try {
    const row = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId },
    });
    if (!row) return { error: 'Workflow introuvable' };
    return {
      workflow: {
        id: row.id,
        name: row.name,
        status: row.status,
        nodes: row.nodes as unknown,
        edges: row.edges as unknown,
      },
    };
  } catch (e) {
    console.error('[getWorkflowAction]', e);
    return { error: 'Erreur lors du chargement' };
  }
}
