/**
 * Interface unifiée des passerelles de paiement - Étape 2.2.1
 * Permet d'interagir avec Stripe et PayPal de manière transparente.
 */

export type PaymentGateway = 'stripe' | 'paypal';

export interface CreatePaymentParams {
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
  referenceId?: string;
}

export interface CreatePaymentResult {
  gateway: PaymentGateway;
  clientSecret?: string;
  orderId?: string;
  paymentIntentId?: string;
}

export interface ConfirmPaymentParams {
  gateway: PaymentGateway;
  paymentId: string;
  paymentMethodId?: string;
}

export interface ConfirmPaymentResult {
  gateway: PaymentGateway;
  status: string;
  paymentId: string;
  captureId?: string;
}

// Re-export Stripe
export {
  getStripeClient,
  createStripePaymentIntent,
  getStripePaymentIntentStatus,
  confirmStripePayment,
  type CreateStripePaymentIntentParams,
  type CreateStripePaymentIntentResult,
  type ConfirmStripePaymentResult,
} from './stripe';

// Re-export PayPal
export {
  createPayPalOrder,
  capturePayPalPayment,
  type CreatePayPalOrderParams,
  type CreatePayPalOrderResult,
  type CapturePayPalPaymentResult,
} from './paypal';

/**
 * Crée un paiement via la passerelle demandée.
 * Retourne clientSecret (Stripe) ou orderId (PayPal) pour le front.
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<CreatePaymentResult> {
  const { gateway, amount, currency, metadata, referenceId } = params;

  if (gateway === 'stripe') {
    const { createStripePaymentIntent } = await import('./stripe');
    const result = await createStripePaymentIntent({
      amount,
      currency,
      metadata,
    });
    return {
      gateway: 'stripe',
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    };
  }

  if (gateway === 'paypal') {
    const { createPayPalOrder } = await import('./paypal');
    const result = await createPayPalOrder({
      amount,
      currency,
      referenceId,
    });
    return {
      gateway: 'paypal',
      orderId: result.orderId,
    };
  }

  throw new Error(`Unknown gateway: ${gateway}`);
}

/**
 * Confirme / capture un paiement selon la passerelle.
 * Stripe : récupère le statut du PaymentIntent (après confirmation client).
 * PayPal : capture la commande.
 */
export async function confirmPayment(
  params: ConfirmPaymentParams
): Promise<ConfirmPaymentResult> {
  const { gateway, paymentId, paymentMethodId } = params;

  if (gateway === 'stripe') {
    if (paymentMethodId) {
      const { confirmStripePayment } = await import('./stripe');
      const result = await confirmStripePayment(paymentId, paymentMethodId);
      return {
        gateway: 'stripe',
        status: result.status,
        paymentId: result.paymentIntentId,
      };
    }
    const { getStripePaymentIntentStatus } = await import('./stripe');
    const result = await getStripePaymentIntentStatus(paymentId);
    return {
      gateway: 'stripe',
      status: result.status,
      paymentId: result.paymentIntentId,
    };
  }

  if (gateway === 'paypal') {
    const { capturePayPalPayment } = await import('./paypal');
    const result = await capturePayPalPayment(paymentId);
    return {
      gateway: 'paypal',
      status: result.status,
      paymentId: result.orderId,
      captureId: result.captureId,
    };
  }

  throw new Error(`Unknown gateway: ${gateway}`);
}
