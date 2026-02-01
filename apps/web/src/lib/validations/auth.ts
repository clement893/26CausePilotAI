/**
 * Schémas de validation Zod - Étape 1.1.3
 * Auth (login, register)
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Prénom trop court'),
    lastName: z.string().min(2, 'Nom trop court'),
    email: z.string().email('Email invalide'),
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[a-z]/, 'Doit contenir une minuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre')
      .regex(/[^A-Za-z0-9]/, 'Doit contenir un caractère spécial'),
    confirmPassword: z.string(),
    organizationName: z.string().min(2, "Nom d'organisation trop court"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
