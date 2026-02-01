'use client';

/**
 * UserForm - Étape 1.1.4
 * Formulaire réutilisable création / édition : RHF + Zod, strength indicator, rôle, annuler / soumettre
 */

import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthInput, AuthButton, PasswordStrengthIndicator } from '@/components/auth';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type AdminUserRole,
} from '@/lib/validations/admin-users';
import { clsx } from 'clsx';

const ROLE_DESCRIPTIONS: Record<AdminUserRole, string> = {
  ADMIN: 'Accès complet (CRUD utilisateurs, paramètres, etc.)',
  DIRECTOR: 'Lecture seule sur les utilisateurs et tableaux de bord',
  MANAGER: 'Aucun accès à l’administration des utilisateurs',
};

interface UserFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateUserInput> | Partial<UpdateUserInput>;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<{ error?: string }>;
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
  /** En mode édition : champs lecture seule (createdAt, lastLoginAt, updatedAt) */
  meta?: {
    createdAt?: string;
    lastLoginAt?: string | null;
    updatedAt?: string;
  };
}

export function UserForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
  meta,
}: UserFormProps) {
  const isEdit = mode === 'edit';
  const schema = isEdit ? updateUserSchema : createUserSchema;
  const [changePassword, setChangePassword] = useState(false);

  type FormValues = CreateUserInput | UpdateUserInput;
  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- union of create/update schema
    resolver: zodResolver(schema as any) as Resolver<FormValues>,
    defaultValues: (defaultValues ?? {}) as FormValues,
  });

  const password = form.watch('password') as string | undefined;
  const role = form.watch('role') as AdminUserRole | undefined;

  const handleSubmit = form.handleSubmit(async (data: FormValues) => {
    if (isEdit) {
      const updateData = data as UpdateUserInput;
      if (!changePassword) {
        (updateData as Record<string, unknown>).password = undefined;
        (updateData as Record<string, unknown>).confirmPassword = undefined;
      }
    }
    const result = await onSubmit(data);
    if (result?.error) {
      form.setError('root', { message: result.error });
      return;
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {form.formState.errors.root && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {form.formState.errors.root.message}
        </div>
      )}

      {/* Section 1 : Informations personnelles */}
      <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Informations personnelles
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthInput
            label="Prénom"
            fullWidth
            {...form.register('firstName')}
            error={form.formState.errors.firstName?.message}
          />
          <AuthInput
            label="Nom"
            fullWidth
            {...form.register('lastName')}
            error={form.formState.errors.lastName?.message}
          />
          <div className="sm:col-span-2">
            <AuthInput
              label="Email"
              type="email"
              fullWidth
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
          </div>
          <div className="sm:col-span-2">
            <AuthInput
              label="Téléphone (optionnel)"
              fullWidth
              {...form.register('phone')}
              error={form.formState.errors.phone?.message}
            />
          </div>
          <div className="sm:col-span-2">
            <AuthInput
              label="Avatar URL (optionnel)"
              fullWidth
              {...form.register('avatar')}
              error={form.formState.errors.avatar?.message}
            />
          </div>
        </div>
      </div>

      {/* Section 2 : Authentification */}
      <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Authentification</h3>
        {isEdit ? (
          <>
            <label className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="rounded border-white/20 bg-[var(--background-tertiary,#1C1C26)]"
              />
              <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">
                Modifier le mot de passe
              </span>
            </label>
            {changePassword && (
              <div className="space-y-4">
                <AuthInput
                  label="Nouveau mot de passe"
                  type="password"
                  fullWidth
                  {...form.register('password')}
                  error={form.formState.errors.password?.message}
                />
                <div>
                  <PasswordStrengthIndicator
                    password={(form.watch('password') as string) ?? ''}
                    className="mt-2"
                  />
                </div>
                <AuthInput
                  label="Confirmer le mot de passe"
                  type="password"
                  fullWidth
                  {...form.register('confirmPassword')}
                  error={form.formState.errors.confirmPassword?.message}
                />
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <AuthInput
              label="Mot de passe"
              type="password"
              fullWidth
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />
            <PasswordStrengthIndicator password={password ?? ''} className="mt-2" />
            <AuthInput
              label="Confirmer le mot de passe"
              type="password"
              fullWidth
              {...form.register('confirmPassword')}
              error={form.formState.errors.confirmPassword?.message}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...form.register('sendInvitation')}
                className="rounded border-white/20 bg-[var(--background-tertiary,#1C1C26)]"
              />
              <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">
                Envoyer un email d&apos;invitation
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Section 3 : Rôle et permissions */}
      <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Rôle et permissions</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
              Rôle
            </label>
            <select
              {...form.register('role')}
              className={clsx(
                'w-full rounded-lg border bg-[var(--background-tertiary,#1C1C26)] px-4 py-3 text-[var(--text-primary,#FFF)]',
                'border-[var(--background-elevated,#252532)] focus:border-[var(--color-info,#3B82F6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info,#3B82F6)]/30'
              )}
            >
              <option value="ADMIN">Admin</option>
              <option value="DIRECTOR">Directeur</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          {role && (
            <p className="text-sm text-[var(--text-tertiary,#6B6B7B)]">
              {ROLE_DESCRIPTIONS[role as AdminUserRole]}
            </p>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...form.register('isActive')}
              className="rounded border-white/20 bg-[var(--background-tertiary,#1C1C26)]"
            />
            <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">
              Utilisateur actif
            </span>
          </label>
        </div>
      </div>

      {/* Meta (édition uniquement) */}
      {isEdit && meta && (meta.createdAt || meta.lastLoginAt || meta.updatedAt) && (
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Informations supplémentaires
          </h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {meta.createdAt && (
              <>
                <dt className="text-[var(--text-tertiary,#6B6B7B)]">Date de création</dt>
                <dd className="text-[var(--text-primary,#FFF)]">{meta.createdAt}</dd>
              </>
            )}
            {meta.lastLoginAt != null && (
              <>
                <dt className="text-[var(--text-tertiary,#6B6B7B)]">Dernière connexion</dt>
                <dd className="text-[var(--text-primary,#FFF)]">
                  {meta.lastLoginAt || '—'}
                </dd>
              </>
            )}
            {meta.updatedAt && (
              <>
                <dt className="text-[var(--text-tertiary,#6B6B7B)]">Dernière modification</dt>
                <dd className="text-[var(--text-primary,#FFF)]">{meta.updatedAt}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <AuthButton type="button" variant="outline" onClick={onCancel}>
          Annuler
        </AuthButton>
        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {submitLabel ?? (isEdit ? 'Enregistrer' : 'Créer l\'utilisateur')}
        </AuthButton>
      </div>
    </form>
  );
}
