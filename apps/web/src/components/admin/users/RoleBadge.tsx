'use client';

/**
 * RoleBadge - Étape 1.1.4
 * Badge coloré par rôle : ADMIN (bleu-violet), DIRECTOR (vert-cyan), MANAGER (orange-rose)
 */

import { clsx } from 'clsx';
import type { AdminUserRole } from '@/lib/validations/admin-users';

const roleLabels: Record<AdminUserRole, string> = {
  ADMIN: 'Admin',
  DIRECTOR: 'Directeur',
  MANAGER: 'Manager',
};

const roleClasses: Record<AdminUserRole, string> = {
  ADMIN: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
  DIRECTOR: 'bg-gradient-to-r from-green-500 to-cyan-500 text-white',
  MANAGER: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white',
};

interface RoleBadgeProps {
  role: AdminUserRole | string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const r = role as AdminUserRole;
  const label = roleLabels[r] ?? role;
  const styleClass = roleClasses[r] ?? 'bg-gray-600 text-white';

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        styleClass,
        className
      )}
    >
      {label}
    </span>
  );
}
