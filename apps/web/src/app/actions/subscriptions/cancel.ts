'use server';

/**
 * cancelSubscriptionAction - Étape 2.2.4
 * Annule un abonnement (dons récurrents).
 */

import { prisma } from '@/lib/db';

/** Match Prisma SubscriptionStatus enum (schema in packages/database/prisma) */
const SUBSCRIPTION_CANCELLED = 'CANCELLED' as const;

export async function cancelSubscriptionAction(
  subscriptionId: string,
  reason?: string
): Promise<{ success?: true; error?: string }> {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!sub) return { error: 'Abonnement introuvable' };
    if (sub.status === SUBSCRIPTION_CANCELLED) {
      return { error: 'Abonnement déjà annulé' };
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SUBSCRIPTION_CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason ?? null,
      },
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de l’annulation';
    return { error: message };
  }
}
