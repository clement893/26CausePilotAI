/**
 * Recherche d'images Unsplash pour l'éditeur email (Étape 3.1.2)
 * Utilise la clé API côté serveur (UNSPLASH_ACCESS_KEY).
 */

import { createApi } from 'unsplash-js';
import { NextRequest, NextResponse } from 'next/server';

const accessKey = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }
  if (!accessKey) {
    return NextResponse.json({ error: 'Unsplash not configured' }, { status: 503 });
  }
  try {
    const unsplash = createApi({ accessKey });
    const result = await unsplash.search.getPhotos({
      query: q.trim(),
      perPage: 10,
      orientation: 'landscape',
    });
    const urls =
      result.response?.results?.map((p) => ({
        url: p.urls?.regular ?? p.urls?.small ?? p.urls?.thumb ?? '',
      })) ?? [];
    return NextResponse.json(urls);
  } catch (e) {
    console.error('[unsplash/search]', e);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
