'use server';

/**
 * executeWorkflowAction - Étape 3.3.2
 * Exécute un workflow (appelé par un cron job ou un déclencheur).
 * Pour l'instant : stub qui enregistre l'exécution ; les actions réelles
 * (email, SMS, etc.) seront branchées ultérieurement.
 */

import { prisma } from '@/lib/db';

export interface ExecuteContext {
  donatorId?: string;
  triggerType?: string;
  payload?: Record<string, unknown>;
}

export async function executeWorkflowAction(
  workflowId: string,
  organizationId: string,
  context: ExecuteContext
): Promise<{ error?: string }> {
  try {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId, status: 'ACTIVE' },
    });
    if (!workflow) return { error: 'Workflow introuvable ou inactif' };

    const nodes = (workflow.nodes as Array<{ id: string; type?: string; data?: Record<string, unknown> }>) ?? [];
    const edges = (workflow.edges as Array<{ source: string; target: string }>) ?? [];

    // TODO: parcourir le graphe à partir du déclencheur, exécuter les actions (email, SMS, wait, add_to_segment)
    // Pour l'instant on ne fait rien d'autre que vérifier que le workflow existe et est actif.
    void nodes;
    void edges;
    void context;

    return {};
  } catch (e) {
    console.error('[executeWorkflowAction]', e);
    return { error: 'Erreur lors de l\'exécution' };
  }
}
