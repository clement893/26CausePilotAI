'use server';

/**
 * List subscriptions - Étape 2.2.4
 * Liste les abonnements (dons récurrents) par organisation ou par donateur.
 */

import { prisma } from '@/lib/db';

export interface DonationSubscriptionRow {
  id: string;
  donatorId: string;
  donatorEmail: string;
  donatorName: string;
  formId: string;
  formTitle: string;
  amount: number;
  currency: string;
  frequency: string;
  gateway: string;
  status: string;
  startDate: Date;
  nextPaymentDate: Date;
  endDate: Date | null;
  cancelledAt: Date | null;
  donationCount: number;
}

export async function listSubscriptionsAction(
  organizationId: string,
  options?: { donatorId?: string; status?: string }
): Promise<{ subscriptions: DonationSubscriptionRow[]; error?: string }> {
  try {
    type StatusFilter = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
    const where: {
      organizationId: string;
      donatorId?: string;
      status?: StatusFilter;
    } = {
      organizationId,
    };
    if (options?.donatorId) where.donatorId = options.donatorId;
    if (options?.status && (['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'] as const).includes(options.status as StatusFilter)) {
      where.status = options.status as StatusFilter;
    }

    const rows = await prisma.subscription.findMany({
      where,
      include: {
        donator: true,
        form: true,
        _count: { select: { donations: true } },
      },
      orderBy: { nextPaymentDate: 'asc' },
    });

    /** Shape of each row when include is used (avoids depending on generated Prisma types in Docker) */
    type SubWithRelations = {
      id: string;
      donatorId: string;
      donator: { email: string; firstName: string | null; lastName: string | null };
      form: { title: string };
      formId: string;
      amount: unknown;
      currency: string;
      frequency: string;
      gateway: string;
      status: string;
      startDate: Date;
      nextPaymentDate: Date;
      endDate: Date | null;
      cancelledAt: Date | null;
      _count: { donations: number };
    };
    const subscriptions: DonationSubscriptionRow[] = rows.map((s: SubWithRelations) => ({
      id: s.id,
      donatorId: s.donatorId,
      donatorEmail: s.donator.email,
      donatorName: [s.donator.firstName, s.donator.lastName].filter(Boolean).join(' ').trim() || s.donator.email,
      formId: s.formId,
      formTitle: s.form.title,
      amount: Number(s.amount),
      currency: s.currency,
      frequency: s.frequency,
      gateway: s.gateway,
      status: s.status,
      startDate: s.startDate,
      nextPaymentDate: s.nextPaymentDate,
      endDate: s.endDate,
      cancelledAt: s.cancelledAt,
      donationCount: s._count.donations,
    }));

    return { subscriptions };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to list subscriptions';
    return { subscriptions: [], error: message };
  }
}
