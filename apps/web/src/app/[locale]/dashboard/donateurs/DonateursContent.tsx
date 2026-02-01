'use client';

/**
 * Base de Données Donateurs - Étape 1.2.1
 * Liste, recherche, filtres, KPIs, table avec tri/sélection, actions en vrac, pagination.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { listDonors, type ListDonorsParams } from '@/lib/api/donors';
import { getErrorMessage } from '@/lib/errors';
import {
  DonatorTable,
  DonatorFilters,
  DonatorKPICards,
  BulkActionsBar,
  type DonatorFiltersType,
} from '@/components/donators';
import type { Donor } from '@modele/types';
import { ChevronRight, Plus, Upload, Download, Users, UserPlus, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from '@/lib/toast';
import { Button } from '@/components/ui';

const DEBOUNCE_MS = 300;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export default function DonateursContent() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { info } = useToast();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<DonatorFiltersType>({});
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const buildParams = useCallback((): ListDonorsParams => {
    const params: ListDonorsParams = {
      organizationId: activeOrganization!.id,
      page,
      pageSize: limit,
      search: searchQuery || undefined,
    };
    if (filters.quickFilter === 'active') params.isActive = true;
    if (filters.quickFilter === 'inactive') params.isActive = false;
    if (filters.quickFilter === 'vip') params.tags = ['vip'];
    if (filters.minTotalDonations != null)
      params.minTotalDonated = String(filters.minTotalDonations);
    if (filters.maxTotalDonations != null)
      params.maxTotalDonated = String(filters.maxTotalDonations);
    return params;
  }, [activeOrganization, page, limit, searchQuery, filters]);

  const fetchDonors = useCallback(async () => {
    if (!activeOrganization) return;
    setLoading(true);
    setError(null);
    try {
      const params = buildParams();
      const res = await listDonors(params);
      const items = res.items ?? [];
      const totalCount = res.total ?? items.length;
      setDonors(items);
      setTotal(totalCount);
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors du chargement des donateurs'));
      setDonors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, buildParams]);

  useEffect(() => {
    if (!activeOrganization) return;
    fetchDonors();
  }, [activeOrganization, fetchDonors]);

  useEffect(() => {
    if (!activeOrganization) return;
    setPage(1);
    fetchDonors();
  }, [searchQuery, filters.quickFilter, filters.minTotalDonations, filters.maxTotalDonations]);

  const handleSearch = (query: string) => {
    setSearchInput(query);
    setPage(1);
  };
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = (newFilters: DonatorFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSortBy(column);
    setSortOrder(order);
    setPage(1);
    fetchDonors();
  };

  const handleExport = useCallback(() => {
    info('Export en préparation…');
  }, [info]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Supprimer ${selectedIds.length} donateur(s) ? Cette action est irréversible.`)) return;
    setSelectedIds([]);
    info('Suppression en cours…');
    fetchDonors();
  }, [selectedIds.length, info, fetchDonors]);

  const kpis = useMemo(() => {
    const totalDonated = donors.reduce((sum, d) => sum + parseFloat(d.total_donated || '0'), 0);
    const avg = donors.length > 0 ? totalDonated / donors.length : 0;
    const withMultiple = donors.filter((d) => (d.donation_count ?? 0) >= 2).length;
    const retention = donors.length > 0 ? (withMultiple / donors.length) * 100 : 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCount = donors.filter(
      (d) => d.created_at && new Date(d.created_at) >= thirtyDaysAgo
    ).length;
    return {
      totalActive: {
        value: total,
        label: 'Total donateurs actifs',
        trend: undefined,
        gradient: 'bg-blue-500/20 text-blue-400',
        icon: <Users className="h-5 w-5" />,
      },
      newThisMonth: {
        value: newCount,
        label: 'Nouveaux ce mois',
        trend: undefined,
        gradient: 'bg-green-500/20 text-green-400',
        icon: <UserPlus className="h-5 w-5" />,
      },
      retentionRate: {
        value: `${retention.toFixed(0)}%`,
        label: 'Taux de rétention',
        trend: undefined,
        gradient: 'bg-cyan-500/20 text-cyan-400',
        icon: <TrendingUp className="h-5 w-5" />,
      },
      averageValue: {
        value: formatCurrency(avg),
        label: 'Valeur moyenne par donateur',
        trend: undefined,
        gradient: 'bg-amber-500/20 text-amber-400',
        icon: <DollarSign className="h-5 w-5" />,
      },
    };
  }, [donors, total]);

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Aucune organisation active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Donateurs</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Base de Données Donateurs</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary,#A0A0B0)]">
              Gérez et segmentez vos donateurs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/dashboard/donateurs/new">
                <Upload className="h-4 w-4" />
                Importer CSV
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              asChild
            >
              <Link href="/dashboard/donateurs/new">
                <Plus className="h-4 w-4" />
                Ajouter un donateur
              </Link>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-8">
          <DonatorKPICards
            totalActive={kpis.totalActive}
            newThisMonth={kpis.newThisMonth}
            retentionRate={kpis.retentionRate}
            averageValue={kpis.averageValue}
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="mb-6 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-4">
          <DonatorFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            activeFilters={{ ...filters, search: searchInput }}
          />
        </div>

        {/* Table */}
        <DonatorTable
          donators={donors}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSelect={setSelectedIds}
          selectedIds={selectedIds}
          isLoading={loading}
          basePath="/dashboard/donateurs"
        />
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onSendEmail={() => info('Envoi d’email en préparation…')}
        onAddToSegment={() => info('Ajout à un segment en préparation…')}
        onExport={handleExport}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
}
