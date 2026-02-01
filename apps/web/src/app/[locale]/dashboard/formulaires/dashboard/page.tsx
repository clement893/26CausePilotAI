'use client';

/**
 * Dashboard Formulaires - Étape 4.1.2
 * KPIs et graphiques pour le module Formulaires (formulaires de don).
 */

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { PageHeader } from '@/components/layout';
import { FormsDashboard } from '@/components/dashboard';
import { useOrganization } from '@/hooks/useOrganization';
import { Link } from '@/i18n/routing';
import { LoadingSkeleton } from '@/components/ui';
import { ChevronRight } from 'lucide-react';

export default function FormulairesDashboardPage() {
  const { activeOrganization, isLoading } = useOrganization();

  if (isLoading || !activeOrganization) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="custom" className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/formulaires" className="hover:text-white">Formulaires</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white">Tableau de bord</span>
      </nav>
      <PageHeader
        title="Tableau de bord Formulaires"
        description="Vue d'ensemble des formulaires de don"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Formulaires', href: '/dashboard/formulaires' },
          { label: 'Tableau de bord', href: '/dashboard/formulaires/dashboard' },
        ]}
      />
      <FormsDashboard organizationId={activeOrganization.id} />
    </div>
  );
}
