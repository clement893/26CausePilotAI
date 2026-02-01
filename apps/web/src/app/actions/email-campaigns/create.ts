'use server';

/**
 * createEmailCampaignAction - Étape 3.1.3
 * Crée une campagne email (DRAFT).
 */

import { prisma } from '@/lib/db';

export interface CreateCampaignInput {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateId: string;
  audienceId: string;
  scheduledAt?: string | null; // ISO date string si planifié
}

export async function createEmailCampaignAction(
  organizationId: string,
  input: CreateCampaignInput
): Promise<{ error?: string; id?: string }> {
  try {
    const [template, audience] = await Promise.all([
      prisma.emailTemplate.findFirst({ where: { id: input.templateId, organizationId } }),
      prisma.audience.findFirst({ where: { id: input.audienceId, organizationId } }),
    ]);
    if (!template) return { error: 'Template introuvable' };
    if (!audience) return { error: 'Audience introuvable' };

    const status = input.scheduledAt ? 'SCHEDULED' : 'DRAFT';
    const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;

    const campaign = await prisma.emailCampaign.create({
      data: {
        organizationId,
        name: input.name,
        subject: input.subject,
        fromName: input.fromName,
        fromEmail: input.fromEmail,
        templateId: input.templateId,
        audienceId: input.audienceId,
        status,
        scheduledAt,
        stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 },
      },
    });
    return { id: campaign.id };
  } catch (e) {
    console.error('[createEmailCampaignAction]', e);
    return { error: 'Erreur lors de la création' };
  }
}
