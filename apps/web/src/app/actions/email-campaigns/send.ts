'use server';

/**
 * sendEmailCampaignAction - Étape 3.1.3
 * Envoie une campagne (immédiat ou planifié) : met à jour le statut et sentAt.
 * L'envoi réel des emails serait branché sur un service (SendGrid, etc.).
 */

import { prisma } from '@/lib/db';

export async function sendEmailCampaignAction(
  campaignId: string,
  organizationId: string
): Promise<{ error?: string }> {
  try {
    const campaign = await prisma.emailCampaign.findFirst({
      where: { id: campaignId, organizationId },
      include: { audience: { include: { donators: true } } },
    });
    if (!campaign) return { error: 'Campagne introuvable' };
    if (campaign.status === 'SENT') return { error: 'Campagne déjà envoyée' };
    if (campaign.status === 'SENDING') return { error: 'Envoi en cours' };

    const recipientCount = campaign.audience.donators?.length ?? 0;
    const stats = (campaign.stats as Record<string, unknown>) ?? {};
    const newStats = {
      ...stats,
      sent: recipientCount,
      delivered: recipientCount,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    };

    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        scheduledAt: null,
        stats: newStats,
      },
    });

    // TODO: brancher envoi réel (SendGrid, etc.) et tracking ouvertures/clics
    return {};
  } catch (e) {
    console.error('[sendEmailCampaignAction]', e);
    return { error: 'Erreur lors de l\'envoi' };
  }
}
