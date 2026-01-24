/**
 * Organizations API Client
 *
 * API calls for organization management (SuperAdmin only)
 */

import { apiClient } from './client';
import type {
  Organization,
  OrganizationWithStats,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationModule,
  ToggleModuleRequest,
  OrganizationMember,
  InviteMemberRequest,
  ActiveOrganizationContext,
} from '@modele/types';

// ============= Organizations CRUD =============

export async function listOrganizations(
  skip: number = 0,
  limit: number = 100
): Promise<{ items: OrganizationWithStats[]; total: number }> {
  const response = await apiClient.get<{ items: OrganizationWithStats[]; total: number }>(
    `/v1/organizations?skip=${skip}&limit=${limit}`
  );
  return response;
}

export async function getOrganization(organizationId: string): Promise<Organization> {
  const response = await apiClient.get<Organization>(`/v1/organizations/${organizationId}`);
  return response;
}

export async function createOrganization(
  data: CreateOrganizationRequest
): Promise<Organization> {
  const response = await apiClient.post<Organization>('/v1/organizations', data);
  return response;
}

export async function updateOrganization(
  organizationId: string,
  data: UpdateOrganizationRequest
): Promise<Organization> {
  const response = await apiClient.patch<Organization>(
    `/v1/organizations/${organizationId}`,
    data
  );
  return response;
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}`);
}

// ============= Organization Modules =============

export async function listOrganizationModules(
  organizationId: string
): Promise<{ items: OrganizationModule[]; total: number }> {
  const response = await apiClient.get<{ items: OrganizationModule[]; total: number }>(
    `/v1/organizations/${organizationId}/modules`
  );
  return response;
}

export async function toggleOrganizationModule(
  organizationId: string,
  data: ToggleModuleRequest
): Promise<OrganizationModule> {
  const response = await apiClient.post<OrganizationModule>(
    `/v1/organizations/${organizationId}/modules/toggle`,
    data
  );
  return response;
}

// ============= Organization Members =============

export async function listOrganizationMembers(
  organizationId: string
): Promise<{ items: OrganizationMember[]; total: number }> {
  const response = await apiClient.get<{ items: OrganizationMember[]; total: number }>(
    `/v1/organizations/${organizationId}/members`
  );
  return response;
}

export async function inviteMemberToOrganization(
  organizationId: string,
  data: InviteMemberRequest
): Promise<OrganizationMember> {
  const response = await apiClient.post<OrganizationMember>(
    `/v1/organizations/${organizationId}/members`,
    data
  );
  return response;
}

export async function removeMemberFromOrganization(
  organizationId: string,
  memberId: string
): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}/members/${memberId}`);
}

// ============= User Context =============

export async function getActiveOrganizationContext(
  organizationId?: string
): Promise<ActiveOrganizationContext> {
  const url = organizationId
    ? `/v1/organizations/context/active?organization_id=${organizationId}`
    : '/v1/organizations/context/active';
  
  const response = await apiClient.get<ActiveOrganizationContext>(url);
  return response;
}
