/**
 * Stripe server-side configuration - Étape 2.2.1
 * À utiliser uniquement côté serveur (Server Actions, API routes).
 * Clé secrète chargée depuis STRIPE_SECRET_KEY.
 */

import Stripe from 'stripe';

function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return key;
}

let stripeClient: Stripe | null = null;

/**
 * Retourne le client Stripe initialisé avec la clé secrète.
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(getStripeSecretKey(), {
      typescript: true,
    });
  }
  return stripeClient;
}

export interface CreateStripePaymentIntentParams {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CreateStripePaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Crée un PaymentIntent Stripe et retourne le client_secret pour le client.
 * amount : montant dans l'unité de la devise (ex. 25.50 pour 25,50 CAD).
 * Stripe attend les centimes pour la plupart des devises, donc on multiplie par 100.
 */
export async function createStripePaymentIntent(
  params: CreateStripePaymentIntentParams
): Promise<CreateStripePaymentIntentResult> {
  const stripe = getStripeClient();
  const amountCents = Math.round(params.amount * 100);
  const currency = params.currency.toLowerCase();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: params.metadata ?? {},
  });

  if (!paymentIntent.client_secret) {
    throw new Error('Stripe did not return client_secret');
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export interface ConfirmStripePaymentResult {
  status: 'succeeded' | 'processing' | 'requires_action' | 'requires_payment_method' | 'canceled';
  paymentIntentId: string;
}

/**
 * Récupère le statut d'un PaymentIntent (après confirmation côté client).
 * Utile pour vérifier que le paiement a bien abouti avant de finaliser la donation.
 */
export async function getStripePaymentIntentStatus(
  paymentIntentId: string
): Promise<ConfirmStripePaymentResult> {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    status: paymentIntent.status as ConfirmStripePaymentResult['status'],
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Confirme un PaymentIntent (côté serveur avec payment_method_id).
 * Utilisé si la confirmation est faite serveur plutôt que client.
 */
export async function confirmStripePayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<ConfirmStripePaymentResult> {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });

  return {
    status: paymentIntent.status as ConfirmStripePaymentResult['status'],
    paymentIntentId: paymentIntent.id,
  };
}

export interface RefundStripePaymentParams {
  paymentIntentId: string;
  amount?: number; // optional partial refund (in currency units)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface RefundStripePaymentResult {
  refundId: string;
  status: string;
}

/**
 * Rembourse un paiement Stripe (Étape 2.2.5).
 * Récupère la charge du PaymentIntent puis crée un refund.
 */
export async function refundStripePayment(
  params: RefundStripePaymentParams
): Promise<RefundStripePaymentResult> {
  const stripe = getStripeClient();
  const pi = await stripe.paymentIntents.retrieve(params.paymentIntentId);
  const chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : pi.latest_charge?.id;
  if (!chargeId) {
    throw new Error('No charge found for this payment intent');
  }
  const reason = (params.reason ?? 'requested_by_customer') as
    | 'duplicate'
    | 'fraudulent'
    | 'requested_by_customer';
  const refund = await stripe.refunds.create({
    charge: chargeId,
    reason,
    ...(params.amount != null && params.amount > 0
      ? { amount: Math.round(params.amount * 100) }
      : {}),
  });
  return {
    refundId: refund.id,
    status: refund.status ?? 'succeeded',
  };
}
