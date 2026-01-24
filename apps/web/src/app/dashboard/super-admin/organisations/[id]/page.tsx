'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Card, Button, Badge, Input } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import {
  getOrganization,
  listOrganizationModules,
  listOrganizationMembers,
  toggleOrganizationModule,
  inviteMemberToOrganization,
  removeMemberFromOrganization,
} from '@/lib/api/organizations';
import type { Organization, OrganizationModule, OrganizationMember, ModuleKey } from '@modele/types';
import {
  ArrowLeft,
  Building,
  BarChart3,
  Users,
  Trash2,
  Plus,
  Check,
  X,
} from 'lucide-react';

const MODULE_LABELS: Record<string, string> = {
  'base-donateur': 'Base donateur',
  'formulaires': 'Formulaires',
  'campagnes': 'Campagnes',
  'p2p': 'P2P',
  'analytics': 'Analytics',
  'administration': 'Administration',
};

function OrganizationDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [modules, setModules] = useState<OrganizationModule[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState(false);

  // Load organization data
  useEffect(() => {
    if (organizationId) {
      loadOrganizationData();
    }
  }, [organizationId]);

  const loadOrganizationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [org, modulesData, membersData] = await Promise.all([
        getOrganization(organizationId),
        listOrganizationModules(organizationId),
        listOrganizationMembers(organizationId),
      ]);

      setOrganization(org);
      setModules(modulesData?.items || []);
      setMembers(membersData?.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization');
      setModules([]);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleModule = async (moduleKey: ModuleKey, currentlyEnabled: boolean) => {
    try {
      await toggleOrganizationModule(organizationId, {
        moduleKey,
        isEnabled: !currentlyEnabled,
      });
      await loadOrganizationData();
    } catch (err) {
      alert('Erreur lors de la modification du module');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail) {
      alert('Veuillez entrer une adresse email');
      return;
    }

    try {
      setIsInviting(true);
      await inviteMemberToOrganization(organizationId, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      await loadOrganizationData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      return;
    }

    try {
      await removeMemberFromOrganization(organizationId, memberId);
      await loadOrganizationData();
    } catch (err) {
      alert('Erreur lors de la suppression du membre');
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </Container>
    );
  }

  if (error || !organization) {
    return (
      <Container className="py-8 lg:py-12">
        <Card className="border-error-200 bg-error-50 dark:bg-error-900/20">
          <p className="text-error-600 dark:text-error-400">{error || 'Organisation non trouvée'}</p>
          <Button variant="ghost" onClick={() => router.back()} className="mt-4">
            Retour
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{organization.name}</h1>
            <p className="text-muted-foreground">/{organization.slug}</p>
          </div>
          <Badge variant={organization.isActive ? 'success' : 'default'} className="text-lg px-4 py-2">
            {organization.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modules Section */}
        <Card title="Modules" className="lg:col-span-2">
          <p className="text-muted-foreground mb-4">
            Activez ou désactivez les modules disponibles pour cette organisation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(modules || []).map((module) => (
              <div
                key={module.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  {module.isEnabled ? (
                    <Check className="w-5 h-5 text-success-600" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">
                    {MODULE_LABELS[module.moduleKey] || module.moduleKey}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={module.isEnabled ? 'primary' : 'ghost'}
                  onClick={() => handleToggleModule(module.moduleKey, module.isEnabled)}
                >
                  {module.isEnabled ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Members Section */}
        <Card title="Membres" className="lg:col-span-2">
          <p className="text-muted-foreground mb-4">
            Invitez des utilisateurs à rejoindre cette organisation
          </p>

          {/* Invite Form */}
          <form onSubmit={handleInviteMember} className="mb-6 p-4 rounded-lg bg-muted/30">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button type="submit" disabled={isInviting}>
                <Plus className="w-4 h-4 mr-2" />
                Inviter
              </Button>
            </div>
          </form>

          {/* Members List */}
          <div className="space-y-2">
            {(!members || members.length === 0) ? (
              <p className="text-center text-muted-foreground py-8">Aucun membre pour le moment</p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.userEmail}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.joinedAt ? (
                      <Badge variant="success">Actif</Badge>
                    ) : (
                      <Badge variant="warning">En attente</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error-600 hover:bg-error-50"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Stats */}
        <Card className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {(modules || []).filter((m) => m.isEnabled).length}
                </p>
                <p className="text-sm text-muted-foreground">Modules activés</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{(members || []).length}</p>
                <p className="text-sm text-muted-foreground">Membres</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-info-100 dark:bg-info-900/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-info-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {organization.isActive ? 'Actif' : 'Inactif'}
                </p>
                <p className="text-sm text-muted-foreground">Statut</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
}

export default function OrganizationDetailsPage() {
  return (
    <ProtectedSuperAdminRoute>
      <OrganizationDetailsContent />
    </ProtectedSuperAdminRoute>
  );
}
