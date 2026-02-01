'use client';

/**
 * Dashboard Campagnes - Étape 4.1.2
 * KPIs et graphiques pour le module Campagnes (campagnes email).
 */

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { PageHeader } from '@/components/layout';
import { CampaignsDashboard } from '@/components/dashboard';
import { useOrganization } from '@/hooks/useOrganization';
import { Link } from '@/i18n/routing';
import { LoadingSkeleton } from '@/components/ui';
import { ChevronRight } from 'lucide-react';

export default function CampagnesDashboardPage() {
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
        <Link href="/dashboard/campagnes" className="hover:text-white">Campagnes</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white">Tableau de bord</span>
      </nav>
      <PageHeader
        title="Tableau de bord Campagnes"
        description="Vue d'ensemble des campagnes email"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campagnes', href: '/dashboard/campagnes' },
          { label: 'Tableau de bord', href: '/dashboard/campagnes/dashboard' },
        ]}
      />
      <CampaignsDashboard organizationId={activeOrganization.id} />
    </div>
  );
}
