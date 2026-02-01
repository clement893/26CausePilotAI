'use server';

/**
 * createEmailTemplateAction - Étape 3.1.2
 * Crée un nouveau template email (vide) pour l'organisation.
 */

import { prisma } from '@/lib/db';

export async function createEmailTemplateAction(
  organizationId: string,
  name: string = 'Nouveau template'
): Promise<{ error?: string; id?: string }> {
  try {
    const row = await prisma.emailTemplate.create({
      data: {
        organizationId,
        name,
        description: null,
        content: { blocks: [] },
        html: '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body></body></html>',
        thumbnail: null,
      },
    });
    return { id: row.id };
  } catch (e) {
    console.error('[createEmailTemplateAction]', e);
    return { error: 'Erreur lors de la création' };
  }
}
