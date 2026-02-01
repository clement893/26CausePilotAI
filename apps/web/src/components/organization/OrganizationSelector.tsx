'use client';

/**
 * Organization Selector Component
 *
 * Dropdown selector for switching between organizations.
 * Displayed in the Sidebar for SuperAdmins.
 */

import { useState, useEffect } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { ChevronDown, Building, Check } from 'lucide-react';
import { clsx } from 'clsx';

export default function OrganizationSelector() {
  const {
    activeOrganization,
    availableOrganizations,
    enabledModules,
    isLoading,
    loadOrganizations,
    switchOrganization,
  } = useOrganization();

  const [isOpen, setIsOpen] = useState(false);

  // Load organizations on mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  if (isLoading && (!availableOrganizations || availableOrganizations.length === 0)) {
    return (
      <div className="px-lg py-md border-b border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Building className="w-4 h-4 animate-pulse" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (!activeOrganization) {
    return null;
  }

  const handleSelectOrganization = async (orgId: string) => {
    setIsOpen(false);
    if (orgId !== activeOrganization.id) {
      await switchOrganization(orgId);
      // Reload page to refresh navigation with new modules
      window.location.reload();
    }
  };

  return (
    <div className="px-lg py-md border-b border-gray-800">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            'glass-effect bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30',
            'border border-blue-500/50 text-white'
          )}
          aria-expanded={isOpen}
          aria-label="Sélectionner une organisation"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <span className="truncate">{activeOrganization.name}</span>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 flex-shrink-0 transition-transform text-gray-400',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Menu */}
            <div className="absolute top-full left-0 right-0 mt-1 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {(availableOrganizations || []).map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrganization(org.id)}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors',
                    org.id === activeOrganization.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white font-medium border-l-2 border-blue-500'
                      : 'hover:bg-[#252532] text-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Building className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{org.name}</span>
                  </div>
                  {org.id === activeOrganization.id && (
                    <Check className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Module count badge */}
      <div className="mt-2 text-xs text-gray-400">
        {(enabledModules || []).length} module{(enabledModules || []).length !== 1 ? 's' : ''} activé
        {(enabledModules || []).length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
