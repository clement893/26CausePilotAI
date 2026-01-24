/**
 * Organization Store
 *
 * Zustand store for managing organization state (multi-tenant)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Organization,
  OrganizationWithStats,
  ModuleKey,
} from '@modele/types';
import {
  listOrganizations,
  getActiveOrganizationContext,
} from '@/lib/api/organizations';
import { logger } from '@/lib/logger';

interface OrganizationState {
  // Current state
  activeOrganization: Organization | null;
  availableOrganizations: OrganizationWithStats[];
  enabledModules: ModuleKey[];
  userRole: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveOrganization: (org: Organization) => void;
  loadOrganizations: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  loadActiveContext: (orgId?: string) => Promise<void>;
  clearOrganization: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      // Initial state
      activeOrganization: null,
      availableOrganizations: [],
      enabledModules: [],
      userRole: null,
      isLoading: false,
      error: null,

      // Set active organization
      setActiveOrganization: (org: Organization) => {
        logger.debug('Setting active organization', { orgId: org.id, orgName: org.name });
        set({ activeOrganization: org });
      },

      // Load all available organizations (SuperAdmin)
      loadOrganizations: async () => {
        try {
          set({ isLoading: true, error: null });
          logger.debug('Loading organizations');

          const response = await listOrganizations(0, 100);
          
          logger.debug('Organizations loaded', { count: response.items.length });
          set({
            availableOrganizations: response.items,
            isLoading: false,
          });
        } catch (error) {
          logger.error('Failed to load organizations', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load organizations',
            isLoading: false,
          });
        }
      },

      // Switch to a different organization
      switchOrganization: async (orgId: string) => {
        try {
          set({ isLoading: true, error: null });
          logger.debug('Switching organization', { orgId });

          const context = await getActiveOrganizationContext(orgId);
          
          logger.debug('Organization context loaded', {
            orgId,
            enabledModules: context.enabledModules,
            userRole: context.userRole,
          });

          set({
            activeOrganization: context.organization,
            enabledModules: context.enabledModules as ModuleKey[],
            userRole: context.userRole,
            isLoading: false,
          });
        } catch (error) {
          logger.error('Failed to switch organization', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to switch organization',
            isLoading: false,
          });
        }
      },

      // Load active organization context
      loadActiveContext: async (orgId?: string) => {
        try {
          set({ isLoading: true, error: null });
          logger.debug('Loading active organization context', { orgId });

          const context = await getActiveOrganizationContext(orgId);
          
          logger.debug('Organization context loaded', {
            hasOrg: !!context.organization,
            enabledModules: context.enabledModules,
            userRole: context.userRole,
          });

          set({
            activeOrganization: context.organization,
            enabledModules: context.enabledModules as ModuleKey[],
            userRole: context.userRole,
            isLoading: false,
          });
        } catch (error) {
          logger.error('Failed to load organization context', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to load context',
            isLoading: false,
          });
        }
      },

      // Clear organization state
      clearOrganization: () => {
        logger.debug('Clearing organization state');
        set({
          activeOrganization: null,
          availableOrganizations: [],
          enabledModules: [],
          userRole: null,
          error: null,
        });
      },
    }),
    {
      name: 'organization-storage',
      partialize: (state) => ({
        activeOrganization: state.activeOrganization,
        enabledModules: state.enabledModules,
        userRole: state.userRole,
      }),
    }
  )
);
