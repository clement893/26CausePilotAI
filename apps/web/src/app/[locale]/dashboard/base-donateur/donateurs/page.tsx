'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { Container, Card, Button, Input, Badge, LoadingSkeleton, Tooltip, useToast } from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { listDonors, type ListDonorsParams, seedExampleDonors } from '@/lib/api/donors';
import { checkMySuperAdminStatus } from '@/lib/api/admin';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { errorLogger } from '@/lib/logger/errorLogger';
import type { Donor } from '@modele/types';
import { Search, Plus, Mail, Phone, DollarSign, Calendar, User, TrendingUp, Sparkles, Database, Info, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function DonateursPage() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { success, error: showErrorToast, info, warning } = useToast();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isActive: undefined as boolean | undefined,
    tags: [] as string[],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (activeOrganization && !orgLoading) {
      loadDonors();
    }
  }, [activeOrganization, pagination.page, searchTerm, filters, orgLoading]);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const token = TokenStorage.getToken();
        if (token) {
          const status = await checkMySuperAdminStatus(token);
          setIsSuperAdmin(status.is_superadmin === true);
        }
      } catch (error) {
        setIsSuperAdmin(false);
      }
    };
    checkSuperAdmin();
  }, []);

  const loadDonors = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      setError(null);

      const params: ListDonorsParams = {
        organizationId: activeOrganization.id,
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: searchTerm || undefined,
        isActive: filters.isActive,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
      };

      const response = await listDonors(params);
      setDonors(response.items);
      setPagination({
        ...pagination,
        total: response.total,
        totalPages: response.total_pages,
      });
      setError(null);
      
      // Show info toast if no donors found
      if (response.items.length === 0 && !searchTerm) {
        info('Aucun donateur trouvé. Commencez par ajouter votre premier donateur.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load donors';
      const userFriendlyMessage = errorLogger.getUserFriendlyMessage(err);
      
      setError(userFriendlyMessage);
      setDonors([]);
      
      // Log error
      errorLogger.error('Failed to load donors', err instanceof Error ? err : new Error(errorMessage), {
        organizationId: activeOrganization?.id,
        params,
      });
      
      // Show error toast
      showErrorToast(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSeedDonors = async () => {
    if (!activeOrganization) return;

    if (!confirm('Voulez-vous créer 10 donateurs exemples avec des données de test ?')) {
      return;
    }

    try {
      setIsSeeding(true);
      setError(null);
      setSeedSuccess(null);

      const result = await seedExampleDonors(activeOrganization.id, 10);

      if (result.success) {
        const successMessage = `${result.donors_created} donateurs créés avec ${result.donations_created} dons !`;
        setSeedSuccess(successMessage);
        success(successMessage, { duration: 6000 });
        
        // Reload donors list
        await loadDonors();
      } else {
        const errorMessage = result.message || 'Erreur lors de la création des donateurs exemples';
        setError(errorMessage);
        showErrorToast(errorMessage);
      }
    } catch (err) {
      const errorMessage = errorLogger.getUserFriendlyMessage(err);
      setError(errorMessage);
      
      // Log error
      errorLogger.error('Failed to seed example donors', err instanceof Error ? err : new Error(String(err)), {
        organizationId: activeOrganization?.id,
      });
      
      // Show error toast
      showErrorToast(errorMessage);
    } finally {
      setIsSeeding(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-CA');
  };

  const getInitials = (donor: Donor) => {
    if (donor.first_name && donor.last_name) {
      return `${donor.first_name[0] ?? ''}${donor.last_name[0] ?? ''}`.toUpperCase() || '?';
    }
    if (donor.first_name) {
      return (donor.first_name[0] ?? '?').toUpperCase();
    }
    if (donor.last_name) {
      return (donor.last_name[0] ?? '?').toUpperCase();
    }
    return (donor.email[0] ?? '?').toUpperCase();
  };

  const getDonorName = (donor: Donor) => {
    if (donor.first_name || donor.last_name) {
      return `${donor.first_name || ''} ${donor.last_name || ''}`.trim();
    }
    return donor.email;
  };

  if (orgLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="mb-8 h-20 animate-pulse rounded-lg bg-muted/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </Container>
    );
  }

  if (!activeOrganization) {
    return (
      <Container className="py-8 lg:py-12">
        <Card>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune organisation active</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      {/* Header with gradient */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Donateurs
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">Gérez votre base de données de donateurs</p>
        </div>
        <div className="flex gap-3">
          {isSuperAdmin && (
            <Tooltip content="Créer 10 donateurs exemples avec des données de test (SuperAdmin uniquement)">
              <Button
                variant="outline"
                onClick={handleSeedDonors}
                disabled={isSeeding || !activeOrganization}
                className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <Database className="w-4 h-4 mr-2" />
                {isSeeding ? 'Création...' : 'Seed exemples'}
              </Button>
            </Tooltip>
          )}
          <Tooltip content="Ajouter un nouveau donateur à votre base de données">
            <Link href="/dashboard/base-donateur/donateurs/new">
              <Button className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau donateur
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* Seed Success Message */}
      {seedSuccess && (
        <Card className="mb-6 border-success bg-success/10 animate-in fade-in slide-in-from-top-2">
          <p className="text-success p-4 font-medium">{seedSuccess}</p>
        </Card>
      )}

      {/* Stats Summary */}
      {!isLoading && donors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total donateurs</p>
                  <p className="text-2xl font-bold">{pagination.total}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-l-success bg-gradient-to-r from-success/5 to-transparent">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Donateurs actifs</p>
                  <p className="text-2xl font-bold">
                    {donors.filter(d => d.is_active).length}
                  </p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </div>
          </Card>
          <Card className="border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-transparent">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total donné</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      donors.reduce((sum, d) => sum + parseFloat(d.total_donated || '0'), 0).toString()
                    )}
                  </p>
                </div>
                <div className="p-3 bg-warning/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-warning" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters - Modern Design */}
      <Card className="mb-6 border-2 border-border/50 shadow-sm">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Tooltip content="Recherchez par nom, prénom ou adresse email">
              <Input
                type="text"
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:border-primary transition-colors"
              />
            </Tooltip>
          </div>

          <div className="flex gap-3">
            <Tooltip content="Filtrez les donateurs par statut actif/inactif">
              <select
                value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                onChange={(e) => {
                  const newFilter = e.target.value === 'all' ? undefined : e.target.value === 'true';
                  setFilters({
                    ...filters,
                    isActive: newFilter,
                  });
                  if (newFilter !== undefined) {
                    info(`Filtre appliqué: ${newFilter ? 'Actifs uniquement' : 'Inactifs uniquement'}`);
                  }
                }}
                className="px-4 py-2 border-2 rounded-lg bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
              >
                <option value="all">Tous les statuts</option>
                <option value="true">Actifs uniquement</option>
                <option value="false">Inactifs uniquement</option>
              </select>
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-destructive bg-destructive/10 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Si le problème persiste, vérifiez votre connexion ou contactez le support.
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-destructive hover:text-destructive/80 transition-colors"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </Card>
      )}

      {/* Donors Grid - Modern Card Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      ) : donors.length === 0 ? (
        <Card className="text-center py-16" elevated>
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Aucun donateur trouvé</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {searchTerm ? 'Essayez avec d\'autres termes de recherche.' : 'Commencez par ajouter votre premier donateur.'}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/base-donateur/donateurs/new">
              <Button variant="primary" className="shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un donateur
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {donors.map((donor, index) => (
              <Link
                key={donor.id}
                href={`/dashboard/base-donateur/donateurs/${donor.id}`}
                className={`group stagger-fade-in opacity-0 stagger-delay-${Math.min(index + 1, 6)}`}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 cursor-pointer border-2 border-transparent">
                  <div className="p-6">
                    {/* Avatar and Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {getInitials(donor)}
                        </div>
                        {donor.is_active && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {getDonorName(donor)}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {donor.email}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg group-hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm">Total donné</span>
                        </div>
                        <span className="font-bold text-primary">
                          {formatCurrency(donor.total_donated)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-muted/30 rounded text-center">
                          <p className="text-xs text-muted-foreground mb-1">Dons</p>
                          <p className="font-semibold">{donor.donation_count || 0}</p>
                        </div>
                        {donor.phone && (
                          <div className="p-2 bg-muted/30 rounded text-center">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                              <Phone className="w-3 h-3" />
                              Téléphone
                            </p>
                            <p className="font-semibold text-sm truncate">{donor.phone}</p>
                          </div>
                        )}
                      </div>

                      {donor.last_donation_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                          <Calendar className="w-4 h-4" />
                          <span>Dernier don: {formatDate(donor.last_donation_date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4 flex justify-end">
                      <Badge variant={donor.is_active ? 'success' : 'info'} className="shadow-sm">
                        {donor.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination - Modern Design */}
          {pagination.totalPages > 1 && (
            <Card className="border-2 border-border/50">
              <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Affichage de <span className="font-semibold text-foreground">
                    {(pagination.page - 1) * pagination.pageSize + 1}
                  </span> à <span className="font-semibold text-foreground">
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                  </span> sur <span className="font-semibold text-foreground">{pagination.total}</span> donateurs
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    className="transition-all hover:scale-105"
                  >
                    Précédent
                  </Button>
                  <div className="px-4 py-2 bg-muted rounded-lg">
                    <span className="font-semibold">{pagination.page}</span>
                    <span className="text-muted-foreground"> / {pagination.totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    className="transition-all hover:scale-105"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
