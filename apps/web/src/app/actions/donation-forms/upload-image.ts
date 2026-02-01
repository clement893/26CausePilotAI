'use server';

/**
 * uploadImageAction - Étape 2.1.3
 * Upload une image (logo, couverture) et retourne l'URL.
 * Utilise le backend POST /api/v1/upload ou équivalent.
 */

import { auth } from '@/lib/auth/core';

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function uploadImageAction(
  formData: FormData
): Promise<{ success?: true; url?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const file = formData.get('file') as File | null;
  if (!file?.size) {
    return { error: 'Aucun fichier' };
  }

  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return { error: 'Type de fichier non autorisé (JPEG, PNG, GIF, WebP)' };
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) {
    return { error: 'Fichier trop volumineux (max 5 Mo)' };
  }

  try {
    const apiUrl = getApiUrl();
    const body = new FormData();
    body.append('file', file);

    const res = await fetch(`${apiUrl}/api/v1/upload`, {
      method: 'POST',
      body,
      cache: 'no-store',
    });

    const json = (await res.json().catch(() => ({}))) as { url?: string; detail?: string };
    if (!res.ok) {
      return { error: typeof json.detail === 'string' ? json.detail : 'Erreur upload' };
    }
    const url = json.url ?? (typeof json === 'object' && 'url' in json ? String((json as { url?: string }).url) : undefined);
    return url ? { success: true, url } : { error: 'URL non retournée' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
