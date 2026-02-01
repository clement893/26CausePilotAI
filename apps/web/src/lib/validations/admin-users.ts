/**
 * Schémas de validation Zod - Étape 1.1.4
 * Admin users (create, update)
 */

import { z } from 'zod';

const roleEnum = z.enum(['ADMIN', 'DIRECTOR', 'MANAGER']);

export const createUserSchema = z
  .object({
    firstName: z.string().min(2, 'Prénom trop court'),
    lastName: z.string().min(2, 'Nom trop court'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
    avatar: z.string().url().optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[a-z]/, 'Doit contenir une minuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre'),
    confirmPassword: z.string(),
    role: roleEnum,
    isActive: z.boolean().default(true),
    sendInvitation: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    firstName: z.string().min(2, 'Prénom trop court'),
    lastName: z.string().min(2, 'Nom trop court'),
    email: z.string().email('Email invalide'),
    phone: z.string().optional(),
    avatar: z.string().url().optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Doit contenir une majuscule')
      .regex(/[a-z]/, 'Doit contenir une minuscule')
      .regex(/[0-9]/, 'Doit contenir un chiffre')
      .optional()
      .or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
    role: roleEnum,
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.password) return true;
      return data.password === data.confirmPassword;
    },
    { message: 'Les mots de passe ne correspondent pas', path: ['confirmPassword'] }
  );

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type AdminUserRole = z.infer<typeof roleEnum>;
