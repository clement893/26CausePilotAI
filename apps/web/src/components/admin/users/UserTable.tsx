'use client';

/**
 * UserTable - Étape 1.1.4
 * Table avec avatar+nom, email, rôle, statut, lastLoginAt, actions, pagination, empty state
 */

import { useState } from 'react';
import { Pencil, Power, Trash2, User as UserIcon } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import type { AdminUserRole } from '@/lib/validations/admin-users';

export interface AdminUserRow {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active: boolean;
  role?: AdminUserRole | string;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
  avatar?: string | null;
}

interface UserTableProps {
  users: AdminUserRow[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (user: AdminUserRow) => void;
  onToggleStatus: (user: AdminUserRow) => void;
  onDelete: (user: AdminUserRow) => void;
  canEdit: boolean;
  loading?: boolean;
}

const PAGE_SIZES = [10, 25, 50, 100];

function formatDate(s: string | null | undefined): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function UserTable({
  users,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onToggleStatus,
  onDelete,
  canEdit,
  loading = false,
}: UserTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u.id)));
  };

  const fullName = (u: AdminUserRow) =>
    [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)]">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-info,#3B82F6)] border-t-transparent" />
        </div>
      )}
      {!loading && users.length === 0 && (
        <div className="py-12 text-center text-[var(--text-secondary,#A0A0B0)]">
          Aucun utilisateur trouvé.
        </div>
      )}
      {!loading && users.length > 0 && (
        <>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {canEdit && (
                  <th className="w-10 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === users.length}
                      onChange={toggleSelectAll}
                      className="rounded border-white/20"
                      aria-label="Tout sélectionner"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                  Dernière connexion
                </th>
                {canEdit && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 transition hover:bg-white/5"
                >
                  {canEdit && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-white/20"
                        aria-label={`Sélectionner ${fullName(user)}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--background-elevated,#252532)]">
                          <UserIcon className="h-4 w-4 text-[var(--text-tertiary,#6B6B7B)]" />
                        </div>
                      )}
                      <span className="font-medium text-[var(--text-primary,#FFF)]">
                        {fullName(user)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary,#A0A0B0)]">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role ?? 'MANAGER'} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={user.is_active} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary,#A0A0B0)]">
                    {formatDate(user.last_login_at ?? undefined)}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="rounded p-1.5 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white"
                          aria-label="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(user)}
                          className="rounded p-1.5 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white"
                          aria-label={user.is_active ? 'Désactiver' : 'Activer'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(user)}
                          className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-3 sm:flex-row">
            <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">
              Affichage de {start} à {end} sur {total} utilisateurs
            </p>
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded border border-white/20 bg-[var(--background-tertiary,#1C1C26)] px-3 py-1.5 text-sm text-white"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} / page
                  </option>
                ))}
              </select>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded border border-white/20 bg-[var(--background-tertiary,#1C1C26)] px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded border border-white/20 bg-[var(--background-tertiary,#1C1C26)] px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
