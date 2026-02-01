'use server';

/**
 * updateEmailTemplateAction - Étape 3.1.2
 * Met à jour le contenu et le HTML d'un template email.
 */

import { prisma } from '@/lib/db';

export async function updateEmailTemplateAction(
  templateId: string,
  organizationId: string,
  payload: { content: unknown; html: string }
): Promise<{ error?: string }> {
  try {
    const row = await prisma.emailTemplate.findFirst({
      where: { id: templateId, organizationId },
    });
    if (!row) return { error: 'Template introuvable' };
    await prisma.emailTemplate.update({
      where: { id: templateId },
      data: { content: payload.content as object, html: payload.html },
    });
    return {};
  } catch (e) {
    console.error('[updateEmailTemplateAction]', e);
    return { error: 'Erreur lors de la sauvegarde' };
  }
}
