'use client';

/**
 * Page profil utilisateur (vue détaillée) - Étape 1.1.4
 * Header (avatar, nom, badges), Cards (infos, activité, permissions), actions Modifier / Désactiver / Supprimer
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api/client';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { getErrorMessage } from '@/lib/errors';
import { AuthButton } from '@/components/auth';
import { RoleBadge, StatusBadge, DeleteUserModal } from '@/components/admin/users';
import { deleteUserAction } from '@/app/actions/admin/users/delete';
import { toggleUserStatusAction } from '@/app/actions/admin/users/toggle-status';
import { ChevronRight, User, Mail, Phone, Calendar, LogIn, Edit, Power, Trash2 } from 'lucide-react';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';

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
}

function formatDate(s: string | undefined | null): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString('fr-FR', {
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

export default function AdminUserViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: session } = useSession();
  const canEdit = session?.user?.role === 'ADMIN';

  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleToggleStatus = async () => {
    if (!user || !canEdit) return;
    const token = TokenStorage.getToken();
    const result = await toggleUserStatusAction(
      String(user.id),
      user.is_active,
      token ?? undefined
    );
    if (result.error) {
      setError(result.error);
      return;
    }
    setUser((prev) =>
      prev ? { ...prev, is_active: result.isActive ?? !prev.is_active } : null
    );
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;
    const token = TokenStorage.getToken();
    const result = await deleteUserAction(String(user.id), token ?? undefined);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push('/admin/users');
    router.refresh();
  };

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email
    : '';

  if (loading) {
    return (
      <ProtectedSuperAdminRoute>
        <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="animate-pulse rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-8">
              <div className="mb-4 h-16 w-16 rounded-full bg-white/10" />
              <div className="mb-2 h-6 w-48 rounded bg-white/10" />
              <div className="h-4 w-32 rounded bg-white/10" />
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
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-500">
              {error ?? 'Utilisateur introuvable'}
            </div>
            <Link href="/admin/users" className="mt-4 inline-block text-[var(--color-info,#3B82F6)] hover:underline">
              Retour à la liste
            </Link>
          </div>
        </div>
      </ProtectedSuperAdminRoute>
    );
  }

  return (
    <ProtectedSuperAdminRoute>
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
            <Link href="/admin" className="hover:text-white">Admin</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/admin/users" className="hover:text-white">Utilisateurs</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{displayName}</span>
          </nav>

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-start gap-6 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background-tertiary,#1C1C26)] text-2xl text-[var(--text-tertiary,#6B6B7B)]">
              {user.first_name?.[0] ?? user.email[0]?.toUpperCase() ?? <User className="h-8 w-8" />}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.role && <RoleBadge role={user.role} />}
                <StatusBadge isActive={user.is_active} />
              </div>
              {canEdit && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/users/${user.id}/edit`}>
                    <AuthButton variant="outline" icon={<Edit className="h-4 w-4" />}>
                      Modifier
                    </AuthButton>
                  </Link>
                  <AuthButton
                    variant="outline"
                    icon={<Power className="h-4 w-4" />}
                    onClick={handleToggleStatus}
                  >
                    {user.is_active ? 'Désactiver' : 'Activer'}
                  </AuthButton>
                  <AuthButton
                    variant="primary"
                    icon={<Trash2 className="h-4 w-4" />}
                    onClick={() => setDeleteModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Supprimer
                  </AuthButton>
                </div>
              )}
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <User className="h-5 w-5 text-[var(--text-tertiary,#6B6B7B)]" />
                Informations personnelles
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <dt className="flex items-center gap-1.5 text-[var(--text-tertiary,#6B6B7B)]">
                    <Mail className="h-4 w-4" /> Email
                  </dt>
                  <dd className="text-[var(--text-primary,#FFF)]">{user.email}</dd>
                </div>
                {(user as { phone?: string }).phone && (
                  <div className="flex gap-2">
                    <dt className="flex items-center gap-1.5 text-[var(--text-tertiary,#6B6B7B)]">
                      <Phone className="h-4 w-4" /> Téléphone
                    </dt>
                    <dd className="text-[var(--text-primary,#FFF)]">
                      {(user as { phone?: string }).phone}
                    </dd>
                  </div>
                )}
                {user.role && (
                  <div className="flex gap-2">
                    <dt className="text-[var(--text-tertiary,#6B6B7B)]">Rôle</dt>
                    <dd><RoleBadge role={user.role} /></dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="text-[var(--text-tertiary,#6B6B7B)]">Statut</dt>
                  <dd><StatusBadge isActive={user.is_active} /></dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Calendar className="h-5 w-5 text-[var(--text-tertiary,#6B6B7B)]" />
                Activité
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <dt className="flex items-center gap-1.5 text-[var(--text-tertiary,#6B6B7B)]">
                    <Calendar className="h-4 w-4" /> Date de création
                  </dt>
                  <dd className="text-[var(--text-primary,#FFF)]">
                    {formatDate(user.created_at)}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="flex items-center gap-1.5 text-[var(--text-tertiary,#6B6B7B)]">
                    <LogIn className="h-4 w-4" /> Dernière connexion
                  </dt>
                  <dd className="text-[var(--text-primary,#FFF)]">
                    {formatDate(user.last_login_at)}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-[var(--text-tertiary,#6B6B7B)]">Dernière modification</dt>
                  <dd className="text-[var(--text-primary,#FFF)]">
                    {formatDate(user.updated_at)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Permissions card */}
          {user.role && (
            <div className="mt-6 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Permissions</h2>
              <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">
                Les permissions sont définies selon le rôle <RoleBadge role={user.role} /> (voir
                cahier des charges section 2.4).
              </p>
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
