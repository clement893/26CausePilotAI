/** * Settings Navigation Component * * Navigation component for settings pages with links to different settings sections. * Displays a grid of setting cards that link to respective settings pages. * * @component * @example * ```tsx * <SettingsNavigation /> * ``` */ 'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import {
  Settings,
  Building2,
  Users,
  CreditCard,
  Puzzle,
  Key,
  Shield,
  Bell,
  UserCog,
  FileText,
} from 'lucide-react';
import { clsx } from 'clsx';
export interface SettingsNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  badge?: string | number;
}
export interface SettingsNavigationProps {
  className?: string;
}
/** * Settings Navigation Component * * Displays a grid of setting cards for navigation to different settings pages. */ export default function SettingsNavigation({
  className,
}: SettingsNavigationProps) {
  const pathname = usePathname();
  const t = useTranslations('settings');
  const navItems: SettingsNavItem[] = [
    {
      id: 'general',
      label: t('navigation.general') || 'General',
      href: '/settings/general',
      icon: <Settings className="w-6 h-6" />,
      description:
        t('navigation.generalDescription') || 'Basic application settings and preferences',
    },
    {
      id: 'organization',
      label: t('navigation.organization') || 'Organization',
      href: '/settings/organization',
      icon: <Building2 className="w-6 h-6" />,
      description:
        t('navigation.organizationDescription') || 'Organization name, logo, and domain settings',
    },
    {
      id: 'team',
      label: t('navigation.team') || 'Team',
      href: '/settings/team',
      icon: <Users className="w-6 h-6" />,
      description: t('navigation.teamDescription') || 'Manage team members and permissions',
    },
    {
      id: 'billing',
      label: t('navigation.billing') || 'Billing',
      href: '/settings/billing',
      icon: <CreditCard className="w-6 h-6" />,
      description: t('navigation.billingDescription') || 'Billing and subscription management',
    },
    {
      id: 'integrations',
      label: t('navigation.integrations') || 'Integrations',
      href: '/settings/integrations',
      icon: <Puzzle className="w-6 h-6" />,
      description:
        t('navigation.integrationsDescription') || 'Third-party integrations and connections',
    },
    {
      id: 'api',
      label: t('navigation.api') || 'API',
      href: '/settings/api',
      icon: <Key className="w-6 h-6" />,
      description: t('navigation.apiDescription') || 'API configuration and settings',
    },
    {
      id: 'security',
      label: t('navigation.security') || 'Security',
      href: '/settings/security',
      icon: <Shield className="w-6 h-6" />,
      description: t('navigation.securityDescription') || 'Security settings, 2FA, and sessions',
    },
    {
      id: 'notifications',
      label: t('navigation.notifications') || 'Notifications',
      href: '/settings/notifications',
      icon: <Bell className="w-6 h-6" />,
      description:
        t('navigation.notificationsDescription') || 'Notification preferences and settings',
    },
    {
      id: 'preferences',
      label: t('navigation.preferences') || 'Preferences',
      href: '/settings/preferences',
      icon: <UserCog className="w-6 h-6" />,
      description: t('navigation.preferencesDescription') || 'User preferences and personalization',
    },
    {
      id: 'logs',
      label: t('navigation.logs') || 'Logs',
      href: '/admin-logs/testing',
      icon: <FileText className="w-6 h-6" />,
      description: t('navigation.logsDescription') || 'View system logs and audit trail',
    },
  ];
  const isActive = (href: string) => {
    if (href === '/settings') {
      return pathname === '/settings';
    }
    return pathname?.startsWith(href);
  };
  return (
    <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {navItems.map((item, index) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`stagger-fade-in opacity-0 stagger-delay-${Math.min(index + 1, 6)}`}
          >
            <Card
              variant={active ? "gradient-border" : "glass"}
              className={clsx(
                'h-full transition-all duration-200 hover-lift',
                active
                  ? 'border-blue-500border-primary-400'
                  : 'border-gray-800border-border hover:border-gray-700hover:border-gray-700',
                'cursor-pointer'
              )}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={clsx(
                    'flex-shrink-0 p-3 rounded-lg',
                    active
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400text-primary-400'
                      : 'bg-[#1C1C26]bg-muted text-gray-400text-muted-foreground'
                  )}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={clsx(
                        'text-lg font-semibold',
                        active ? 'text-whitetext-primary-100' : 'text-whitetext-foreground'
                      )}
                    >
                      {item.label}
                    </h3>
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20bg-primary-900/40 text-blue-400text-primary-300 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
