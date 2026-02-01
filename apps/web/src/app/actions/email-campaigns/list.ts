'use server';

/**
 * listEmailCampaignsAction - Étape 3.1.3
 * Liste les campagnes email de l'organisation avec KPIs.
 */

import { prisma } from '@/lib/db';

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELED';

export interface CampaignRow {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  audienceName: string;
  templateName: string;
  sentAt: Date | null;
  scheduledAt: Date | null;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export interface ListCampaignsResult {
  campaigns: CampaignRow[];
  total: number;
  kpis: {
    totalCampaigns: number;
    avgOpenRate: number;
    avgClickRate: number;
  };
}

function parseStats(stats: unknown): { sent: number; opened: number; clicked: number } {
  if (!stats || typeof stats !== 'object') return { sent: 0, opened: 0, clicked: 0 };
  const s = stats as Record<string, unknown>;
  const sent = Number(s.sent) || 0;
  const opened = Number(s.opened) || 0;
  const clicked = Number(s.clicked) || 0;
  return { sent, opened, clicked };
}

export async function listEmailCampaignsAction(
  organizationId: string,
  options?: { status?: CampaignStatus; limit?: number; offset?: number }
): Promise<{ error?: string } & Partial<ListCampaignsResult>> {
  try {
    const where: { organizationId: string; status?: CampaignStatus } = { organizationId };
    if (options?.status) where.status = options.status;

    const [campaigns, total, allForKpis] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        include: { template: true, audience: true },
        orderBy: { createdAt: 'desc' },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
      }),
      prisma.emailCampaign.count({ where }),
      prisma.emailCampaign.findMany({
        where: { organizationId },
        select: { stats: true },
      }),
    ]);

    type CampaignWithRelations = (typeof campaigns)[number];
    const rows: CampaignRow[] = campaigns.map((c: CampaignWithRelations) => {
      const { sent, opened, clicked } = parseStats(c.stats);
      const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
      const clickRate = sent > 0 ? Math.round((clicked / sent) * 100) : 0;
      return {
        id: c.id,
        name: c.name,
        subject: c.subject,
        status: c.status as CampaignStatus,
        audienceName: c.audience.name,
        templateName: c.template.name,
        sentAt: c.sentAt,
        scheduledAt: c.scheduledAt,
        sent,
        opened,
        clicked,
        openRate,
        clickRate,
      };
    });

    let avgOpenRate = 0;
    let avgClickRate = 0;
    let totalSent = 0;
    for (const c of allForKpis) {
      const { sent, opened, clicked } = parseStats(c.stats);
      if (sent > 0) {
        totalSent += sent;
        avgOpenRate += opened;
        avgClickRate += clicked;
      }
    }
    if (totalSent > 0) {
      avgOpenRate = Math.round((avgOpenRate / totalSent) * 100);
      avgClickRate = Math.round((avgClickRate / totalSent) * 100);
    }

    return {
      campaigns: rows,
      total,
      kpis: {
        totalCampaigns: await prisma.emailCampaign.count({ where: { organizationId } }),
        avgOpenRate,
        avgClickRate,
      },
    };
  } catch (e) {
    console.error('[listEmailCampaignsAction]', e);
    return { error: 'Erreur lors du chargement' };
  }
}
