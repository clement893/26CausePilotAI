/**
 * Platform Monitoring API Client
 *
 * API calls for platform monitoring and statistics (SuperAdmin only)
 */

import { apiClient } from './client';
import { extractApiData } from './utils';

export interface PlatformStats {
  organizations: {
    total: number;
    active: number;
    inactive: number;
    new_last_7_days: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    new_last_7_days: number;
  };
  modules: {
    total_enabled: number;
    total_configured: number;
  };
  members: {
    total: number;
    joined: number;
    pending: number;
  };
  subscriptions: {
    total: number;
    active: number;
  };
  recent_activity: Array<Record<string, unknown>>;
}

export interface OrganizationStatsDetail {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  enabled_modules_count: number;
  total_members: number;
  created_at: string;
  last_activity: string | null;
}

export interface ModuleUsageStats {
  module_key: string;
  enabled_count: number;
  total_organizations: number;
  usage_percentage: number;
}

export interface PlatformHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: {
    connected: boolean;
  };
  counts: {
    organizations: number;
    users: number;
  };
  timestamp: string;
  error?: string;
}

// ============= Platform Statistics =============

export async function getPlatformStats(): Promise<PlatformStats> {
  const response = await apiClient.get<PlatformStats>('/v1/platform/stats');
  return extractApiData(response);
}

export async function getOrganizationsStats(
  skip: number = 0,
  limit: number = 100
): Promise<OrganizationStatsDetail[]> {
  const response = await apiClient.get<OrganizationStatsDetail[]>(
    `/v1/platform/organizations/stats?skip=${skip}&limit=${limit}`
  );
  return extractApiData(response);
}

export async function getModuleUsageStats(): Promise<ModuleUsageStats[]> {
  const response = await apiClient.get<ModuleUsageStats[]>('/v1/platform/modules/usage');
  return extractApiData(response);
}

export async function getPlatformHealth(): Promise<PlatformHealth> {
  const response = await apiClient.get<PlatformHealth>('/v1/platform/health');
  return extractApiData(response);
}
