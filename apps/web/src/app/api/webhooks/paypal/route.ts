/**
 * PayPal Webhook - Étape 2.2.2
 * Vérifie la signature via l'API PayPal, gère PAYMENT.CAPTURE.COMPLETED et PAYMENT.CAPTURE.DENIED.
 * Met à jour PaymentIntent et crée Donation si le paiement réussit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PaymentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAYPAL_VERIFY_URL_SANDBOX = 'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature';
const PAYPAL_VERIFY_URL_LIVE = 'https://api-m.paypal.com/v1/notifications/verify-webhook-signature';

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set');
  }
  const env = (process.env.PAYPAL_ENVIRONMENT ?? 'sandbox').toLowerCase();
  const base = env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('No access_token in PayPal response');
  return json.access_token;
}

async function verifyPayPalWebhook(
  body: Record<string, unknown>,
  headers: {
    'paypal-auth-algo': string | null;
    'paypal-cert-url': string | null;
    'paypal-transmission-id': string | null;
    'paypal-transmission-sig': string | null;
    'paypal-transmission-time': string | null;
  },
  webhookId: string
): Promise<boolean> {
  if (
    !headers['paypal-auth-algo'] ||
    !headers['paypal-cert-url'] ||
    !headers['paypal-transmission-id'] ||
    !headers['paypal-transmission-sig'] ||
    !headers['paypal-transmission-time']
  ) {
    return false;
  }
  const token = await getPayPalAccessToken();
  const env = (process.env.PAYPAL_ENVIRONMENT ?? 'sandbox').toLowerCase();
  const url = env === 'live' ? PAYPAL_VERIFY_URL_LIVE : PAYPAL_VERIFY_URL_SANDBOX;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    }),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { verification_status?: string };
  return json.verification_status === 'SUCCESS';
}

function getPayPalOrderIdFromResource(resource: Record<string, unknown> | undefined): string | null {
  if (!resource) return null;
  const supplementary = resource.supplementary_data as { related_ids?: { order_id?: string } } | undefined;
  const orderId = supplementary?.related_ids?.order_id;
  if (orderId) return orderId;
  return (resource.id as string) ?? null;
}

export async function POST(request: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return NextResponse.json(
      { error: 'PAYPAL_WEBHOOK_ID not configured' },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const verified = await verifyPayPalWebhook(
    body,
    {
      'paypal-auth-algo': request.headers.get('paypal-auth-algo'),
      'paypal-cert-url': request.headers.get('paypal-cert-url'),
      'paypal-transmission-id': request.headers.get('paypal-transmission-id'),
      'paypal-transmission-sig': request.headers.get('paypal-transmission-sig'),
      'paypal-transmission-time': request.headers.get('paypal-transmission-time'),
    },
    webhookId
  );

  if (!verified) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const eventType = body.event_type as string | undefined;
  const resource = body.resource as Record<string, unknown> | undefined;

  try {
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      await handlePaymentCaptureCompleted(resource);
    } else if (eventType === 'PAYMENT.CAPTURE.DENIED') {
      await handlePaymentCaptureDenied(resource);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('[webhooks/paypal]', eventType, e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptureCompleted(resource: Record<string, unknown> | undefined) {
  const orderId = getPayPalOrderIdFromResource(resource);
  if (!orderId) return;

  const pi = await prisma.paymentIntent.findFirst({
    where: { gateway: 'paypal', externalId: orderId },
    include: {
      submission: {
        include: {
          donator: true,
          form: true,
        },
      },
    },
  });

  if (!pi || !pi.submission) return;

  await prisma.$transaction(async (tx) => {
    await tx.paymentIntent.update({
      where: { id: pi.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        succeededAt: new Date(),
        errorCode: null,
        errorMessage: null,
      },
    });

    const sub = pi.submission;
    const donatorId = sub.donatorId;
    if (!donatorId) return;

    const existingDonation = await tx.donation.findFirst({
      where: { submissionId: sub.id },
    });
    if (existingDonation) return;

    await tx.donation.create({
      data: {
        donatorId,
        amount: sub.amount,
        currency: sub.currency,
        status: 'completed',
        formId: sub.formId,
        submissionId: sub.id,
        organizationId: sub.organizationId,
      },
    });

    const donator = sub.donator;
    if (donator) {
      const amountNum = Number(sub.amount);
      await tx.donator.update({
        where: { id: donatorId },
        data: {
          totalDonations: { increment: amountNum },
          donationCount: { increment: 1 },
          lastDonationDate: new Date(),
          averageDonation: donator.donationCount === 0
            ? amountNum
            : (Number(donator.totalDonations) + amountNum) / (donator.donationCount + 1),
          firstDonationDate: donator.firstDonationDate ?? new Date(),
        },
      });
    }

    if (sub.form) {
      await tx.donationForm.update({
        where: { id: sub.formId },
        data: {
          totalCollected: { increment: Number(sub.amount) },
          donationCount: { increment: 1 },
        },
      });
    }
  });
}

async function handlePaymentCaptureDenied(resource: Record<string, unknown> | undefined) {
  const orderId = getPayPalOrderIdFromResource(resource);
  if (!orderId) return;

  const pi = await prisma.paymentIntent.findFirst({
    where: { gateway: 'paypal', externalId: orderId },
  });
  if (!pi) return;

  const reason = (resource?.status_details as { reason?: string } | undefined)?.reason ?? null;
  await prisma.paymentIntent.update({
    where: { id: pi.id },
    data: {
      status: PaymentStatus.FAILED,
      failedAt: new Date(),
      errorMessage: reason,
    },
  });
}
