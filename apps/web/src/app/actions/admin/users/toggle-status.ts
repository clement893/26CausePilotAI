'use server';

/**
 * Action bascule statut utilisateur (actif/inactif) - Étape 1.1.4
 * Vérifie rôle ADMIN, appelle PUT /v1/users/:id avec is_active
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

export async function toggleUserStatusAction(
  userId: string,
  currentIsActive: boolean,
  bearerToken?: string
): Promise<{ success?: true; isActive?: boolean; error?: string }> {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }
  if (session.user?.id === userId) {
    return { error: 'Vous ne pouvez pas désactiver votre propre compte' };
  }

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: JSON.stringify({ is_active: !currentIsActive }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const detail = (json as { detail?: string }).detail ?? res.statusText;
    return { error: detail };
  }
  const json = (await res.json()) as { is_active?: boolean };
  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, isActive: json.is_active ?? !currentIsActive };
}
