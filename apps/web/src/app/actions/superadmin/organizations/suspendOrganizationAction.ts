'use server';

/**
 * Server Action: Suspend Organization
 * Étape 7.1.2 - Gestion des organisations (Super Admin)
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { logSystemEvent } from '@/lib/logging/systemLogger';

export interface SuspendOrganizationParams {
  id: string;
  reason?: string;
}

export interface SuspendOrganizationResult {
  success: boolean;
}

export async function suspendOrganizationAction(
  params: SuspendOrganizationParams
): Promise<SuspendOrganizationResult> {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const { id, reason } = params;

  // Update organization and subscription in a transaction
  await prisma.$transaction(async (tx) => {
    // Deactivate organization
    await tx.organization.update({
      where: { id },
      data: { isActive: false },
    });

    // Update subscription status to CANCELED
    await tx.organizationSubscription.updateMany({
      where: { organizationId: id },
      data: { status: 'CANCELED' },
    });
  });

  // Log the event
  await logSystemEvent({
    type: 'organization',
    level: 'warning',
    message: `Organization suspended: ${id}`,
    organizationId: id,
    userId: session.user.id,
    details: {
      reason: reason || 'No reason provided',
    },
  });

  return { success: true };
}
