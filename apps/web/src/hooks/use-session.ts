/**
 * NextAuth session hooks - Étape 1.1.2
 * Client Components: useSession, useUser, useOrganization from session
 */

'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

export function useSession() {
  return useNextAuthSession();
}

export function useUser() {
  const { data: session } = useSession();
  return session?.user;
}

export function useOrganization() {
  const user = useUser();
  return user?.organizationId;
}
