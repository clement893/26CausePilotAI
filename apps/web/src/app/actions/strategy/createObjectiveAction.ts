'use server';

/**
 * Server Action: Create Objective
 * Étape 7.2.1 - Planification stratégique
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface KeyResultInput {
  title: string;
  description?: string;
  metric: string;
  unit: string;
  startValue: number;
  targetValue: number;
  ownerId?: string;
}

export interface CreateObjectiveParams {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  ownerId: string;
  status?: 'DRAFT' | 'ACTIVE';
  keyResults: KeyResultInput[];
}

export interface CreateObjectiveResult {
  success: boolean;
  objective: {
    id: string;
    title: string;
  };
}

export async function createObjectiveAction(
  params: CreateObjectiveParams
): Promise<CreateObjectiveResult> {
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

  const { title, description, startDate, endDate, ownerId, status = 'DRAFT', keyResults } = params;

  // Validate key results count (3-5 recommended)
  if (keyResults.length < 1 || keyResults.length > 10) {
    throw new Error('An objective must have between 1 and 10 key results');
  }

  // Create objective with key results in a transaction
  const objective = await prisma.$transaction(async (tx) => {
    // Create objective
    const newObjective = await tx.objective.create({
      data: {
        organizationId,
        title,
        description,
        startDate,
        endDate,
        ownerId,
        status,
        progress: 0,
      },
    });

    // Create key results
    await Promise.all(
      keyResults.map((kr) =>
        tx.keyResult.create({
          data: {
            objectiveId: newObjective.id,
            title: kr.title,
            description: kr.description,
            metric: kr.metric,
            unit: kr.unit,
            startValue: kr.startValue,
            targetValue: kr.targetValue,
            currentValue: kr.startValue,
            progress: 0,
            ownerId: kr.ownerId,
          },
        })
      )
    );

    return newObjective;
  });

  return {
    success: true,
    objective: {
      id: objective.id,
      title: objective.title,
    },
  };
}
