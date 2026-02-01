/**
 * Auth Helpers
 * Helper functions for authentication and authorization
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Get organization ID for the current user
 */
export async function getOrganizationId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  return user?.organizationId || null;
}

/**
 * Get current user session with organization ID
 */
export async function getCurrentUserWithOrg() {
  const session = await getServerSession();
  if (!session?.user) {
    return null;
  }

  const organizationId = await getOrganizationId(session.user.id);

  return {
    ...session.user,
    organizationId,
  };
}
