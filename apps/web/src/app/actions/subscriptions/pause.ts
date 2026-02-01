'use server';

/**
 * pauseSubscriptionAction - Étape 2.2.4
 * Met en pause un abonnement (dons récurrents).
 */

import { prisma } from '@/lib/db';

/** Match Prisma SubscriptionStatus enum (schema in packages/database/prisma) */
const SUBSCRIPTION_ACTIVE = 'ACTIVE' as const;
const SUBSCRIPTION_PAUSED = 'PAUSED' as const;

export async function pauseSubscriptionAction(
  subscriptionId: string
): Promise<{ success?: true; error?: string }> {
  try {
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!sub) return { error: 'Abonnement introuvable' };
    if (sub.status !== SUBSCRIPTION_ACTIVE) {
      return { error: 'Seul un abonnement actif peut être mis en pause' };
    }

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SUBSCRIPTION_PAUSED },
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de la mise en pause';
    return { error: message };
  }
}
