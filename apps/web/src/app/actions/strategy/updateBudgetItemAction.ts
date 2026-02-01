'use server';

/**
 * Server Action: Update Budget Item
 * Étape 7.2.2 - Gestion des budgets
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface UpdateBudgetItemParams {
  id: string;
  actualAmount: number;
  comment?: string;
}

export interface UpdateBudgetItemResult {
  success: boolean;
  budgetItem: {
    id: string;
    actualAmount: number;
    variance: number;
    variancePercent: number;
  };
  budget: {
    id: string;
    totalRevenueActual: number;
    totalExpenseActual: number;
  };
}

export async function updateBudgetItemAction(
  params: UpdateBudgetItemParams
): Promise<UpdateBudgetItemResult> {
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

  const { id, actualAmount } = params;

  // Get budget item with budget
  const budgetItem = await prisma.budgetItem.findUnique({
    where: { id },
    include: {
      budget: true,
    },
  });

  if (!budgetItem || budgetItem.budget.organizationId !== user.organizationId) {
    throw new Error('Budget item not found');
  }

  // Calculate variance
  const variance = actualAmount - budgetItem.plannedAmount;
  const variancePercent =
    budgetItem.plannedAmount !== 0 ? (variance / budgetItem.plannedAmount) * 100 : 0;

  // Update budget item and recalculate budget totals in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update budget item
    const updatedItem = await tx.budgetItem.update({
      where: { id },
      data: {
        actualAmount,
        variance,
        variancePercent,
      },
    });

    // Get all items for the budget
    const allItems = await tx.budgetItem.findMany({
      where: { budgetId: budgetItem.budgetId },
    });

    // Calculate totals
    const totalRevenueActual = allItems
      .filter((item) => item.type === 'REVENUE')
      .reduce((sum, item) => sum + item.actualAmount, 0);

    const totalExpenseActual = allItems
      .filter((item) => item.type === 'EXPENSE')
      .reduce((sum, item) => sum + item.actualAmount, 0);

    // Update budget totals
    const updatedBudget = await tx.budget.update({
      where: { id: budgetItem.budgetId },
      data: {
        totalRevenueActual,
        totalExpenseActual,
      },
    });

    return { updatedItem, updatedBudget };
  });

  return {
    success: true,
    budgetItem: {
      id: result.updatedItem.id,
      actualAmount: result.updatedItem.actualAmount,
      variance: result.updatedItem.variance,
      variancePercent: result.updatedItem.variancePercent,
    },
    budget: {
      id: result.updatedBudget.id,
      totalRevenueActual: result.updatedBudget.totalRevenueActual,
      totalExpenseActual: result.updatedBudget.totalExpenseActual,
    },
  };
}
