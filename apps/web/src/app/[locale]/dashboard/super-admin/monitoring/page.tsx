'use client';

/**
 * Dashboard de Monitoring de la Plateforme - Étape 7.1.3
 * Route : /dashboard/super-admin/monitoring
 * Dashboard de monitoring pour les SuperAdmins
 */

import { useState, useEffect } from 'react';
import { Container, Card, LoadingSkeleton, useToast } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import {
  getPlatformStats,
  getOrganizationsStats,
  getModuleUsageStats,
  getPlatformHealth,
} from '@/lib/api/platform-monitoring';
import type {
  PlatformStats,
  OrganizationStatsDetail,
  ModuleUsageStats,
  PlatformHealth,
} from '@/lib/api/platform-monitoring';
import {
  Building,
  Users,
  Package,
  UserCheck,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Database,
} from 'lucide-react';
import { logger } from '@/lib/logger';

const MODULE_LABELS: Record<string, string> = {
  'base-donateur': 'Base donateur',
  'formulaires': 'Formulaires',
  'campagnes': 'Campagnes',
  'p2p': 'P2P',
  'analytics': 'Analytics',
  'administration': 'Administration',
};

function PlatformMonitoringContent() {
  const { error: showErrorToast } = useToast();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [organizationsStats, setOrganizationsStats] = useState<OrganizationStatsDetail[]>([]);
  const [moduleUsage, setModuleUsage] = useState<ModuleUsageStats[]>([]);
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    // Refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setIsLoading(true);
      const [stats, orgsStats, modulesStats, health] = await Promise.all([
        getPlatformStats(),
        getOrganizationsStats(0, 10), // Top 10 organizations
        getModuleUsageStats(),
        getPlatformHealth(),
      ]);

      setPlatformStats(stats);
      setOrganizationsStats(orgsStats);
      setModuleUsage(modulesStats);
      setPlatformHealth(health);
    } catch (error) {
      logger.error('Error loading platform monitoring data', error);
      showErrorToast('Erreur lors du chargement des données de monitoring');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !platformStats) {
    return (
      <Container className="py-8 lg:py-12">
        <LoadingSkeleton variant="card" count={4} />
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Monitoring de la Plateforme</h1>
        <p className="text-gray-400">Vue d'ensemble de la santé et des statistiques de la plateforme</p>
      </div>

      {/* Health Status */}
      {platformHealth && (
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Santé de la Plateforme</h2>
              <div className="flex items-center gap-2">
                {platformHealth.status === 'healthy' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : platformHealth.status === 'degraded' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    platformHealth.status === 'healthy'
                      ? 'text-green-400'
                      : platformHealth.status === 'degraded'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {platformHealth.status === 'healthy'
                    ? 'En bonne santé'
                    : platformHealth.status === 'degraded'
                    ? 'Dégradé'
                    : 'Non fonctionnel'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-400">Base de données</p>
                  <p className="text-white font-semibold">
                    {platformHealth.database.connected ? 'Connectée' : 'Déconnectée'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-400">Organisations</p>
                  <p className="text-white font-semibold">{platformHealth.counts.organizations}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-400">Utilisateurs</p>
                  <p className="text-white font-semibold">{platformHealth.counts.users}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Platform Statistics */}
      {platformStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-500/20 border-blue-500/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Organisations</h3>
                </div>
                <p className="text-2xl font-bold text-white">{platformStats.organizations.total}</p>
                <p className="text-xs text-[var(--text-tertiary,#6B6B7B)] mt-1">
                  {platformStats.organizations.active} actives
                </p>
              </div>
            </Card>
            <Card className="bg-green-500/20 border-green-500/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Utilisateurs</h3>
                </div>
                <p className="text-2xl font-bold text-white">{platformStats.users.total}</p>
                <p className="text-xs text-[var(--text-tertiary,#6B6B7B)] mt-1">
                  {platformStats.users.active} actifs
                </p>
              </div>
            </Card>
            <Card className="bg-purple-500/20 border-purple-500/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Modules Activés</h3>
                </div>
                <p className="text-2xl font-bold text-white">{platformStats.modules.total_enabled}</p>
                <p className="text-xs text-[var(--text-tertiary,#6B6B7B)] mt-1">
                  {platformStats.modules.total_configured} configurés
                </p>
              </div>
            </Card>
            <Card className="bg-orange-500/20 border-orange-500/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-medium text-[var(--text-secondary,#A0A0B0)]">Membres</h3>
                </div>
                <p className="text-2xl font-bold text-white">{platformStats.members.total}</p>
                <p className="text-xs text-[var(--text-tertiary,#6B6B7B)] mt-1">
                  {platformStats.members.joined} rejoints
                </p>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Activité Récente (7 jours)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Nouvelles organisations</span>
                    <span className="text-white font-semibold">
                      {platformStats.organizations.new_last_7_days}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Nouveaux utilisateurs</span>
                    <span className="text-white font-semibold">
                      {platformStats.users.new_last_7_days}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Membres
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-semibold">{platformStats.members.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Rejoints</span>
                    <span className="text-white font-semibold">{platformStats.members.joined}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">En attente</span>
                    <span className="text-white font-semibold">{platformStats.members.pending}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Module Usage */}
      {moduleUsage.length > 0 && (
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Utilisation des Modules</h3>
            <div className="space-y-4">
              {moduleUsage.map((module) => (
                <div key={module.module_key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">
                      {MODULE_LABELS[module.module_key] || module.module_key}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {module.enabled_count} / {module.total_organizations} ({module.usage_percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                      style={{ width: `${module.usage_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Top Organizations */}
      {organizationsStats.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Organisations Récentes</h3>
            <div className="space-y-3">
              {organizationsStats.map((org) => (
                <div
                  key={org.id}
                  className="flex justify-between items-center p-3 rounded-lg border border-white/10 bg-white/5"
                >
                  <div>
                    <p className="text-white font-semibold">{org.name}</p>
                    <p className="text-sm text-gray-400">
                      {org.enabled_modules_count} modules • {org.total_members} membres
                    </p>
                  </div>
                  <div className="text-right">
                    {org.is_active ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </Container>
  );
}

export default function PlatformMonitoringPage() {
  return (
    <ProtectedSuperAdminRoute>
      <PlatformMonitoringContent />
    </ProtectedSuperAdminRoute>
  );
}
