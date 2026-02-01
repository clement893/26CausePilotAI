'use server';

/**
 * Action création utilisateur (admin) - Étape 1.1.4
 * Vérifie rôle ADMIN, valide avec createUserSchema, appelle POST /v1/auth/register
 * (le backend n'a pas POST /v1/users; on utilise register)
 */

import { auth } from '@/lib/auth/core';
import { createUserSchema, type CreateUserInput } from '@/lib/validations/admin-users';
import { revalidatePath } from 'next/cache';

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function createUserAction(
  data: CreateUserInput,
  bearerToken?: string
): Promise<{ success?: true; userId?: string; error?: string }> {
  const session = await auth();
  if (!session || session.user?.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first =
      msg.firstName?.[0] ??
      msg.lastName?.[0] ??
      msg.email?.[0] ??
      msg.password?.[0] ??
      msg.confirmPassword?.[0] ??
      'Données invalides';
    return { error: first };
  }

  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: JSON.stringify({
      email: parsed.data.email,
      password: parsed.data.password,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
    }),
    cache: 'no-store',
  });

  const json = (await res.json().catch(() => ({}))) as { id?: string; detail?: string };
  if (!res.ok) {
    const detail = Array.isArray(json.detail)
      ? (json.detail as { msg?: string }[]).map((d) => d.msg).join(', ')
      : typeof json.detail === 'string'
        ? json.detail
        : res.statusText;
    return { error: detail };
  }
  revalidatePath('/admin/users');
  return { success: true, userId: json.id };
}
