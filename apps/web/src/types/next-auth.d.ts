/**
 * NextAuth Type Extensions
 * Étape 1.1.2 - Extends NextAuth types for multi-tenant session (organizationId, role, firstName, lastName)
 */

import 'next-auth';
import 'next-auth/jwt';

/** Rôles cahier des charges Section 2.4 - Matrice des Permissions */
export type Role = 'ADMIN' | 'DIRECTOR' | 'MANAGER' | 'SUPER_ADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: Role;
      organizationId?: string;
      firstName?: string | null;
      lastName?: string | null;
    };
    accessToken?: string;
    error?: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: Role;
    organizationId?: string;
    firstName?: string | null;
    lastName?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: Role;
    organizationId?: string;
    firstName?: string | null;
    lastName?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
    error?: string;
  }
}
