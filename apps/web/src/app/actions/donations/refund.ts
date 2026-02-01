'use server';

/**
 * refundDonationAction - Étape 2.2.5
 * Rembourse un don via Stripe ou PayPal et met à jour le statut en base.
 */

import { prisma } from '@/lib/db';
import { refundStripePayment } from '@/lib/payment/stripe';
import { refundPayPalCapture } from '@/lib/payment/paypal';

export async function refundDonationAction(
  donationId: string,
  options?: { reason?: string; note?: string; amount?: number }
): Promise<{ success?: true; error?: string }> {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        submission: { include: { paymentIntent: true } },
      },
    });

    if (!donation) return { error: 'Don introuvable' };
    if (donation.status === 'refunded') return { error: 'Ce don a déjà été remboursé' };
    if (donation.status !== 'completed') return { error: 'Seul un don complété peut être remboursé' };

    const pi = donation.submission?.paymentIntent;
    if (!pi) return { error: 'Aucune information de paiement pour ce don' };

    const amount = options?.amount ?? Number(donation.amount);
    const reason = (options?.reason ?? 'requested_by_customer') as
      | 'duplicate'
      | 'fraudulent'
      | 'requested_by_customer';

    if (pi.gateway === 'stripe') {
      await refundStripePayment({
        paymentIntentId: pi.externalId,
        amount: amount > 0 ? amount : undefined,
        reason: ['duplicate', 'fraudulent', 'requested_by_customer'].includes(reason)
          ? reason
          : 'requested_by_customer',
      });
    } else if (pi.gateway === 'paypal') {
      const captureId = (pi.metadata as Record<string, unknown>)?.paypalCaptureId as string | undefined;
      if (!captureId) return { error: 'ID de capture PayPal manquant pour ce don' };
      await refundPayPalCapture({
        captureId,
        amount: amount > 0 ? amount : undefined,
        currency: donation.currency,
        note: options?.note ?? options?.reason,
      });
    } else {
      return { error: 'Passerelle de paiement non prise en charge pour le remboursement' };
    }

    await prisma.donation.update({
      where: { id: donationId },
      data: { status: 'refunded' },
    });

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec du remboursement';
    return { error: message };
  }
}
