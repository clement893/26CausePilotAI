'use server';

/**
 * getDonatorsDashboardData - Étape 4.1.2
 * Données pour le dashboard Donateurs (LTV, nouveaux, etc.).
 */

import { prisma } from '@/lib/db';

export interface DonatorsDashboardData {
  totalDonators: number;
  newThisMonth: number;
  avgLtv: number;
  totalDonationsValue: number;
  chartNewByMonth: { label: string; value: number }[];
  chartDonationsByMonth: { label: string; value: number }[];
  error?: string;
}

export async function getDonatorsDashboardData(
  organizationId: string
): Promise<DonatorsDashboardData> {
  try {
    const [totalDonators, newThisMonth, agg, donatorsForLtv, donationsByMonthRaw] = await Promise.all([
      prisma.donator.count({ where: { organizationId } }),
      prisma.donator.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.donation.aggregate({
        where: { organizationId, status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.donator.findMany({
        where: { organizationId },
        select: { totalDonations: true },
      }),
      prisma.donation.findMany({
        where: { organizationId, status: 'completed' },
        select: { amount: true, donatedAt: true },
      }),
    ]);

    const totalDonationsValue = Number(agg._sum.amount ?? 0);
    const avgLtv =
      donatorsForLtv.length > 0
        ? donatorsForLtv.reduce((sum, d) => sum + Number(d.totalDonations ?? 0), 0) /
          donatorsForLtv.length
        : 0;

    const now = new Date();
    const chartNewByMonth: { label: string; value: number }[] = [];
    const chartDonationsByMonth: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      chartNewByMonth.push({
        label: d.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' }),
        value: 0, // will fill below with donator count by createdAt
      });
      const monthDonations = donationsByMonthRaw.filter(
        (don) => don.donatedAt && don.donatedAt >= d && don.donatedAt <= end
      );
      chartDonationsByMonth.push({
        label: d.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' }),
        value: monthDonations.reduce((s, x) => s + Number(x.amount), 0),
      });
    }

    const donatorsCreated = await prisma.donator.findMany({
      where: { organizationId },
      select: { createdAt: true },
    });
    for (let i = 0; i < chartNewByMonth.length; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);
      const item = chartNewByMonth[i];
      if (item) {
        item.value = donatorsCreated.filter(
          (c) => c.createdAt >= d && c.createdAt <= end
        ).length;
      }
    }

    return {
      totalDonators,
      newThisMonth,
      avgLtv: Math.round(avgLtv * 100) / 100,
      totalDonationsValue,
      chartNewByMonth,
      chartDonationsByMonth,
    };
  } catch (e) {
    console.error('[getDonatorsDashboardData]', e);
    return {
      totalDonators: 0,
      newThisMonth: 0,
      avgLtv: 0,
      totalDonationsValue: 0,
      chartNewByMonth: [],
      chartDonationsByMonth: [],
      error: e instanceof Error ? e.message : 'Erreur chargement dashboard donateurs',
    };
  }
}
