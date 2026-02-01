/**
 * Portal Constants - Client Portal and Employee/ERP Portal
 */

export interface PortalRoute {
  path: string;
  label: string;
  icon: string;
  permission?: string;
  children?: PortalRoute[];
}

export interface PortalNavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  permission?: string;
  module?: string;
  badge?: string | number;
  children?: PortalNavigationItem[];
}

export interface ClientPortalNavigation extends PortalNavigationItem {}
export interface EmployeePortalNavigation extends PortalNavigationItem {
  module: string;
}

export const PORTAL_ROUTES = {
  CLIENT: '/client',
  EMPLOYEE: '/erp',
  ADMIN: '/admin',
} as const;

export const PORTAL_PATH_PATTERNS = {
  CLIENT: /^\/client/,
  EMPLOYEE: /^\/erp/,
  ADMIN: /^\/admin/,
} as const;

export const PORTAL_DEFAULT_ROUTES = {
  CLIENT: '/client/dashboard',
  EMPLOYEE: '/erp/dashboard',
  ADMIN: '/admin/dashboard',
} as const;
