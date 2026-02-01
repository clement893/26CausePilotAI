'use server';

/**
 * Server Action: Get Objectives
 * Étape 7.2.1 - Planification stratégique
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface GetObjectivesParams {
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  ownerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ObjectiveWithKeyResults {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  status: string;
  progress: number;
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  keyResults: Array<{
    id: string;
    title: string;
    metric: string;
    unit: string;
    startValue: number;
    targetValue: number;
    currentValue: number;
    progress: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetObjectivesResult {
  objectives: ObjectiveWithKeyResults[];
}

export async function getObjectivesAction(
  params: GetObjectivesParams = {}
): Promise<GetObjectivesResult> {
  const session = await getServerSession(authOptions);
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

  const { status, ownerId, startDate, endDate } = params;

  const where: any = {
    organizationId,
  };

  if (status) {
    where.status = status;
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

  const objectives = await prisma.objective.findMany({
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
      keyResults: {
        select: {
          id: true,
          title: true,
          metric: true,
          unit: true,
          startValue: true,
          targetValue: true,
          currentValue: true,
          progress: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { objectives };
}
