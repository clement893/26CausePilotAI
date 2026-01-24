'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { Container, Card, Button, Input, Badge } from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { listDonors, type ListDonorsParams } from '@/lib/api/donors';
import type { Donor } from '@modele/types';
import { Search, Plus, Mail, Phone, DollarSign, Calendar } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function DonateursPage() {
  const locale = useLocale();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donors');
      setDonors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination({ ...pagination, page: 1 });
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

  if (orgLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Donateurs</h1>
          <p className="text-muted-foreground">Gérez votre base de données de donateurs</p>
        </div>
        <Link href={`/${locale}/dashboard/base-donateur/donateurs/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau donateur
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive: e.target.value === 'all' ? undefined : e.target.value === 'true',
                })
              }
              className="px-3 py-2 border rounded-md bg-background text-foreground"
            >
              <option value="all">Tous les statuts</option>
              <option value="true">Actifs uniquement</option>
              <option value="false">Inactifs uniquement</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-destructive">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Donors List */}
      <Card>
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des donateurs...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun donateur trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Nom</th>
                    <th className="text-left p-4 font-semibold">Email</th>
                    <th className="text-left p-4 font-semibold">Téléphone</th>
                    <th className="text-right p-4 font-semibold">Total donné</th>
                    <th className="text-right p-4 font-semibold">Dons</th>
                    <th className="text-left p-4 font-semibold">Dernier don</th>
                    <th className="text-left p-4 font-semibold">Statut</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor) => (
                    <tr key={donor.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">
                          {donor.first_name || donor.last_name
                            ? `${donor.first_name || ''} ${donor.last_name || ''}`.trim()
                            : donor.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{donor.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {donor.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{donor.phone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{formatCurrency(donor.total_donated)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span>{donor.donation_count}</span>
                      </td>
                      <td className="p-4">
                        {donor.last_donation_date ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(donor.last_donation_date)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Aucun don</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={donor.is_active ? 'success' : 'info'}>
                          {donor.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/${locale}/dashboard/base-donateur/donateurs/${donor.id}`}>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.total} donateurs)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </Container>
  );
}
