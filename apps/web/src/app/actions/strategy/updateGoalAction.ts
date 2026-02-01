'use server';

/**
 * Server Action: Update Goal
 * Étape 7.2.3 - Gestion des objectifs (Goals)
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface UpdateGoalParams {
  id: string;
  currentValue: number;
  comment?: string;
}

export interface UpdateGoalResult {
  success: boolean;
  goal: {
    id: string;
    currentValue: number;
    progress: number;
    isCompleted: boolean;
    completedAt: Date | null;
  };
}

export async function updateGoalAction(params: UpdateGoalParams): Promise<UpdateGoalResult> {
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

  const { id, currentValue } = params;

  // Get goal
  const goal = await prisma.goal.findUnique({
    where: { id },
  });

  if (!goal || goal.organizationId !== user.organizationId) {
    throw new Error('Goal not found');
  }

  // Calculate progress
  const progress = goal.targetValue > 0 ? Math.min((currentValue / goal.targetValue) * 100, 100) : 0;
  const isCompleted = progress >= 100;
  const completedAt = isCompleted && !goal.completedAt ? new Date() : goal.completedAt;

  // Update goal
  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: {
      currentValue,
      progress,
      isCompleted,
      completedAt,
    },
  });

  return {
    success: true,
    goal: {
      id: updatedGoal.id,
      currentValue: updatedGoal.currentValue,
      progress: updatedGoal.progress,
      isCompleted: updatedGoal.isCompleted,
      completedAt: updatedGoal.completedAt,
    },
  };
}
