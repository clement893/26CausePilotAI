'use client';

/**
 * DonatorFilters - Étape 1.2.1
 * Recherche, chips (Tous, VIP, Actifs, Inactifs, Nouveaux), bouton Filtres avancés (drawer), Réinitialiser
 */

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { DonatorFilters as DonatorFiltersType } from './types';

export interface DonatorFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: DonatorFiltersType) => void;
  activeFilters: DonatorFiltersType;
  searchPlaceholder?: string;
}

const QUICK_FILTERS: { value: DonatorFiltersType['quickFilter']; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'vip', label: 'VIP' },
  { value: 'active', label: 'Actifs' },
  { value: 'inactive', label: 'Inactifs' },
  { value: 'new', label: 'Nouveaux (< 30 j)' },
];

export function DonatorFilters({
  onSearch,
  onFilterChange,
  activeFilters,
  searchPlaceholder = 'Rechercher par nom, email, téléphone...',
}: DonatorFiltersProps) {
  const searchValue = activeFilters.search ?? '';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [advanced, setAdvanced] = useState({
    minTotalDonations: activeFilters.minTotalDonations ?? '',
    maxTotalDonations: activeFilters.maxTotalDonations ?? '',
    minDonationCount: activeFilters.minDonationCount ?? '',
    maxDonationCount: activeFilters.maxDonationCount ?? '',
  });

  const handleSearchSubmit = () => {
    onSearch(searchValue.trim());
    onFilterChange({ ...activeFilters, search: searchValue.trim() });
  };

  const handleQuickFilter = (quickFilter: DonatorFiltersType['quickFilter']) => {
    onFilterChange({ ...activeFilters, quickFilter: quickFilter ?? 'all' });
  };

  const handleReset = () => {
    onSearch('');
    onFilterChange({});
    setAdvanced({
      minTotalDonations: '',
      maxTotalDonations: '',
      minDonationCount: '',
      maxDonationCount: '',
    });
    onSearch('');
    onFilterChange({});
  };

  const hasActiveFilters =
    (activeFilters.search && activeFilters.search.length > 0) ||
    (activeFilters.quickFilter && activeFilters.quickFilter !== 'all') ||
    activeFilters.minTotalDonations != null ||
    activeFilters.maxTotalDonations != null ||
    activeFilters.minDonationCount != null ||
    activeFilters.maxDonationCount != null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary,#6B6B7B)]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] py-2.5 pl-10 pr-4 text-[var(--text-primary,#FFF)] placeholder-[var(--text-disabled,#4A4A5A)] focus:border-[var(--color-info,#3B82F6)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info,#3B82F6)]/30"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary,#FFF)] hover:bg-white/5"
          >
            <Filter className="h-4 w-4" />
            Filtres avancés
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5"
            >
              <X className="h-4 w-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleQuickFilter(value)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              activeFilters.quickFilter === value
                ? 'bg-[var(--color-info,#3B82F6)] text-white'
                : 'bg-[var(--background-elevated,#252532)] text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Drawer Filtres avancés */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-[var(--background-secondary,#13131A)] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-lg font-semibold text-white">Filtres avancés</h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                  Montant total (min – max)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={advanced.minTotalDonations}
                    onChange={(e) =>
                      setAdvanced((a) => ({
                        ...a,
                        minTotalDonations: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    placeholder="Min"
                    className="w-full rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    value={advanced.maxTotalDonations}
                    onChange={(e) =>
                      setAdvanced((a) => ({
                        ...a,
                        maxTotalDonations: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    placeholder="Max"
                    className="w-full rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">
                  Nombre de dons (min – max)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={advanced.minDonationCount}
                    onChange={(e) =>
                      setAdvanced((a) => ({
                        ...a,
                        minDonationCount: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    placeholder="Min"
                    className="w-full rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    value={advanced.maxDonationCount}
                    onChange={(e) =>
                      setAdvanced((a) => ({
                        ...a,
                        maxDonationCount: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    placeholder="Max"
                    className="w-full rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onFilterChange({
                      ...activeFilters,
                      minTotalDonations:
                        advanced.minTotalDonations === '' ? undefined : Number(advanced.minTotalDonations),
                      maxTotalDonations:
                        advanced.maxTotalDonations === '' ? undefined : Number(advanced.maxTotalDonations),
                      minDonationCount:
                        advanced.minDonationCount === '' ? undefined : Number(advanced.minDonationCount),
                      maxDonationCount:
                        advanced.maxDonationCount === '' ? undefined : Number(advanced.maxDonationCount),
                    });
                    setDrawerOpen(false);
                  }}
                  className="rounded-lg bg-[var(--color-info,#3B82F6)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
