/**
 * Server session utilities - Étape 1.1.2
 * For Server Components and Route Handlers
 */

import { auth } from '@/lib/auth/core';
import type { Role } from '@/types/next-auth';

export async function getServerSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const role = session.user?.role;
  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Forbidden');
  }
  return session;
}
