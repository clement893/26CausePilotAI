'use client';

/**
 * Page création utilisateur - Étape 1.1.4
 * Header, breadcrumb, UserForm, createUserAction, toast, redirect
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import { UserForm } from '@/components/admin/users';
import { createUserAction } from '@/app/actions/admin/users/create';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { useToast } from '@/lib/toast';
import type { CreateUserInput, UpdateUserInput } from '@/lib/validations/admin-users';

export default function AdminNewUserPage() {
  const router = useRouter();
  const { success } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    data: CreateUserInput | UpdateUserInput
  ): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      const result = await createUserAction(data as CreateUserInput, token ?? undefined);
      if (result?.error) {
        return { error: result.error };
      }
      success('Utilisateur créé avec succès');
      router.push('/admin/users');
      router.refresh();
      return {};
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedSuperAdminRoute>
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
            <Link href="/admin" className="hover:text-white">
              Admin
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/admin/users" className="hover:text-white">
              Utilisateurs
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Nouveau</span>
          </nav>

          <div className="mb-6 flex items-center gap-4">
            <Link
              href="/admin/users"
              className="rounded-lg border border-white/10 p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5 hover:text-white"
              aria-label="Retour à la liste"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Ajouter un utilisateur</h1>
              <p className="mt-1 text-sm text-[var(--text-secondary,#A0A0B0)]">
                Créez un nouveau compte utilisateur
              </p>
            </div>
          </div>

          <UserForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/users')}
            submitLabel="Créer l'utilisateur"
            loading={loading}
          />
        </div>
      </div>
    </ProtectedSuperAdminRoute>
  );
}
