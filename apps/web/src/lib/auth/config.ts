/**
 * NextAuth Configuration - Étape 1.1.2
 * Credentials (email/password) + Google OAuth, multi-tenant (organizationId, role)
 */

import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { logger } from '@/lib/logger';

function getApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000';
  return url.replace(/\/$/, '');
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const apiUrl = getApiUrl();
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: String(credentials.email),
              password: String(credentials.password),
            }),
          });
          if (!res.ok) return null;
          const data = (await res.json()) as {
            user?: {
              id?: string;
              email?: string;
              first_name?: string;
              last_name?: string;
              name?: string;
              is_active?: boolean;
              organization_id?: string;
              organization_is_active?: boolean;
              role?: string;
            };
          };
          const user = data?.user;
          if (!user?.email) return null;
          if (user.is_active === false) return null;
          if (user.organization_is_active === false) return null;
          const name =
            user.name ?? ([user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.email);
          return {
            id: String(user.id ?? ''),
            email: user.email,
            name: name || undefined,
            firstName: user.first_name ?? null,
            lastName: user.last_name ?? null,
            role: (user.role as 'ADMIN' | 'DIRECTOR' | 'MANAGER' | undefined) ?? undefined,
            organizationId: user.organization_id ?? undefined,
          } as import('next-auth').User;
        } catch (e) {
          logger.warn('Credentials authorize failed', e);
          return null;
        }
      },
    }) as never,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }) as never,
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },
  callbacks: {
    // Prevent NextAuth from redirecting on its own (avoids redirect param + loop). Our middleware handles redirects with callbackUrl.
    authorized: async () => true,
    async jwt({ token, user, account }) {
      if (account && user) {
        const u = user as {
          id?: string;
          email?: string;
          name?: string | null;
          image?: string | null;
          role?: string;
          organizationId?: string;
          firstName?: string | null;
          lastName?: string | null;
        };
        return {
          ...token,
          userId: u.id ?? token.sub,
          email: u.email ?? token.email,
          role: u.role as 'ADMIN' | 'DIRECTOR' | 'MANAGER' | undefined,
          organizationId: u.organizationId,
          firstName: u.firstName ?? null,
          lastName: u.lastName ?? null,
          accessToken: account.access_token as string | undefined,
          refreshToken: account.refresh_token as string | undefined,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          user: {
            id: u.id ?? '',
            email: u.email ?? '',
            name: u.name ?? '',
            image: u.image ?? null,
          },
        };
      }
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.user?.id ?? (token.sub as string) ?? '';
        session.user.role = token.role as 'ADMIN' | 'DIRECTOR' | 'MANAGER' | undefined;
        session.user.organizationId = token.organizationId;
        session.user.firstName = token.firstName ?? null;
        session.user.lastName = token.lastName ?? null;
        session.accessToken = token.accessToken as string | undefined;
        session.error = token.error as string | undefined;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') ?? [];
        if (allowedDomains.length > 0 && user.email) {
          const domain = user.email.split('@')[1];
          if (domain && !allowedDomains.includes(domain)) return false;
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Allow same-origin callbackUrl (e.g. /fr/dashboard) after OAuth
      if (url.startsWith('/')) return `${baseUrl.replace(/\/$/, '')}${url}`;
      try {
        if (new URL(url).origin === new URL(baseUrl).origin) return url;
      } catch {
        // ignore invalid URL
      }
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (2592000 seconds)
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(token: {
  refreshToken?: string;
  accessToken?: string;
  accessTokenExpires?: number;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  error?: string;
}) {
  try {
    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + refreshedTokens.expiresIn * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    logger.error(
      'Error refreshing access token',
      error instanceof Error ? error : new Error(String(error)),
      {
        hasRefreshToken: !!token.refreshToken,
        type: 'auth',
      }
    );

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
