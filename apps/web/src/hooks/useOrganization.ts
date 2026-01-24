/**
 * useOrganization Hook
 *
 * Custom hook for accessing organization context
 */

import { useEffect } from 'react';
import { useOrganizationStore } from '@/lib/store/organizationStore';
import type { ModuleKey } from '@modele/types';

export function useOrganization() {
  const {
    activeOrganization,
    availableOrganizations,
    enabledModules,
    userRole,
    isLoading,
    error,
    loadOrganizations,
    switchOrganization,
    loadActiveContext,
    clearOrganization,
  } = useOrganizationStore();

  // Load active context on mount
  useEffect(() => {
    if (!activeOrganization) {
      loadActiveContext();
    }
  }, []);

  // Check if a module is enabled
  const isModuleEnabled = (moduleKey: ModuleKey): boolean => {
    return enabledModules.includes(moduleKey);
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  // Check if user is superadmin
  const isSuperAdmin = (): boolean => {
    return userRole === 'superadmin';
  };

  return {
    // State
    activeOrganization,
    availableOrganizations,
    enabledModules,
    userRole,
    isLoading,
    error,

    // Actions
    loadOrganizations,
    switchOrganization,
    loadActiveContext,
    clearOrganization,

    // Helpers
    isModuleEnabled,
    hasRole,
    isSuperAdmin,
  };
}
