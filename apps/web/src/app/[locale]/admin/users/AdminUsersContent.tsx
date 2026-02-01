'use client';

/**
 * Gestion des utilisateurs - Étape 1.1.4
 * Liste, filtres (recherche, rôle, statut), pagination, actions (Edit, Activer/Désactiver, Supprimer)
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api/client';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { getErrorMessage } from '@/lib/errors';
import { AuthButton } from '@/components/auth';
import { UserFilters, UserTable, DeleteUserModal } from '@/components/admin/users';
import type { AdminUserRow } from '@/components/admin/users/UserTable';
import type { RoleFilter, StatusFilter } from '@/components/admin/users/UserFilters';
import { deleteUserAction } from '@/app/actions/admin/users/delete';
import { toggleUserStatusAction } from '@/app/actions/admin/users/toggle-status';
import { ChevronRight, UserPlus } from 'lucide-react';

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

interface PaginatedResponse {
  items?: BackendUser[];
  total?: number;
  page?: number;
  page_size?: number;
}

export default function AdminUsersContent() {
  const { data: session } = useSession();
  const canEdit = session?.user?.role === 'ADMIN';

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserRow | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('page_size', String(pageSize));
      if (search) params.set('search', search);
      if (statusFilter === 'active') params.set('is_active', 'true');
      if (statusFilter === 'inactive') params.set('is_active', 'false');

      const res = await apiClient.get<PaginatedResponse>(`/v1/users?${params.toString()}`);
      const data = res.data;
      const items = data?.items ?? [];
      const totalCount = data?.total ?? items.length;

      setUsers(
        items.map((u) => ({
          id: String(u.id),
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name,
          is_active: u.is_active,
          role: u.role,
          last_login_at: u.last_login_at,
          created_at: u.created_at,
          updated_at: u.updated_at,
        }))
      );
      setTotal(totalCount);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des utilisateurs'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const hasActiveFilters =
    search !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const handleEdit = (user: AdminUserRow) => {
    window.location.href = `/admin/users/${user.id}/edit`;
  };

  const handleToggleStatus = async (user: AdminUserRow) => {
    const token = TokenStorage.getToken();
    const result = await toggleUserStatusAction(
      user.id,
      user.is_active,
      token ?? undefined
    );
    if (result.error) {
      setError(result.error);
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, is_active: result.isActive ?? !u.is_active } : u
      )
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;
    const token = TokenStorage.getToken();
    const result = await deleteUserAction(deleteModalUser.id, token ?? undefined);
    if (result.error) {
      setError(result.error);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
    setTotal((t) => Math.max(0, t - 1));
    setDeleteModalUser(null);
  };

  const activeCount = users.filter((u) => u.is_active).length;

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Utilisateurs</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary,#A0A0B0)]">
              {total} utilisateur{total !== 1 ? 's' : ''} au total
              {typeof activeCount === 'number' && ` · ${activeCount} actifs`}
            </p>
          </div>
          {canEdit && (
            <Link href="/admin/users/new">
              <AuthButton variant="primary" icon={<UserPlus className="h-4 w-4" />}>
                Ajouter un utilisateur
              </AuthButton>
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="mb-6 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
          <UserFilters
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Table */}
        <UserTable
          users={users}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={setDeleteModalUser}
          canEdit={canEdit ?? false}
          loading={loading}
        />
      </div>

      <DeleteUserModal
        isOpen={!!deleteModalUser}
        onClose={() => setDeleteModalUser(null)}
        onConfirm={handleDeleteConfirm}
        userName={
          deleteModalUser
            ? [deleteModalUser.first_name, deleteModalUser.last_name].filter(Boolean).join(' ')
            : undefined
        }
        userEmail={deleteModalUser?.email ?? ''}
      />
    </div>
  );
}
