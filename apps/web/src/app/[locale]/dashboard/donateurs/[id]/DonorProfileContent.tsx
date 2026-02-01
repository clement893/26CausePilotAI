'use client';

/**
 * Profil donateur - Étape 1.2.2
 * Header (DonatorHeader), 4 stats (DonatorStatsCards), 5 onglets : Vue d'ensemble, Dons, Interactions, Notes, Activité.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import {
  Container,
  Card,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  LoadingSkeleton,
  useToast,
} from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { getDonor, getDonorHistory, getDonorStats, listDonorDonations } from '@/lib/api/donors';
import { errorLogger } from '@/lib/logger/errorLogger';
import type { DonorWithStats, Donation, DonorHistory, DonorStats } from '@modele/types';
import {
  DonatorHeader,
  DonatorStatsCards,
  DonationHistoryTable,
  NotesList,
  ActivityTimeline,
} from '@/components/donators';
import { SubscriptionCard } from '@/components/donation-subscriptions';
import { listSubscriptionsAction } from '@/app/actions/subscriptions/list';
import type { DonationSubscription } from '@/components/donation-subscriptions';
import { CommunicationList } from '@/components/donors';
import { ArrowLeft, DollarSign, Gift, TrendingUp } from 'lucide-react';
import type { DonatorNote } from '@/components/donators';

function formatCurrency(amount: string): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(
    parseFloat(amount || '0')
  );
}

function getScore(donor: DonorWithStats): number {
  const count = donor.donation_count ?? 0;
  const total = parseFloat(donor.total_donated ?? '0');
  let score = Math.min(50, count * 5);
  if (total >= 10000) score += 30;
  else if (total >= 1000) score += 20;
  else if (total >= 100) score += 10;
  return Math.min(100, score);
}

export default function DonorProfileContent() {
  const params = useParams();
  const donorId = params?.id as string;
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { error: showErrorToast, info } = useToast();

  const [donor, setDonor] = useState<DonorWithStats | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [history, setHistory] = useState<DonorHistory | null>(null);
  const [stats, setStats] = useState<DonorStats | null>(null);
  const [notes, setNotes] = useState<DonatorNote[]>([]);
  const [subscriptions, setSubscriptions] = useState<DonationSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!activeOrganization) return;
    setIsLoading(true);
    setError(null);
    try {
      const [donorData, donationsRes, historyData, statsData, subsResult] = await Promise.all([
        getDonor(activeOrganization.id, donorId),
        listDonorDonations({
          organizationId: activeOrganization.id,
          donorId,
          page: 1,
          pageSize: 50,
        }),
        getDonorHistory(activeOrganization.id, donorId),
        getDonorStats(activeOrganization.id, donorId),
        listSubscriptionsAction(activeOrganization.id, { donatorId: donorId }),
      ]);
      setDonor(donorData);
      setDonations(donationsRes.items ?? []);
      setHistory(historyData);
      setStats(statsData);
      setNotes([]);
      setSubscriptions(subsResult.subscriptions ?? []);
    } catch (err) {
      const msg = errorLogger.getUserFriendlyMessage(err);
      setError(msg);
      showErrorToast(msg);
      errorLogger.error('Failed to load donor profile', err instanceof Error ? err : new Error(String(err)), {
        organizationId: activeOrganization?.id,
        donorId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganization && donorId) loadData();
  }, [activeOrganization?.id, donorId]);

  if (orgLoading || isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="mb-6 h-10 w-32 animate-pulse rounded-lg bg-[#1C1C26]/60" />
        <div className="mb-8 h-40 animate-pulse rounded-xl bg-[#1C1C26]/60" />
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
        <Card className="border-destructive">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">
              {error ? 'Erreur de chargement' : 'Donateur non trouvé'}
            </h3>
            <p className="text-destructive mb-6">{error ?? "Le donateur demandé n'existe pas ou a été supprimé."}</p>
            <Link href="/dashboard/donateurs">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liste
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  const score = getScore(donor);
  const statsCards = {
    totalCollected: {
      value: formatCurrency(donor.total_donated),
      label: 'Total collecté',
      trend: stats?.this_year_total ? `+${formatCurrency(stats.this_year_total)} cette année` : undefined,
      gradient: 'bg-primary/20 text-primary',
      icon: <DollarSign className="h-5 w-5" />,
    },
    donationCount: {
      value: donor.donation_count ?? 0,
      label: 'Dons effectués',
      trend: stats?.this_month_count ? `+${stats.this_month_count} ce mois` : undefined,
      gradient: 'bg-success/20 text-success',
      icon: <Gift className="h-5 w-5" />,
    },
    averageDonation: {
      value: stats?.average_donation ? formatCurrency(stats.average_donation) : '—',
      label: 'Montant moyen',
      trend: undefined,
      gradient: 'bg-warning/20 text-warning',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    score: { value: score, max: 100, label: "Score d'engagement" },
  };

  return (
    <Container className="py-8 lg:py-12">
      <Link href="/dashboard/donateurs" className="inline-block mb-4">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>
      </Link>

      <DonatorHeader
        donor={donor}
        basePath="/dashboard/donateurs"
        onSendEmail={() => info('Envoi d’email en préparation…')}
        onAddNote={() => info('Ajout de note en préparation…')}
        onMarkVip={() => info('Marquer comme VIP en préparation…')}
        onDeactivate={() => info('Désactivation en préparation…')}
        onDelete={() => {
          if (confirm('Supprimer ce donateur ? Cette action est irréversible.')) {
            info('Suppression en préparation…');
          }
        }}
        onExport={() => info('Export en préparation…')}
      />

      <div className="mt-8">
        <DonatorStatsCards
          totalCollected={statsCards.totalCollected}
          donationCount={statsCards.donationCount}
          averageDonation={statsCards.averageDonation}
          score={statsCards.score}
        />
      </div>

      <Tabs defaultTab="overview" className="mt-8">
        <TabList>
          <Tab value="overview">Vue d&apos;ensemble</Tab>
          <Tab value="donations">Historique des dons ({donations.length})</Tab>
          <Tab value="subscriptions">Abonnements ({subscriptions.length})</Tab>
          <Tab value="interactions">Interactions</Tab>
          <Tab value="notes">Notes</Tab>
          <Tab value="activity">Activité</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <Card>
                <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
                <div className="space-y-3 text-sm">
                  <div><span className="text-gray-400">Prénom</span><br />{donor.first_name ?? '—'}</div>
                  <div><span className="text-gray-400">Nom</span><br />{donor.last_name ?? '—'}</div>
                  <div><span className="text-gray-400">Email</span><br />{donor.email}</div>
                  <div><span className="text-gray-400">Téléphone</span><br />{donor.phone ?? '—'}</div>
                  {donor.address && (
                    <div>
                      <span className="text-gray-400">Adresse</span><br />
                      {[donor.address.street, donor.address.city, donor.address.province, donor.address.postal_code, donor.address.country].filter(Boolean).join(', ') || '—'}
                    </div>
                  )}
                </div>
              </Card>
              <Card>
                <h2 className="text-lg font-semibold mb-4">Préférences de communication</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Langue</span>
                    <span>{donor.preferred_language === 'fr' ? 'Français' : 'Anglais'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email marketing</span>
                    <span>{donor.opt_in_email ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMS</span>
                    <span>{donor.opt_in_sms ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Courrier postal</span>
                    <span>{donor.opt_in_postal ? 'Oui' : 'Non'}</span>
                  </div>
                </div>
              </Card>
              {stats && (
                <Card className="md:col-span-2 lg:col-span-1">
                  <h2 className="text-lg font-semibold mb-4">Métriques de dons</h2>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-gray-400">Premier don</span><br />{stats.first_donation_date ? new Date(stats.first_donation_date).toLocaleDateString('fr-CA') : '—'}</div>
                    <div><span className="text-gray-400">Dernier don</span><br />{stats.last_donation_date ? new Date(stats.last_donation_date).toLocaleDateString('fr-CA') : '—'}</div>
                    <div><span className="text-gray-400">Plus gros don</span><br />{stats.largest_donation ? formatCurrency(stats.largest_donation) : '—'}</div>
                  </div>
                </Card>
              )}
            </div>
          </TabPanel>

          <TabPanel value="donations">
            <div className="mt-6">
              <DonationHistoryTable
                donations={donations}
                onViewDetails={() => {}}
                onRefund={() => info('Remboursement en préparation…')}
                onDownloadReceipt={() => info('Téléchargement du reçu en préparation…')}
                emptyMessage="Ce donateur n'a pas encore effectué de don. Invitez-le à contribuer !"
              />
            </div>
          </TabPanel>

          <TabPanel value="subscriptions">
            <div className="mt-6 space-y-4">
              {subscriptions.length === 0 ? (
                <Card className="p-8 text-center text-[var(--text-secondary,#A0A0B0)]">
                  Aucun abonnement (don récurrent) pour ce donateur.
                </Card>
              ) : (
                subscriptions.map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onPaused={loadData}
                    onResumed={loadData}
                    onCancelled={loadData}
                    onError={(msg) => showErrorToast(msg)}
                  />
                ))
              )}
            </div>
          </TabPanel>

          <TabPanel value="interactions">
            <div className="mt-6">
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Historique des communications</h2>
                  <CommunicationList donorId={donorId} />
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel value="notes">
            <div className="mt-6">
              <NotesList
                notes={notes}
                onAddNote={() => info('Ajout de note en préparation…')}
                emptyMessage="Aucune note pour ce donateur. Ajoutez la première !"
              />
            </div>
          </TabPanel>

          <TabPanel value="activity">
            <div className="mt-6">
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Activité</h2>
                  <ActivityTimeline
                    activities={history?.activities ?? []}
                    emptyMessage="Aucune activité enregistrée"
                  />
                </div>
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}
