/**
 * API route donateurs - Étape 1.2.1
 * Proxy GET vers le backend pour liste donateurs (recherche, filtres, pagination).
 */

import { NextRequest, NextResponse } from 'next/server';
function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function GET(request: NextRequest) {
  try {
    const organizationId = request.nextUrl.searchParams.get('organizationId');
    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId requis' },
        { status: 400 }
      );
    }
    const searchParams = request.nextUrl.searchParams;
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'organizationId') params.set(key, value);
    });
    const apiUrl = getApiUrl();
    const url = `${apiUrl}/api/v1/organizations/${organizationId}/donors?${params.toString()}`;
    const authHeader = request.headers.get('authorization');
    const res = await fetch(url, {
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching donators:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des donateurs' },
      { status: 500 }
    );
  }
}
