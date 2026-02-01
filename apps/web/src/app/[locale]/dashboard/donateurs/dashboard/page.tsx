'use client';

/**
 * Dashboard Donateurs - Étape 4.1.2
 * KPIs et graphiques pour le module Donateurs (LTV, nouveaux, etc.).
 */

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { PageHeader } from '@/components/layout';
import { DonatorsDashboard } from '@/components/dashboard';
import { useOrganization } from '@/hooks/useOrganization';
import { Link } from '@/i18n/routing';
import { LoadingSkeleton } from '@/components/ui';
import { ChevronRight } from 'lucide-react';

export default function DonateursDashboardPage() {
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
        <Link href="/dashboard/donateurs" className="hover:text-white">Donateurs</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white">Tableau de bord</span>
      </nav>
      <PageHeader
        title="Tableau de bord Donateurs"
        description="Vue d'ensemble des donateurs et de la valeur à vie"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Donateurs', href: '/dashboard/donateurs' },
          { label: 'Tableau de bord', href: '/dashboard/donateurs/dashboard' },
        ]}
      />
      <DonatorsDashboard organizationId={activeOrganization.id} />
    </div>
  );
}
