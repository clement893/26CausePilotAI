/**
 * Navigation Structure
 *
 * Centralized navigation configuration for the application sidebar.
 * Supports grouped navigation items with collapsible sections.
 */

import { ReactNode } from 'react';
import type { ModuleKey } from '@modele/types';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  FileText,
  Settings,
  Palette,
  Cog,
  Heart,
  Repeat,
  FileEdit,
  UsersRound,
  BarChart3,
  Mail,
  PieChart,
  Building,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface NavigationGroup {
  name: string;
  icon?: ReactNode;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  moduleKey?: ModuleKey; // Optional: link group to organization module
}

export interface NavigationConfig {
  items: (NavigationItem | NavigationGroup)[];
}

/**
 * Get default navigation structure
 * Can be customized based on user permissions and enabled modules
 * 
 * @param isAdmin - Whether user is admin
 * @param isSuperAdmin - Whether user is superadmin
 * @param enabledModules - List of enabled modules for the active organization
 */
export function getNavigationConfig(
  isAdmin: boolean,
  isSuperAdmin: boolean = false,
  enabledModules: ModuleKey[] = []
): NavigationConfig {
  // Debug log
  console.log('[getNavigationConfig] Called with:', {
    isAdmin,
    isSuperAdmin,
    enabledModules,
    enabledModulesLength: enabledModules.length,
  });
  
  // Helper to check if module is enabled
  const isModuleEnabled = (moduleKey: ModuleKey): boolean => {
    // SuperAdmins see all modules
    if (isSuperAdmin) {
      console.log(`[getNavigationConfig] Module ${moduleKey} enabled (superadmin)`);
      return true;
    }
    // Regular users see only enabled modules
    const enabled = enabledModules.includes(moduleKey);
    console.log(`[getNavigationConfig] Module ${moduleKey} ${enabled ? 'enabled' : 'disabled'} (regular user)`);
    return enabled;
  };

  const config: NavigationConfig = {
    items: [
      // Dashboard (always visible)
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
  };

  // Nouvelle structure du menu (par module fonctionnel)

  // Collecte : Formulaires, Campagnes P2P
  if (isModuleEnabled('formulaires') || isModuleEnabled('p2p')) {
    const collecteItems: NavigationItem[] = [];
    if (isModuleEnabled('formulaires')) {
      collecteItems.push({
        name: 'Formulaires',
        href: '/dashboard/formulaires',
        icon: <FileEdit className="w-5 h-5" />,
      });
    }
    if (isModuleEnabled('p2p')) {
      collecteItems.push({
        name: 'Campagnes P2P',
        href: '/dashboard/p2p/campagnes',
        icon: <UsersRound className="w-5 h-5" />,
      });
    }
    if (collecteItems.length > 0) {
      config.items.push({
        name: 'Collecte',
        icon: <FileEdit className="w-5 h-5" />,
        items: collecteItems,
        collapsible: true,
        defaultOpen: false,
      });
    }
  }

  // CRM : Donateurs, Segments
  if (isModuleEnabled('base-donateur')) {
    config.items.push({
      name: 'CRM',
      icon: <Heart className="w-5 h-5" />,
      moduleKey: 'base-donateur',
      items: [
        {
          name: 'Donateurs',
          href: '/dashboard/donateurs',
          icon: <Users className="w-5 h-5" />,
        },
        {
          name: 'Segments',
          href: '/dashboard/base-donateur/segments',
          icon: <PieChart className="w-5 h-5" />,
        },
      ],
      collapsible: true,
      defaultOpen: false,
    });
  }

  // Marketing : Campagnes Email, Workflows
  if (isModuleEnabled('campagnes')) {
    config.items.push({
      name: 'Marketing',
      icon: <Mail className="w-5 h-5" />,
      moduleKey: 'campagnes',
      items: [
        {
          name: 'Campagnes Email',
          href: '/dashboard/marketing/campagnes',
          icon: <Mail className="w-5 h-5" />,
        },
        {
          name: 'Workflows',
          href: '/dashboard/marketing/workflows',
          icon: <Repeat className="w-5 h-5" />,
        },
      ],
      collapsible: true,
      defaultOpen: false,
    });
  }

  // Analyse : Rapports
  if (isModuleEnabled('analytics')) {
    config.items.push({
      name: 'Analyse',
      icon: <BarChart3 className="w-5 h-5" />,
      moduleKey: 'analytics',
      items: [
        {
          name: 'Rapports',
          href: '/dashboard/analytics/rapports',
          icon: <FileText className="w-5 h-5" />,
        },
      ],
      collapsible: true,
      defaultOpen: false,
    });
  }

  // Administration : Utilisateurs, Paramètres
  if (isModuleEnabled('administration')) {
    config.items.push({
      name: 'Administration',
      icon: <Shield className="w-5 h-5" />,
      moduleKey: 'administration',
      items: [
        {
          name: 'Utilisateurs',
          href: '/dashboard/administration/users',
          icon: <Users className="w-5 h-5" />,
        },
        {
          name: 'Paramètres',
          href: '/dashboard/administration/parametres',
          icon: <Settings className="w-5 h-5" />,
        },
      ],
      collapsible: true,
      defaultOpen: false,
    });
  }

  // Add Admin group only for admins
  if (isAdmin) {
    config.items.push({
      name: 'Admin',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          name: 'Logs',
          href: '/admin-logs/testing',
          icon: <FileText className="w-5 h-5" />,
        },
        {
          name: 'Thèmes',
          href: '/admin/themes',
          icon: <Palette className="w-5 h-5" />,
        },
        {
          name: 'Configuration',
          href: '/admin/settings',
          icon: <Cog className="w-5 h-5" />,
        },
      ],
      collapsible: true,
      defaultOpen: false,
    });
  }

  // Add Super Admin group only for super admins
  // IMPORTANT: This should appear even without an active organization
  if (isSuperAdmin) {
    console.log('[getNavigationConfig] Adding SuperAdmin menu (isSuperAdmin=true)');
    config.items.push({
      name: 'SuperAdmin',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          name: 'Organisations',
          href: '/dashboard/super-admin/organisations',
          icon: <Building className="w-5 h-5" />,
        },
        {
          name: 'Paramètres',
          href: '/dashboard/super-admin/parametres',
          icon: <Settings className="w-5 h-5" />,
        },
        {
          name: 'Gestion',
          href: '/dashboard/super-admin/gestion',
          icon: <UserCog className="w-5 h-5" />,
        },
        {
          name: 'Dashboard',
          href: '/dashboard/super-admin/dashboard',
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
      ],
      collapsible: true,
      defaultOpen: false,
    });
  } else {
    console.log('[getNavigationConfig] NOT adding SuperAdmin menu (isSuperAdmin=false)');
  }

  return config;
}
