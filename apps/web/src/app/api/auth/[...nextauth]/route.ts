/**
 * NextAuth API Route Handler - Étape 1.1.2
 * Handles all authentication requests (signin, signout, callback, etc.)
 */

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
