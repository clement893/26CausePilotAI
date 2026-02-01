'use server';

/**
 * Server Action: Update Key Result
 * Étape 7.2.1 - Planification stratégique
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface UpdateKeyResultParams {
  id: string;
  currentValue: number;
  comment?: string;
}

export interface UpdateKeyResultResult {
  success: boolean;
  keyResult: {
    id: string;
    progress: number;
    currentValue: number;
  };
  objective: {
    id: string;
    progress: number;
  };
}

export async function updateKeyResultAction(
  params: UpdateKeyResultParams
): Promise<UpdateKeyResultResult> {
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

  const organizationId = user.organizationId;

  const { id, currentValue } = params;

  // Get key result with objective
  const keyResult = await prisma.keyResult.findUnique({
    where: { id },
    include: {
      objective: true,
    },
  });

  if (!keyResult || keyResult.objective.organizationId !== organizationId) {
    throw new Error('Key result not found');
  }

  // Calculate progress
  const { startValue, targetValue } = keyResult;
  const progress =
    targetValue !== startValue
      ? Math.max(0, Math.min(100, ((currentValue - startValue) / (targetValue - startValue)) * 100))
      : currentValue >= targetValue
      ? 100
      : 0;

  // Update key result and recalculate objective progress in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update key result
    const updatedKeyResult = await tx.keyResult.update({
      where: { id },
      data: {
        currentValue,
        progress,
      },
    });

    // Get all key results for the objective
    const allKeyResults = await tx.keyResult.findMany({
      where: { objectiveId: keyResult.objectiveId },
    });

    // Calculate average progress for objective
    const avgProgress =
      allKeyResults.length > 0
        ? allKeyResults.reduce((sum, kr) => sum + kr.progress, 0) / allKeyResults.length
        : 0;

    // Update objective progress
    const updatedObjective = await tx.objective.update({
      where: { id: keyResult.objectiveId },
      data: {
        progress: avgProgress,
        status: avgProgress >= 100 ? 'COMPLETED' : keyResult.objective.status,
      },
    });

    return { updatedKeyResult, updatedObjective };
  });

  return {
    success: true,
    keyResult: {
      id: result.updatedKeyResult.id,
      progress: result.updatedKeyResult.progress,
      currentValue: result.updatedKeyResult.currentValue,
    },
    objective: {
      id: result.updatedObjective.id,
      progress: result.updatedObjective.progress,
    },
  };
}
