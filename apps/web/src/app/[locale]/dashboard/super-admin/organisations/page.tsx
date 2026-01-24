'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Container, Card, Button, Badge } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import { listOrganizations, deleteOrganization } from '@/lib/api/organizations';
import type { OrganizationWithStats } from '@modele/types';
import { Building, Plus, Settings, Users, Trash2, Eye, BarChart3 } from 'lucide-react';

function OrganisationsContent() {
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load organizations on mount and when page becomes visible (handles back navigation)
  useEffect(() => {
    loadOrganizations();
    
    // Reload when page becomes visible (handles navigation back from creation page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadOrganizations();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listOrganizations();
      setOrganizations(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (orgId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible.')) {
      return;
    }

    try {
      await deleteOrganization(orgId);
      await loadOrganizations();
    } catch (err) {
      alert('Erreur lors de la suppression de l\'organisation');
    }
  };

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Organisations</h1>
          <p className="text-muted-foreground">Gérez les organisations du système multi-tenant</p>
        </div>
        <Link href="/dashboard/super-admin/organisations/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle organisation
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="mb-6 border-error-200 bg-error-50 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error}</p>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      ) : organizations.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune organisation</h3>
            <p className="text-muted-foreground mb-6">Créez votre première organisation pour commencer</p>
            <Link href="/dashboard/super-admin/organisations/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer une organisation
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <Link href={`/dashboard/super-admin/organisations/${org.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{org.name}</h3>
                      <p className="text-sm text-muted-foreground">/{org.slug}</p>
                    </div>
                  </div>
                  <Badge variant={org.isActive ? 'success' : 'default'}>
                    {org.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Modules activés
                    </span>
                    <span className="font-semibold text-foreground">{org.enabledModulesCount} / 6</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Membres
                    </span>
                    <span className="font-semibold text-foreground">{org.totalMembers}</span>
                  </div>
                </div>
              </Link>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-end gap-2">
                <Link href={`/dashboard/super-admin/organisations/${org.id}`}>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/dashboard/super-admin/organisations/${org.id}`}>
                  <Button size="sm" variant="ghost">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-error-600 hover:text-error-700 hover:bg-error-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(org.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {!isLoading && organizations.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{organizations.length}</p>
                <p className="text-sm text-muted-foreground">Organisations totales</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {organizations.filter((o) => o.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Organisations actives</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-info-100 dark:bg-info-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-info-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {organizations.reduce((acc, org) => acc + org.totalMembers, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Membres totaux</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
}

export default function OrganisationsPage() {
  return (
    <ProtectedSuperAdminRoute>
      <OrganisationsContent />
    </ProtectedSuperAdminRoute>
  );
}
