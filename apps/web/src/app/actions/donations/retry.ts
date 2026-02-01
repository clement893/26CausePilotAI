'use server';

/**
 * retryPaymentAction - Étape 2.2.5
 * Vérifie si un paiement échoué peut être relancé (Stripe) ou retourne une indication.
 */

import { prisma } from '@/lib/db';
import { getStripeClient } from '@/lib/payment/stripe';

export async function retryPaymentAction(
  submissionId: string
): Promise<{
  success?: true;
  clientSecret?: string;
  message?: string;
  error?: string;
}> {
  try {
    const submission = await prisma.donationFormSubmission.findUnique({
      where: { id: submissionId },
      include: { paymentIntent: true },
    });

    if (!submission) return { error: 'Soumission introuvable' };
    const pi = submission.paymentIntent;
    if (!pi) return { error: 'Aucun paiement associé à cette soumission' };
    if (pi.gateway !== 'stripe') {
      return { message: 'La relance n’est disponible que pour les paiements Stripe.' };
    }

    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(pi.externalId);

    if (paymentIntent.status === 'succeeded') {
      return { message: 'Ce paiement a déjà réussi.' };
    }
    if (paymentIntent.status === 'canceled') {
      return { error: 'Ce paiement a été annulé. Créez un nouveau don pour réessayer.' };
    }
    if (paymentIntent.status === 'requires_payment_method' && paymentIntent.client_secret) {
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        message: 'Le donateur peut réessayer avec le même lien de paiement.',
      };
    }

    return {
      message: 'Le paiement ne peut pas être relancé dans cet état. Demandez au donateur de repasser par le formulaire de don.',
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Impossible de vérifier le paiement';
    return { error: message };
  }
}
