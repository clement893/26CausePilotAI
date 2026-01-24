'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Card, Button, Badge, Tabs, TabList, Tab, TabPanels, TabPanel, LoadingSkeleton } from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { getDonor, getDonorHistory, getDonorStats, listDonorDonations } from '@/lib/api/donors';
import type { DonorWithStats, Donation, DonorHistory, DonorStats } from '@modele/types';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, Activity, Tag, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { ColorVariant } from '@/components/ui/types';
import { TagSelector, SegmentSelector, CommunicationList } from '@/components/donors';

export default function DonorDetailPage() {
  const params = useParams();
  const donorId = params.id as string;
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [donor, setDonor] = useState<DonorWithStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [history, setHistory] = useState<DonorHistory | null>(null);
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update activeTab when tab changes
  const handleTabChange = (_tabId: string) => {
    // Tab change handler
  };

  useEffect(() => {
    if (activeOrganization && !orgLoading) {
      loadDonorData();
    }
  }, [activeOrganization, donorId, orgLoading]);

  const loadDonorData = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load donor details
      const donorData = await getDonor(activeOrganization.id, donorId);
      setDonor(donorData);

      // Load donations
      const donationsData = await listDonorDonations({
        organizationId: activeOrganization.id,
        donorId,
        page: 1,
        pageSize: 50,
      });
      setDonations(donationsData.items);

      // Load history
      const historyData = await getDonorHistory(activeOrganization.id, donorId);
      setHistory(historyData);

      // Load stats
      const statsData = await getDonorStats(activeOrganization.id, donorId);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load donor data');
    } finally {
      setIsLoading(false);
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
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeVariant = (status: string): ColorVariant => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Complété',
      pending: 'En attente',
      failed: 'Échoué',
      refunded: 'Remboursé',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  };

  if (orgLoading || isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="mb-6 h-10 w-32 animate-pulse rounded-lg bg-muted/60" />
        <div className="mb-8 h-12 w-64 animate-pulse rounded-lg bg-muted/60" />
        <LoadingSkeleton variant="stats" count={4} className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton variant="card" count={2} />
        </div>
      </Container>
    );
  }

  if (error || !donor) {
    return (
      <Container className="py-8 lg:py-12">
        <Card>
          <div className="text-center py-12">
            <p className="text-destructive">{error || 'Donateur non trouvé'}</p>
            <Link href="/dashboard/base-donateur/donateurs">
              <Button variant="outline" className="mt-4">
                Retour à la liste
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/base-donateur/donateurs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {donor.first_name || donor.last_name
                ? `${donor.first_name || ''} ${donor.last_name || ''}`.trim()
                : donor.email}
            </h1>
            <p className="text-muted-foreground">{donor.email}</p>
          </div>
          <Badge variant={donor.is_active ? 'success' : 'info'}>
            {donor.is_active ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-medium">Total donné</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(donor.total_donated)}</p>
          </div>
        </Card>
        <Card className="border-l-4 border-l-success bg-gradient-to-br from-success/10 via-success/5 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-success/20 rounded-lg">
                <Activity className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-medium">Nombre de dons</p>
            <p className="text-3xl font-bold text-success">{donor.donation_count}</p>
          </div>
        </Card>
        <Card className="border-l-4 border-l-warning bg-gradient-to-br from-warning/10 via-warning/5 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-warning/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-medium">Don moyen</p>
            <p className="text-3xl font-bold text-warning">
              {stats?.average_donation ? formatCurrency(stats.average_donation) : '-'}
            </p>
          </div>
        </Card>
        <Card className="border-l-4 border-l-info bg-gradient-to-br from-info/10 via-info/5 to-transparent hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-info/20 rounded-lg">
                <Calendar className="w-6 h-6 text-info" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 font-medium">Dernier don</p>
            <p className="text-lg font-bold text-info">
              {donor.last_donation_date ? formatDate(donor.last_donation_date) : 'Aucun'}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultTab="overview" onChange={handleTabChange} className="mt-6">
        <TabList>
          <Tab value="overview">Vue d'ensemble</Tab>
          <Tab value="donations">Dons ({donations.length})</Tab>
          <Tab value="tags">
            <Tag className="w-4 h-4 mr-2" />
            Tags
          </Tab>
          <Tab value="segments">
            <Users className="w-4 h-4 mr-2" />
            Segments
          </Tab>
          <Tab value="communications">
            <MessageSquare className="w-4 h-4 mr-2" />
            Communications
          </Tab>
          <Tab value="history">Historique</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span>{donor.email}</span>
                </div>
                {donor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span>{donor.phone}</span>
                  </div>
                )}
                {donor.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      {donor.address.street && <div>{donor.address.street}</div>}
                      {donor.address.city && (
                        <div>
                          {donor.address.city}
                          {donor.address.province && `, ${donor.address.province}`}
                          {donor.address.postal_code && ` ${donor.address.postal_code}`}
                        </div>
                      )}
                      {donor.address.country && <div>{donor.address.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Preferences */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Préférences</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Langue préférée</span>
                  <span>{donor.preferred_language === 'fr' ? 'Français' : 'Anglais'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email marketing</span>
                  <Badge variant={donor.opt_in_email ? 'success' : 'default'}>
                    {donor.opt_in_email ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SMS</span>
                  <Badge variant={donor.opt_in_sms ? 'success' : 'default'}>
                    {donor.opt_in_sms ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Courrier postal</span>
                  <Badge variant={donor.opt_in_postal ? 'success' : 'default'}>
                    {donor.opt_in_postal ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anonyme</span>
                  <Badge variant={donor.is_anonymous ? 'default' : 'default'}>
                    {donor.is_anonymous ? 'Oui' : 'Non'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            {stats && (
              <Card className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Statistiques détaillées</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cette année</p>
                    <p className="text-lg font-semibold">{formatCurrency(stats.this_year_total)}</p>
                    <p className="text-xs text-muted-foreground">{stats.this_year_count} dons</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ce mois</p>
                    <p className="text-lg font-semibold">{formatCurrency(stats.this_month_total)}</p>
                    <p className="text-xs text-muted-foreground">{stats.this_month_count} dons</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plus grand don</p>
                    <p className="text-lg font-semibold">
                      {stats.largest_donation ? formatCurrency(stats.largest_donation) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Premier don</p>
                    <p className="text-lg font-semibold">
                      {stats.first_donation_date ? formatDate(stats.first_donation_date) : '-'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
          </TabPanel>

          {/* Donations Tab */}
          <TabPanel value="donations">
            {donations.length === 0 ? (
              <Card>
                <div className="text-center py-16">
                  <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Aucun don enregistré</h3>
                  <p className="text-muted-foreground">Les dons de ce donateur apparaîtront ici</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donations.map((donation) => (
                  <Card
                    key={donation.id}
                    className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(donation.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(donation.payment_date || donation.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(donation.payment_status)} className="shadow-sm">
                          {getStatusLabel(donation.payment_status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Type</p>
                          <p className="text-sm font-medium capitalize">
                            {donation.donation_type.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Reçu fiscal</p>
                          {donation.receipt_sent ? (
                            <Badge variant="default" className="text-xs">Envoyé</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Non envoyé</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabPanel>

          {/* Tags Tab */}
          <TabPanel value="tags">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Gestion des Tags</h2>
                <TagSelector
                  donorId={donorId}
                  assignedTagIds={donor.tags || []}
                  onTagsChange={() => {
                    loadDonorData();
                  }}
                />
              </div>
            </Card>
          </TabPanel>

          {/* Segments Tab */}
          <TabPanel value="segments">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Segments</h2>
                <SegmentSelector
                  donorId={donorId}
                  selectedSegmentIds={[]} // TODO: Load from API
                  onSegmentsChange={(segmentIds) => {
                    console.log('Segments changed:', segmentIds);
                  }}
                />
              </div>
            </Card>
          </TabPanel>

          {/* Communications Tab */}
          <TabPanel value="communications">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Historique des Communications</h2>
                <CommunicationList donorId={donorId} />
              </div>
            </Card>
          </TabPanel>

          {/* History Tab */}
          <TabPanel value="history">
          <Card>
            {history && history.activities.length > 0 ? (
              <div className="space-y-4">
                {history.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 p-4 border-b last:border-b-0">
                    <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                          {activity.activity_data && Object.keys(activity.activity_data).length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {JSON.stringify(activity.activity_data, null, 2)}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDateTime(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune activité enregistrée</p>
              </div>
            )}
          </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
