'use client';

/**
 * UserFilters - Étape 1.1.4
 * Recherche, filtre rôle, filtre statut, bouton reset
 */

import { AuthInput, AuthButton } from '@/components/auth';
import type { AdminUserRole } from '@/lib/validations/admin-users';

export type RoleFilter = 'all' | AdminUserRole;
export type StatusFilter = 'all' | 'active' | 'inactive';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (value: RoleFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Tous les rôles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DIRECTOR', label: 'Directeur' },
  { value: 'MANAGER', label: 'Manager' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
];

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
  hasActiveFilters,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex-1">
        <AuthInput
          label="Recherche"
          placeholder="Nom ou email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
        />
      </div>
      <div className="w-full sm:w-40">
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
          Rôle
        </label>
        <select
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value as RoleFilter)}
          className="w-full rounded-lg border border-[var(--background-elevated,#252532)] bg-[var(--background-tertiary,#1C1C26)] px-4 py-3 text-[var(--text-primary,#FFF)] focus:border-[var(--color-info,#3B82F6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info,#3B82F6)]/30"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-40">
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
          Statut
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
          className="w-full rounded-lg border border-[var(--background-elevated,#252532)] bg-[var(--background-tertiary,#1C1C26)] px-4 py-3 text-[var(--text-primary,#FFF)] focus:border-[var(--color-info,#3B82F6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info,#3B82F6)]/30"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {hasActiveFilters && (
        <AuthButton variant="outline" onClick={onReset}>
          Réinitialiser
        </AuthButton>
      )}
    </div>
  );
}
