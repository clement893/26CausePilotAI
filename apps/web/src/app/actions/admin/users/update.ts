'use server';

/**
 * Action mise à jour utilisateur - Étape 1.1.4
 * Vérifie rôle ADMIN, valide avec updateUserSchema, appelle PUT /v1/users/:id
 */

import { auth } from '@/lib/auth/core';
import { updateUserSchema, type UpdateUserInput } from '@/lib/validations/admin-users';
import { revalidatePath } from 'next/cache';

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function updateUserAction(
  userId: string,
  data: UpdateUserInput,
  bearerToken?: string
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }

  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first = msg.firstName?.[0] ?? msg.lastName?.[0] ?? msg.email?.[0] ?? msg.confirmPassword?.[0] ?? 'Données invalides';
    return { error: first };
  }

  const payload: Record<string, unknown> = {
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone ?? undefined,
    avatar: parsed.data.avatar || undefined,
    is_active: parsed.data.isActive,
  };

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: JSON.stringify(payload),
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
