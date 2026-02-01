'use server';

/**
 * Server Action: Create Goal
 * Étape 7.2.3 - Gestion des objectifs (Goals)
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface CreateGoalParams {
  name: string;
  description?: string;
  type: 'CAMPAIGN' | 'FORM' | 'ORGANIZATION' | 'CUSTOM';
  campaignId?: string;
  formId?: string;
  metric: string;
  unit: string;
  targetValue: number;
  startValue?: number;
  startDate: Date;
  endDate: Date;
  ownerId?: string;
}

export interface CreateGoalResult {
  success: boolean;
  goal: {
    id: string;
    name: string;
  };
}

export async function createGoalAction(params: CreateGoalParams): Promise<CreateGoalResult> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    throw new Error('Organization not found');
  }

  const {
    name,
    description,
    type,
    campaignId,
    formId,
    metric,
    unit,
    targetValue,
    startValue = 0,
    startDate,
    endDate,
    ownerId,
  } = params;

  // Validate type-specific requirements
  if (type === 'CAMPAIGN' && !campaignId) {
    throw new Error('Campaign ID is required for CAMPAIGN type goals');
  }

  if (type === 'FORM' && !formId) {
    throw new Error('Form ID is required for FORM type goals');
  }

  // If type is CAMPAIGN or FORM, try to get current value automatically
  let currentValue = startValue;

  if (type === 'CAMPAIGN' && campaignId) {
    // Get total donations for campaign
    // Note: campaignId might be in a different table structure
    // This is a placeholder - adjust based on your schema
    // const donations = await prisma.donation.aggregate({
    //   where: {
    //     organizationId: user.organizationId,
    //   },
    //   _sum: {
    //     amount: true,
    //   },
    // });
    // currentValue = donations._sum.amount || 0; // Uncomment when campaign relation is available
  }

  if (type === 'FORM' && formId) {
    // Get total submissions for form
    const submissions = await prisma.donationFormSubmission.aggregate({
      where: {
        formId,
        organizationId: user.organizationId,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });
    currentValue = submissions._sum.amount ? Number(submissions._sum.amount) : startValue;
  }

  // Calculate initial progress
  const progress = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  // Create goal
  const goal = await prisma.goal.create({
    data: {
      organizationId: user.organizationId,
      name,
      description,
      type,
      campaignId: campaignId || null,
      formId: formId || null,
      metric,
      unit,
      targetValue,
      currentValue,
      startDate,
      endDate,
      progress,
      isCompleted: progress >= 100,
      completedAt: progress >= 100 ? new Date() : null,
      ownerId: ownerId || null,
    },
  });

  return {
    success: true,
    goal: {
      id: goal.id,
      name: goal.name,
    },
  };
}
