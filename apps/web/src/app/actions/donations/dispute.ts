'use server';

/**
 * handleDisputeAction - Étape 2.2.5
 * Soumet une réponse (preuves) à un litige Stripe (chargeback).
 */

import { getStripeClient } from '@/lib/payment/stripe';

export async function handleDisputeAction(
  disputeId: string,
  evidence: {
    receipt?: string;
    customer_communication?: string;
    uncategorized_text?: string;
  }
): Promise<{ success?: true; error?: string }> {
  try {
    const stripe = getStripeClient();
    await stripe.disputes.update(disputeId, {
      submit: true,
      evidence: {
        receipt: evidence.receipt ?? undefined,
        customer_communication: evidence.customer_communication ?? undefined,
        uncategorized_text: evidence.uncategorized_text ?? undefined,
      },
      metadata: {},
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de la soumission des preuves';
    return { error: message };
  }
}
