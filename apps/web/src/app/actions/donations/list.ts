'use server';

/**
 * List donations - Étape 2.2.5
 * Liste les dons d'une organisation pour l'interface de gestion.
 */

import { prisma } from '@/lib/db';

export interface DonationRow {
  id: string;
  donatorId: string;
  donatorEmail: string;
  donatorName: string;
  formId: string | null;
  formTitle: string | null;
  amount: number;
  currency: string;
  status: string;
  donatedAt: Date;
  canRefund: boolean;
  gateway: string | null;
}

export async function listDonationsAction(
  organizationId: string,
  options?: { status?: string; limit?: number; offset?: number }
): Promise<{ donations: DonationRow[]; total: number; error?: string }> {
  try {
    const where: { organizationId: string; status?: string } = {
      organizationId,
    };
    if (options?.status) where.status = options.status;

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          donator: true,
          form: true,
          submission: {
            include: { paymentIntent: true },
          },
        },
        orderBy: { donatedAt: 'desc' },
        take: options?.limit ?? 50,
        skip: options?.offset ?? 0,
      }),
      prisma.donation.count({ where }),
    ]);

    type DonationWithRelations = (typeof donations)[number];
    const rows: DonationRow[] = donations.map((d: DonationWithRelations) => {
      const pi = d.submission?.paymentIntent;
      const canRefund =
        d.status === 'completed' &&
        !!pi &&
        (pi.gateway === 'stripe' ? !!pi.externalId : !!(pi.metadata as Record<string, unknown>)?.paypalCaptureId);
      return {
        id: d.id,
        donatorId: d.donatorId,
        donatorEmail: d.donator.email,
        donatorName: [d.donator.firstName, d.donator.lastName].filter(Boolean).join(' ').trim() || d.donator.email,
        formId: d.formId,
        formTitle: d.form?.title ?? null,
        amount: Number(d.amount),
        currency: d.currency,
        status: d.status,
        donatedAt: d.donatedAt,
        canRefund,
        gateway: pi?.gateway ?? null,
      };
    });

    return { donations: rows, total };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to list donations';
    return { donations: [], total: 0, error: message };
  }
}
