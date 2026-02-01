'use server';

/**
 * Server Action: Get Goals
 * Étape 7.2.3 - Gestion des objectifs (Goals)
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface GetGoalsParams {
  type?: 'CAMPAIGN' | 'FORM' | 'ORGANIZATION' | 'CUSTOM';
  ownerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface GoalWithDetails {
  id: string;
  name: string;
  description: string | null;
  type: string;
  campaignId: string | null;
  formId: string | null;
  metric: string;
  unit: string;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  progress: number;
  isCompleted: boolean;
  completedAt: Date | null;
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetGoalsResult {
  goals: GoalWithDetails[];
  summary: {
    active: number;
    completed: number;
    averageProgress: number;
    atRisk: number;
  };
}

export async function getGoalsAction(params: GetGoalsParams = {}): Promise<GetGoalsResult> {
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

  const { type, ownerId, startDate, endDate } = params;

  const where: any = {
    organizationId: user.organizationId,
  };

  if (type) {
    where.type = type;
  }

  if (ownerId) {
    where.ownerId = ownerId;
  }

  if (startDate || endDate) {
    where.OR = [];
    if (startDate) {
      where.OR.push({ startDate: { gte: startDate } });
    }
    if (endDate) {
      where.OR.push({ endDate: { lte: endDate } });
    }
  }

  const goals = await prisma.goal.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate summary
  const active = goals.filter((g) => !g.isCompleted).length;
  const completed = goals.filter((g) => g.isCompleted).length;
  const averageProgress =
    goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0;

  // At risk: goals < 50% progress with < 25% time remaining
  const now = new Date();
  const atRisk = goals.filter((g) => {
    if (g.isCompleted) return false;
    const totalDays = (g.endDate.getTime() - g.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const timeRemaining = (g.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const timeRemainingPercent = totalDays > 0 ? (timeRemaining / totalDays) * 100 : 0;
    return g.progress < 50 && timeRemainingPercent < 25;
  }).length;

  return {
    goals,
    summary: {
      active,
      completed,
      averageProgress,
      atRisk,
    },
  };
}
