'use server';

/**
 * getCampaignsDashboardData - Étape 4.1.2
 * Données pour le dashboard Campagnes (email campaigns).
 */

import { prisma } from '@/lib/db';

export interface CampaignsDashboardData {
  totalCampaigns: number;
  sentThisMonth: number;
  draftCount: number;
  sentCount: number;
  chartByStatus: { label: string; value: number }[];
  chartSentByMonth: { label: string; value: number }[];
  error?: string;
}

export async function getCampaignsDashboardData(
  organizationId: string
): Promise<CampaignsDashboardData> {
  try {
    const [totalCampaigns, draftCount, sentCount, sentThisMonth, allCampaigns] = await Promise.all([
      prisma.emailCampaign.count({ where: { organizationId } }),
      prisma.emailCampaign.count({ where: { organizationId, status: 'DRAFT' } }),
      prisma.emailCampaign.count({ where: { organizationId, status: 'SENT' } }),
      prisma.emailCampaign.count({
        where: {
          organizationId,
          status: 'SENT',
          sentAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.emailCampaign.findMany({
        where: { organizationId },
        select: { status: true, sentAt: true },
      }),
    ]);

    const chartByStatus = [
      { label: 'Brouillons', value: draftCount },
      { label: 'Envoyées', value: sentCount },
      {
        label: 'Autres',
        value: totalCampaigns - draftCount - sentCount,
      },
    ].filter((d) => d.value > 0);

    const now = new Date();
    type CampaignRow = (typeof allCampaigns)[number];
    const chartSentByMonth: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = allCampaigns.filter(
        (c: CampaignRow) => c.sentAt && c.sentAt >= d && c.sentAt <= end
      ).length;
      chartSentByMonth.push({
        label: d.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' }),
        value: count,
      });
    }

    return {
      totalCampaigns,
      sentThisMonth,
      draftCount,
      sentCount,
      chartByStatus,
      chartSentByMonth,
    };
  } catch (e) {
    console.error('[getCampaignsDashboardData]', e);
    return {
      totalCampaigns: 0,
      sentThisMonth: 0,
      draftCount: 0,
      sentCount: 0,
      chartByStatus: [],
      chartSentByMonth: [],
      error: e instanceof Error ? e.message : 'Erreur chargement dashboard campagnes',
    };
  }
}
