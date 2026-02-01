'use server';

/**
 * Action suppression utilisateur - Étape 1.1.4
 * Vérifie rôle ADMIN, appelle DELETE /v1/users/:id
 */

import { auth } from '@/lib/auth/core';
import { revalidatePath } from 'next/cache';

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function deleteUserAction(
  userId: string,
  bearerToken?: string
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }
  if (session.user?.id === userId) {
    return { error: 'Vous ne pouvez pas supprimer votre propre compte' };
  }

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/users/${userId}`, {
    method: 'DELETE',
    headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
    cache: 'no-store',
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const detail = (json as { detail?: string }).detail ?? res.statusText;
    return { error: detail };
  }
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
