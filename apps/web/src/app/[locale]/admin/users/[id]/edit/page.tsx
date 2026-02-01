'use client';

/**
 * Page édition utilisateur - Étape 1.1.4
 * Header, breadcrumb, UserForm (mode edit), updateUserAction, toast, bouton Supprimer
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api/client';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { getErrorMessage } from '@/lib/errors';
import { AuthButton } from '@/components/auth';
import { UserForm } from '@/components/admin/users';
import { updateUserAction } from '@/app/actions/admin/users/update';
import { deleteUserAction } from '@/app/actions/admin/users/delete';
import { useToast } from '@/lib/toast';
import { ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import { DeleteUserModal } from '@/components/admin/users';
import type { UpdateUserInput } from '@/lib/validations/admin-users';

interface BackendUser {
  id: number;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string | null;
  role?: string;
  phone?: string;
  avatar?: string | null;
}

function formatDate(s: string | undefined | null): string {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return s;
  }
}

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: session } = useSession();
  const canEdit = session?.user?.role === 'ADMIN';
  const { success, error: showError } = useToast();

  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<BackendUser>(`/v1/users/${id}`);
        setUser(res.data ?? null);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err, 'Utilisateur introuvable'));
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (
    data: UpdateUserInput
  ): Promise<{ error?: string }> => {
    if (!id) return {};
    setSubmitLoading(true);
    try {
      const token = TokenStorage.getToken();
      const result = await updateUserAction(id, data, token ?? undefined);
      if (result?.error) {
        return { error: result.error };
      }
      success('Utilisateur mis à jour');
      router.push(`/admin/users/${id}`);
      router.refresh();
      return {};
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    const token = TokenStorage.getToken();
    const result = await deleteUserAction(id, token ?? undefined);
    if (result?.error) {
      showError(result.error);
      return;
    }
    success('Utilisateur supprimé');
    router.push('/admin/users');
    router.refresh();
  };

  if (loading) {
    return (
      <ProtectedSuperAdminRoute>
        <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="animate-pulse rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-8">
              <div className="mb-4 h-8 w-48 rounded bg-white/10" />
              <div className="h-64 rounded bg-white/10" />
            </div>
          </div>
        </div>
      </ProtectedSuperAdminRoute>
    );
  }

  if (error || !user) {
    return (
      <ProtectedSuperAdminRoute>
        <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-500">
              {error ?? 'Utilisateur introuvable'}
            </div>
            <Link
              href="/admin/users"
              className="mt-4 inline-block text-[var(--color-info,#3B82F6)] hover:underline"
            >
              Retour à la liste
            </Link>
          </div>
        </div>
      </ProtectedSuperAdminRoute>
    );
  }

  const defaultValues: UpdateUserInput = {
    firstName: user.first_name ?? '',
    lastName: user.last_name ?? '',
    email: user.email,
    phone: user.phone ?? '',
    avatar: user.avatar ?? '',
    role: (user.role as UpdateUserInput['role']) ?? 'MANAGER',
    isActive: user.is_active,
  };

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

  return (
    <ProtectedSuperAdminRoute>
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/admin/users" className="hover:text-white">Utilisateurs</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/admin/users/${user.id}`} className="hover:text-white">
              {displayName}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Modifier</span>
          </nav>

          <div className="mb-6 flex items-center gap-4">
            <Link
              href={`/admin/users/${user.id}`}
              className="rounded-lg border border-white/10 p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5 hover:text-white"
              aria-label="Retour au profil"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Modifier l&apos;utilisateur</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary,#A0A0B0)]">
                {displayName}
              </p>
            </div>
          </div>

          <UserForm
            mode="edit"
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/admin/users/${user.id}`)}
            submitLabel="Enregistrer"
            loading={submitLoading}
            meta={{
              createdAt: formatDate(user.created_at),
              lastLoginAt: user.last_login_at,
              updatedAt: formatDate(user.updated_at),
            }}
          />

          {canEdit && (
            <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <h3 className="mb-2 text-sm font-semibold text-red-400">Zone de danger</h3>
              <p className="mb-4 text-sm text-[var(--text-secondary,#A0A0B0)]">
                La suppression est irréversible.
              </p>
              <AuthButton
                variant="primary"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setDeleteModalOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer l&apos;utilisateur
              </AuthButton>
            </div>
          )}
        </div>
      </div>

      <DeleteUserModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={displayName}
        userEmail={user.email}
      />
    </ProtectedSuperAdminRoute>
  );
}
