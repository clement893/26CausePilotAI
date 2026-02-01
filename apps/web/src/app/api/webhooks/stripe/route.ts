/**
 * Stripe Webhook - Étape 2.2.2
 * Vérifie la signature, gère payment_intent.succeeded, payment_intent.payment_failed, charge.refunded.
 * Met à jour PaymentIntent et crée Donation si le paiement réussit.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { PrismaClient } from '@prisma/client';
import { getStripeClient } from '@/lib/payment/stripe';
import { prisma } from '@/lib/db';

/** Match Prisma enums (schema in packages/database/prisma) */
const PAYMENT_SUCCEEDED = 'SUCCEEDED' as const;
const PAYMENT_FAILED = 'FAILED' as const;
const SUBSCRIPTION_ACTIVE = 'ACTIVE' as const;
import { issueReceiptAction } from '@/app/actions/receipts/issue-receipt';

export const dynamic = 'force-dynamic';

function nextPaymentFromFrequency(now: Date, frequency: string | null): Date {
  const d = new Date(now);
  const f = (frequency ?? 'monthly').toLowerCase();
  if (f === 'quarterly') d.setMonth(d.getMonth() + 3);
  else if (f === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}
export const runtime = 'nodejs';

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.from([]);
  const chunks: Uint8Array[] = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET not configured' },
      { status: 500 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let rawBody: Buffer;
  try {
    rawBody = await getRawBody(request);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const eventType = event.type;
  const eventObject = event.data?.object as unknown as Record<string, unknown> | undefined;

  try {
    if (eventType === 'payment_intent.succeeded') {
      await handlePaymentIntentSucceeded(eventObject);
    } else if (eventType === 'payment_intent.payment_failed') {
      await handlePaymentIntentFailed(eventObject);
    } else if (eventType === 'charge.refunded') {
      await handleChargeRefunded(eventObject);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('[webhooks/stripe]', eventType, e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(obj: Record<string, unknown> | undefined) {
  if (!obj || typeof obj.id !== 'string') return;
  const paymentIntentId = obj.id as string;

  const pi = await prisma.paymentIntent.findFirst({
    where: { gateway: 'stripe', externalId: paymentIntentId },
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

  let createdDonationId: string | null = null;

  type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
  await prisma.$transaction(async (tx: Tx) => {
    await tx.paymentIntent.update({
      where: { id: pi.id },
      data: {
        status: PAYMENT_SUCCEEDED,
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

    let subscriptionIdForDonation: string | null = null;
    const isRecurring = Boolean((sub as { isRecurring?: boolean }).isRecurring);
    const frequency = ((sub as { frequency?: string }).frequency ?? 'monthly') as string;

    if (isRecurring) {
      let subscription = await tx.subscription.findUnique({
        where: { submissionId: sub.id },
      });
      if (!subscription) {
        const nextPayment = nextPaymentFromFrequency(new Date(), frequency);
        subscription = await tx.subscription.create({
          data: {
            donatorId,
            formId: sub.formId,
            submissionId: sub.id,
            amount: sub.amount,
            currency: sub.currency,
            frequency,
            gateway: 'stripe',
            subscriptionId: pi.externalId,
            status: SUBSCRIPTION_ACTIVE,
            nextPaymentDate: nextPayment,
            organizationId: sub.organizationId,
          },
        });
      }
      subscriptionIdForDonation = subscription.id;
    }

    const donation = await tx.donation.create({
      data: {
        donatorId,
        amount: sub.amount,
        currency: sub.currency,
        status: 'completed',
        formId: sub.formId,
        submissionId: sub.id,
        organizationId: sub.organizationId,
        subscriptionId: subscriptionIdForDonation ?? undefined,
      },
    });
    createdDonationId = donation.id;

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

  if (createdDonationId) {
    try {
      await issueReceiptAction(createdDonationId);
    } catch (receiptError) {
      console.error('[webhooks/stripe] issueReceiptAction failed:', receiptError);
    }
  }
}

async function handlePaymentIntentFailed(obj: Record<string, unknown> | undefined) {
  if (!obj || typeof obj.id !== 'string') return;
  const paymentIntentId = obj.id as string;

  const pi = await prisma.paymentIntent.findFirst({
    where: { gateway: 'stripe', externalId: paymentIntentId },
  });
  if (!pi) return;

  const lastError = (obj.last_payment_error as { message?: string } | undefined)?.message ?? null;
  await prisma.paymentIntent.update({
    where: { id: pi.id },
    data: {
      status: PAYMENT_FAILED,
      failedAt: new Date(),
      errorMessage: lastError,
    },
  });
}

async function handleChargeRefunded(obj: Record<string, unknown> | undefined) {
  if (!obj) return;
  const paymentIntentId = obj.payment_intent as string | undefined;
  if (!paymentIntentId) return;

  const pi = await prisma.paymentIntent.findFirst({
    where: { gateway: 'stripe', externalId: paymentIntentId },
    include: { submission: true },
  });
  if (!pi?.submission) return;

  const donation = await prisma.donation.findFirst({
    where: { submissionId: pi.submissionId },
  });
  if (donation) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: 'refunded' },
    });
  }
}
