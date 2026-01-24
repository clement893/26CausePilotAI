/**
 * Navigation Structure
 *
 * Centralized navigation configuration for the application sidebar.
 * Supports grouped navigation items with collapsible sections.
 */

import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  FileText,
  Settings,
  Palette,
  Cog,
  Network,
  Heart,
  FileEdit,
  Megaphone,
  UsersRound,
  BarChart3,
  Brain,
  Mail,
  Share2,
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
}

export interface NavigationConfig {
  items: (NavigationItem | NavigationGroup)[];
}

/**
 * Get default navigation structure
 * Can be customized based on user permissions
 */
export function getNavigationConfig(isAdmin: boolean, isSuperAdmin: boolean = false): NavigationConfig {
  const config: NavigationConfig = {
    items: [
      // Dashboard (non-grouped)
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      // Base donateur (collapsible group)
      {
        name: 'Base donateur',
        icon: <Heart className="w-5 h-5" />,
        items: [
          {
            name: 'Donateurs',
            href: '/dashboard/base-donateur/donateurs',
            icon: <Users className="w-5 h-5" />,
          },
          {
            name: 'Statistiques',
            href: '/dashboard/base-donateur/statistiques',
            icon: <BarChart3 className="w-5 h-5" />,
          },
          {
            name: 'Segments',
            href: '/dashboard/base-donateur/segments',
            icon: <PieChart className="w-5 h-5" />,
          },
        ],
        collapsible: true,
        defaultOpen: false,
      },
      // Formulaires (collapsible group)
      {
        name: 'Formulaires',
        icon: <FileEdit className="w-5 h-5" />,
        items: [
          {
            name: 'Formulaires',
            href: '/dashboard/formulaires/formulaires',
            icon: <FileText className="w-5 h-5" />,
          },
          {
            name: 'Intégrations',
            href: '/dashboard/formulaires/integrations',
            icon: <Network className="w-5 h-5" />,
          },
        ],
        collapsible: true,
        defaultOpen: false,
      },
      // Campagnes (collapsible group)
      {
        name: 'Campagnes',
        icon: <Megaphone className="w-5 h-5" />,
        items: [
          {
            name: 'Campagnes',
            href: '/dashboard/campagnes/campagnes',
            icon: <Megaphone className="w-5 h-5" />,
          },
          {
            name: 'Courriels',
            href: '/dashboard/campagnes/courriels',
            icon: <Mail className="w-5 h-5" />,
          },
          {
            name: 'Médias sociaux',
            href: '/dashboard/campagnes/medias-sociaux',
            icon: <Share2 className="w-5 h-5" />,
          },
        ],
        collapsible: true,
        defaultOpen: false,
      },
      // P2P (collapsible group)
      {
        name: 'P2P',
        icon: <UsersRound className="w-5 h-5" />,
        items: [
          {
            name: 'Campagnes',
            href: '/dashboard/p2p/campagnes',
            icon: <Megaphone className="w-5 h-5" />,
          },
          {
            name: 'Paramètres',
            href: '/dashboard/p2p/parametres',
            icon: <Settings className="w-5 h-5" />,
          },
        ],
        collapsible: true,
        defaultOpen: false,
      },
      // Analytics (collapsible group)
      {
        name: 'Analytics',
        icon: <BarChart3 className="w-5 h-5" />,
        items: [
          {
            name: 'Dashboard',
            href: '/dashboard/analytics/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
          },
          {
            name: 'Rapports',
            href: '/dashboard/analytics/rapports',
            icon: <FileText className="w-5 h-5" />,
          },
          {
            name: 'IA',
            href: '/dashboard/analytics/ia',
            icon: <Brain className="w-5 h-5" />,
          },
        ],
        collapsible: true,
        defaultOpen: false,
      },
      // Administration (collapsible group)
      {
        name: 'Administration',
        icon: <Shield className="w-5 h-5" />,
        items: [
          {
            name: 'Users',
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
      },
    ],
  };

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
  if (isSuperAdmin) {
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
  }

  return config;
}
