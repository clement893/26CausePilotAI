'use server';

/**
 * Action de login - Étape 1.1.3
 * Valide avec Zod et signIn NextAuth (credentials)
 */

import { signIn } from '@/lib/auth';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';

export async function loginAction(data: LoginInput) {
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    const first = validated.error.flatten().fieldErrors;
    const msg =
      first.email?.[0] ?? first.password?.[0] ?? 'Données invalides';
    return { error: msg };
  }

  const result = await signIn('credentials', {
    email: validated.data.email,
    password: validated.data.password,
    redirect: false,
  });

  if (result?.error) {
    return { error: 'Email ou mot de passe incorrect' };
  }
  return { success: true };
}
