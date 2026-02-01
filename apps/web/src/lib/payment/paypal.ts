/**
 * PayPal server-side configuration - Étape 2.2.1
 * À utiliser uniquement côté serveur (Server Actions, API routes).
 * Sandbox ou Live selon PAYPAL_ENVIRONMENT.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const paypal = require('@paypal/checkout-server-sdk');

type PayPalClient = InstanceType<typeof paypal.core.PayPalHttpClient>;
type OrdersCreateRequest = InstanceType<typeof paypal.orders.OrdersCreateRequest>;
type OrdersCaptureRequest = InstanceType<typeof paypal.orders.OrdersCaptureRequest>;

function getPayPalClient(): PayPalClient {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set');
  }
  const env = (process.env.PAYPAL_ENVIRONMENT ?? 'sandbox').toLowerCase();
  const environment =
    env === 'live'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}

export interface CreatePayPalOrderParams {
  amount: number;
  currency: string;
  referenceId?: string;
}

export interface CreatePayPalOrderResult {
  orderId: string;
  status: string;
}

/**
 * Crée une commande PayPal et retourne l'ID de commande pour le client.
 * amount : montant dans l'unité de la devise (ex. 25.50).
 */
export async function createPayPalOrder(
  params: CreatePayPalOrderParams
): Promise<CreatePayPalOrderResult> {
  const client = getPayPalClient();
  const request: OrdersCreateRequest = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: params.currency.toUpperCase(),
          value: params.amount.toFixed(2),
        },
        reference_id: params.referenceId,
      },
    ],
  });

  const response = await client.execute(request);
  const result = response.result as { id?: string; status?: string };
  if (!result?.id) {
    throw new Error('PayPal did not return order id');
  }
  return {
    orderId: result.id,
    status: result.status ?? 'CREATED',
  };
}

export interface CapturePayPalPaymentResult {
  orderId: string;
  status: string;
  captureId?: string;
}

/**
 * Capture le paiement d'une commande PayPal (après approbation côté client).
 */
export async function capturePayPalPayment(
  orderId: string
): Promise<CapturePayPalPaymentResult> {
  const client = getPayPalClient();
  const request: OrdersCaptureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const response = await client.execute(request);
  const result = response.result as {
    id?: string;
    status?: string;
    purchase_units?: Array<{ payments?: { captures?: Array<{ id?: string }> } }>;
  };
  if (!result?.id) {
    throw new Error('PayPal capture failed');
  }
  const captureId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  return {
    orderId: result.id,
    status: result.status ?? 'COMPLETED',
    captureId,
  };
}
