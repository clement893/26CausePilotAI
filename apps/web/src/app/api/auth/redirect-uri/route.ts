/**
 * Returns the Google OAuth redirect URI used by NextAuth (server-side).
 * Use this to copy the exact URI into Google Cloud Console → Authorized redirect URIs.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CALLBACK_PATH = '/api/auth/callback/google';

export async function GET(request: NextRequest) {
  // Same logic NextAuth uses: NEXTAUTH_URL first, then infer from request (trustHost)
  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (request.headers.get('x-forwarded-proto') && request.headers.get('x-forwarded-host')
      ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('x-forwarded-host')}`
      : request.nextUrl.origin);

  const redirectUri = `${base}${CALLBACK_PATH}`;

  return NextResponse.json({
    redirect_uri: redirectUri,
    base_url: base,
    message:
      'Add the redirect_uri above exactly in Google Cloud Console → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs.',
  });
}
