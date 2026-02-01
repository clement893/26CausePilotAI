'use server';

/**
 * resumeSubscriptionAction - Étape 2.2.4
 * Reprend un abonnement en pause.
 */

import { prisma } from '@/lib/db';

/** Match Prisma SubscriptionStatus enum (schema in packages/database/prisma) */
const SUBSCRIPTION_PAUSED = 'PAUSED' as const;
const SUBSCRIPTION_ACTIVE = 'ACTIVE' as const;

export async function resumeSubscriptionAction(
  subscriptionId: string
): Promise<{ success?: true; error?: string }> {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!sub) return { error: 'Abonnement introuvable' };
    if (sub.status !== SUBSCRIPTION_PAUSED) {
      return { error: 'Seul un abonnement en pause peut être repris' };
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SUBSCRIPTION_ACTIVE },
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de la reprise';
    return { error: message };
  }
}
