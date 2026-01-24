/**
 * Organization Types
 * 
 * Multi-tenant organization system with separate databases per organization.
 * Only SuperAdmins can manage organizations.
 */

/**
 * Available modules that can be enabled per organization
 */
export type ModuleKey = 
  | 'base-donateur'
  | 'formulaires'
  | 'campagnes'
  | 'p2p'
  | 'analytics'
  | 'administration';

/**
 * Organization entity
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  dbConnectionString?: string; // Hidden from frontend for security
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: Record<string, any>;
}

/**
 * Organization module configuration
 */
export interface OrganizationModule {
  id: string;
  organizationId: string;
  moduleKey: ModuleKey;
  isEnabled: boolean;
  settings?: Record<string, any>;
  createdAt: string;
}

/**
 * Organization member
 */
export interface OrganizationMember {
  id: string;
  organizationId: string;
  userEmail: string;
  role: 'admin' | 'member' | 'viewer';
  invitedBy: string;
  joinedAt?: string;
  createdAt: string;
}

/**
 * Active organization context
 */
export interface ActiveOrganizationContext {
  organization: Organization | null;
  enabledModules: ModuleKey[];
  userRole: string | null;
}

/**
 * Create organization request
 */
export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  settings?: Record<string, any>;
}

/**
 * Update organization request
 */
export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  isActive?: boolean;
  settings?: Record<string, any>;
}

/**
 * Module toggle request
 */
export interface ToggleModuleRequest {
  moduleKey: ModuleKey;
  isEnabled: boolean;
  settings?: Record<string, any>;
}

/**
 * Invite member request
 */
export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

/**
 * Organization with module count
 */
export interface OrganizationWithStats extends Organization {
  enabledModulesCount: number;
  totalMembers: number;
}
