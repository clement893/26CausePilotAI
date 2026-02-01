'use server';

/**
 * getEmailTemplateAction - Étape 3.1.2
 * Récupère un template email par ID pour l'organisation active.
 */

import { prisma } from '@/lib/db';

export interface EmailTemplateDraft {
  id: string;
  name: string;
  description: string | null;
  content: unknown;
  html: string;
  thumbnail: string | null;
}

export async function getEmailTemplateAction(
  templateId: string,
  organizationId: string
): Promise<{ error?: string; template?: EmailTemplateDraft }> {
  try {
    const row = await prisma.emailTemplate.findFirst({
      where: { id: templateId, organizationId },
    });
    if (!row) return { error: 'Template introuvable' };
    return {
      template: {
        id: row.id,
        name: row.name,
        description: row.description,
        content: row.content as unknown,
        html: row.html,
        thumbnail: row.thumbnail,
      },
    };
  } catch (e) {
    console.error('[getEmailTemplateAction]', e);
    return { error: 'Erreur lors du chargement du template' };
  }
}
