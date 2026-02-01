'use server';

/**
 * Server Action: Create Organization with Subscription
 * Étape 7.1.2 - Gestion des organisations (Super Admin)
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { logSystemEvent } from '@/lib/logging/systemLogger';

export interface CreateOrganizationParams {
  name: string;
  slug: string;
  email: string;
  logo?: string;
  website?: string;
  description?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  // Subscription data
  plan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscriptionStatus?: 'ACTIVE' | 'TRIAL';
  trialEndDate?: Date;
  maxUsers?: number;
  maxDonors?: number;
  maxForms?: number;
  maxCampaigns?: number;
}

export interface CreateOrganizationResult {
  success: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function createOrganizationAction(
  params: CreateOrganizationParams
): Promise<CreateOrganizationResult> {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const {
    name,
    slug,
    email,
    logo,
    website,
    description,
    phone,
    address,
    city,
    province,
    postalCode,
    country = 'CA',
    plan = 'FREE',
    subscriptionStatus = 'TRIAL',
    trialEndDate,
    maxUsers = 5,
    maxDonors = 1000,
    maxForms = 3,
    maxCampaigns = 5,
  } = params;

  // Check if slug already exists
  const existing = await prisma.organization.findUnique({
    where: { slug },
  });

  if (existing) {
    throw new Error('Organization with this slug already exists');
  }

  // Create organization with subscription in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create organization
    const organization = await tx.organization.create({
      data: {
        name,
        slug,
        email,
        logo,
        website,
        description,
        phone,
        address,
        city,
        province,
        postalCode,
        country,
        isActive: true,
      },
    });

    // Create subscription
    await tx.organizationSubscription.create({
      data: {
        organizationId: organization.id,
        plan,
        status: subscriptionStatus,
        startDate: new Date(),
        endDate: null,
        trialEndDate: trialEndDate || null,
        maxUsers,
        maxDonors,
        maxForms,
        maxCampaigns,
      },
    });

    return organization;
  });

  // Log the event
  await logSystemEvent({
    type: 'organization',
    level: 'info',
    message: `Organization created: ${name}`,
    organizationId: result.id,
    userId: session.user.id,
    details: {
      slug,
      plan,
      status: subscriptionStatus,
    },
  });

  return {
    success: true,
    organization: {
      id: result.id,
      name: result.name,
      slug: result.slug,
    },
  };
}
