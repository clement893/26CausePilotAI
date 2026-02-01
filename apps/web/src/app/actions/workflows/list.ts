'use server';

/**
 * listWorkflowsAction - Étape 3.3.2
 * Liste les workflows de l'organisation.
 */

import { prisma } from '@/lib/db';

export interface WorkflowRow {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
}

export async function listWorkflowsAction(
  organizationId: string
): Promise<{ error?: string; workflows?: WorkflowRow[] }> {
  try {
    const rows = await prisma.workflow.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
    });
    type WorkflowRowInput = (typeof rows)[number];
    const workflows: WorkflowRow[] = rows.map((r: WorkflowRowInput) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      createdAt: r.createdAt,
    }));
    return { workflows };
  } catch (e) {
    console.error('[listWorkflowsAction]', e);
    return { error: 'Erreur lors du chargement' };
  }
}
