/**
 * Authentication Module - Étape 1.1.2
 * NextAuth handlers, auth(), and server/client utilities
 */

export { auth, handlers, signIn, signOut } from './core';

// Re-export types
export type { Session, User } from 'next-auth';
export type { JWT } from 'next-auth/jwt';

// Re-export server session utilities (Étape 1.1.2)
export { getServerSession, requireAuth, requireRole } from './get-session';

// Re-export password utilities
export { hashPassword, verifyPassword } from './password';

// Re-export JWT utilities
export * from './jwt';
