'use server';

/**
 * Server Action: Get Organizations List
 * Étape 7.1.2 - Gestion des organisations (Super Admin)
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export interface GetOrganizationsParams {
  search?: string;
  plan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status?: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
  page?: number;
  limit?: number;
}

export interface OrganizationWithSubscription {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: Date;
  subscription: {
    plan: string;
    status: string;
    maxUsers: number;
    maxDonors: number;
    maxForms: number;
    maxCampaigns: number;
    startDate: Date;
    endDate: Date | null;
    trialEndDate: Date | null;
  } | null;
  _count: {
    users: number;
    donators: number;
    donationForms: number;
    p2pCampaigns: number;
  };
}

export interface GetOrganizationsResult {
  organizations: OrganizationWithSubscription[];
  total: number;
  page: number;
  limit: number;
}

export async function getOrganizationsAction(
  params: GetOrganizationsParams = {}
): Promise<GetOrganizationsResult> {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const {
    search = '',
    plan,
    status,
    page = 1,
    limit = 25,
  } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Filter by subscription plan
  if (plan) {
    where.organizationSubscription = {
      plan,
    };
  }

  // Filter by subscription status
  if (status) {
    if (!where.organizationSubscription) {
      where.organizationSubscription = {};
    }
    where.organizationSubscription.status = status;
  }

  // Get total count
  const total = await prisma.organization.count({ where });

  // Get organizations with subscription and counts
  const organizations = await prisma.organization.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      organizationSubscription: true,
      _count: {
        select: {
          users: true,
          donators: true,
          donationForms: true,
          p2pCampaigns: true,
        },
      },
    },
  });

  return {
    organizations: organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      email: org.email,
      logo: org.logo,
      isActive: org.isActive,
      createdAt: org.createdAt,
      subscription: org.organizationSubscription
        ? {
            plan: org.organizationSubscription.plan,
            status: org.organizationSubscription.status,
            maxUsers: org.organizationSubscription.maxUsers,
            maxDonors: org.organizationSubscription.maxDonors,
            maxForms: org.organizationSubscription.maxForms,
            maxCampaigns: org.organizationSubscription.maxCampaigns,
            startDate: org.organizationSubscription.startDate,
            endDate: org.organizationSubscription.endDate,
            trialEndDate: org.organizationSubscription.trialEndDate,
          }
        : null,
      _count: org._count,
    })),
    total,
    page,
    limit,
  };
}
