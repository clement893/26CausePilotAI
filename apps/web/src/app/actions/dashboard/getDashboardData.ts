'use server';

/**
 * getDashboardData - Étape 4.1.1
 * Récupère les données agrégées pour le dashboard (KPIs, activité récente, données graphiques).
 */

import { prisma } from '@/lib/db';

export interface DashboardKpis {
  totalDonors: number;
  totalDonations: number;
  donationsThisMonth: number;
  newDonorsThisMonth: number;
}

export interface DashboardActivityItem {
  id: string;
  type: 'donation' | 'signup' | 'campaign' | 'form';
  title: string;
  description?: string;
  date: string;
  href?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  recentActivity: DashboardActivityItem[];
  chartDonationsByMonth: ChartDataPoint[];
  error?: string;
}

export async function getDashboardData(
  organizationId: string
): Promise<DashboardData> {
  try {
    const [
      totalDonors,
      donationsAgg,
      donationsThisMonthAgg,
      newDonorsThisMonth,
      recentDonations,
    ] = await Promise.all([
      prisma.donator.count({ where: { organizationId } }),
      prisma.donation.aggregate({
        where: { organizationId, status: 'completed' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donation.aggregate({
        where: {
          organizationId,
          status: 'completed',
          donatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.donator.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.donation.findMany({
        where: { organizationId },
        include: { donator: true },
        orderBy: { donatedAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalDonations = Number(donationsAgg._sum.amount ?? 0);
    const donationsThisMonth = Number(donationsThisMonthAgg._sum.amount ?? 0);

    type DonationWithDonator = (typeof recentDonations)[number];
    const recentActivity: DashboardActivityItem[] = recentDonations.map((d: DonationWithDonator) => ({
      id: d.id,
      type: 'donation',
      title: `Don de ${Number(d.amount).toFixed(2)} ${d.currency}`,
      description: [d.donator.firstName, d.donator.lastName].filter(Boolean).join(' ').trim() || d.donator.email,
      date: d.donatedAt.toLocaleDateString('fr-CA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      href: `/dashboard/donateurs/${d.donatorId}`,
    }));

    // Donations par mois (6 derniers mois) pour le graphique
    const now = new Date();
    const chartDonationsByMonth: ChartDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const agg = await prisma.donation.aggregate({
        where: {
          organizationId,
          status: 'completed',
          donatedAt: { gte: d, lte: end },
        },
        _sum: { amount: true },
      });
      chartDonationsByMonth.push({
        label: d.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' }),
        value: Number(agg._sum.amount ?? 0),
      });
    }

    return {
      kpis: {
        totalDonors,
        totalDonations,
        donationsThisMonth,
        newDonorsThisMonth,
      },
      recentActivity,
      chartDonationsByMonth,
    };
  } catch (e) {
    console.error('[getDashboardData]', e);
    return {
      kpis: {
        totalDonors: 0,
        totalDonations: 0,
        donationsThisMonth: 0,
        newDonorsThisMonth: 0,
      },
      recentActivity: [],
      chartDonationsByMonth: [],
      error: e instanceof Error ? e.message : 'Erreur chargement dashboard',
    };
  }
}
