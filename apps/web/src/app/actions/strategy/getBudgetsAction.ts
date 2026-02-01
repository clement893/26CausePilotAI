'use server';

/**
 * Server Action: Get Budgets
 * Étape 7.2.2 - Gestion des budgets
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface GetBudgetsParams {
  fiscalYear?: number;
  status?: 'DRAFT' | 'ACTIVE' | 'CLOSED';
}

export interface BudgetWithItems {
  id: string;
  name: string;
  description: string | null;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  status: string;
  totalRevenuePlanned: number;
  totalRevenueActual: number;
  totalExpensePlanned: number;
  totalExpenseActual: number;
  items: Array<{
    id: string;
    name: string;
    category: string;
    type: string;
    plannedAmount: number;
    actualAmount: number;
    variance: number;
    variancePercent: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetBudgetsResult {
  budgets: BudgetWithItems[];
}

export async function getBudgetsAction(
  params: GetBudgetsParams = {}
): Promise<GetBudgetsResult> {
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

  const { fiscalYear, status } = params;

  const where: any = {
    organizationId: user.organizationId,
  };

  if (fiscalYear) {
    where.fiscalYear = fiscalYear;
  }

  if (status) {
    where.status = status;
  }

  const budgets = await prisma.budget.findMany({
    where,
    include: {
      items: {
        select: {
          id: true,
          name: true,
          category: true,
          type: true,
          plannedAmount: true,
          actualAmount: true,
          variance: true,
          variancePercent: true,
        },
      },
    },
    orderBy: { fiscalYear: 'desc' },
  });

  return { budgets };
}
