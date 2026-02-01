'use server';

/**
 * Server Action: Update Organization Subscription
 * Étape 7.1.2 - Gestion des organisations (Super Admin)
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { logSystemEvent } from '@/lib/logging/systemLogger';

export interface UpdateSubscriptionParams {
  organizationId: string;
  plan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
  startDate?: Date;
  endDate?: Date | null;
  trialEndDate?: Date | null;
  maxUsers?: number;
  maxDonors?: number;
  maxForms?: number;
  maxCampaigns?: number;
}

export interface UpdateSubscriptionResult {
  success: boolean;
  subscription: {
    id: string;
    plan: string;
    status: string;
    maxUsers: number;
    maxDonors: number;
    maxForms: number;
    maxCampaigns: number;
    startDate: Date;
    endDate: Date | null;
    trialEndDate: Date | null;
  };
}

export async function updateSubscriptionAction(
  params: UpdateSubscriptionParams
): Promise<UpdateSubscriptionResult> {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const {
    organizationId,
    plan,
    status,
    startDate,
    endDate,
    trialEndDate,
    maxUsers,
    maxDonors,
    maxForms,
    maxCampaigns,
  } = params;

  // Check if organization exists
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Get or create subscription
  let subscription = await prisma.organizationSubscription.findUnique({
    where: { organizationId },
  });

  const updateData: any = {};

  if (plan !== undefined) updateData.plan = plan;
  if (status !== undefined) updateData.status = status;
  if (startDate !== undefined) updateData.startDate = startDate;
  if (endDate !== undefined) updateData.endDate = endDate;
  if (trialEndDate !== undefined) updateData.trialEndDate = trialEndDate;
  if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
  if (maxDonors !== undefined) updateData.maxDonors = maxDonors;
  if (maxForms !== undefined) updateData.maxForms = maxForms;
  if (maxCampaigns !== undefined) updateData.maxCampaigns = maxCampaigns;

  if (subscription) {
    // Update existing subscription
    subscription = await prisma.organizationSubscription.update({
      where: { id: subscription.id },
      data: updateData,
    });
  } else {
    // Create new subscription
    subscription = await prisma.organizationSubscription.create({
      data: {
        organizationId,
        plan: plan || 'FREE',
        status: status || 'TRIAL',
        startDate: startDate || new Date(),
        endDate: endDate || null,
        trialEndDate: trialEndDate || null,
        maxUsers: maxUsers || 5,
        maxDonors: maxDonors || 1000,
        maxForms: maxForms || 3,
        maxCampaigns: maxCampaigns || 5,
        ...updateData,
      },
    });
  }

  // Log the event
  await logSystemEvent({
    type: 'subscription',
    level: 'info',
    message: `Subscription updated for organization ${organization.name}`,
    organizationId,
    userId: session.user.id,
    details: {
      plan: subscription.plan,
      status: subscription.status,
      changes: updateData,
    },
  });

  return {
    success: true,
    subscription: {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      maxUsers: subscription.maxUsers,
      maxDonors: subscription.maxDonors,
      maxForms: subscription.maxForms,
      maxCampaigns: subscription.maxCampaigns,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialEndDate: subscription.trialEndDate,
    },
  };
}
