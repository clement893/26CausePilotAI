'use server';

/**
 * listEmailTemplatesAction - Étape 3.1.2
 * Liste les templates email de l'organisation.
 */

import { prisma } from '@/lib/db';

export interface EmailTemplateRow {
  id: string;
  name: string;
  description: string | null;
}

export async function listEmailTemplatesAction(
  organizationId: string
): Promise<{ error?: string; templates?: EmailTemplateRow[] }> {
  try {
    const rows = await prisma.emailTemplate.findMany({
      where: { organizationId },
      select: { id: true, name: true, description: true },
      orderBy: { updatedAt: 'desc' },
    });
    return { templates: rows };
  } catch (e) {
    console.error('[listEmailTemplatesAction]', e);
    return { error: 'Erreur lors du chargement' };
  }
}
