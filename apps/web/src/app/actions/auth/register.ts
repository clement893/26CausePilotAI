'use server';

/**
 * Action de register - Étape 1.1.3
 * Valide avec Zod et appelle l'API backend (pas Prisma dans web).
 * organizationName est conservé pour usage futur (création org côté backend).
 */

import { registerSchema, type RegisterInput } from '@/lib/validations/auth';

function getApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000';
  return url.replace(/\/$/, '');
}

export async function registerAction(data: RegisterInput) {
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    const flat = validated.error.flatten().fieldErrors;
    const msg =
      flat.firstName?.[0] ??
      flat.lastName?.[0] ??
      flat.email?.[0] ??
      flat.password?.[0] ??
      flat.confirmPassword?.[0] ??
      flat.organizationName?.[0] ??
      flat.acceptTerms?.[0] ??
      'Données invalides';
    return { error: msg };
  }

  const apiUrl = getApiUrl();
  const body = {
    email: validated.data.email,
    password: validated.data.password,
    first_name: validated.data.firstName,
    last_name: validated.data.lastName,
  };

  try {
    const res = await fetch(`${apiUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as { detail?: string };
    if (!res.ok) {
      const message =
        Array.isArray(json.detail)
          ? json.detail.map((d: { msg?: string }) => d.msg).join(', ')
          : typeof json.detail === 'string'
            ? json.detail
            : 'Erreur lors de l\'inscription';
      return { error: message };
    }
    return { success: true };
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : 'Erreur de connexion au serveur',
    };
  }
}
