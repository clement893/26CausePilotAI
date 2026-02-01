'use server';

/**
 * Server Action: Create Budget
 * Étape 7.2.2 - Gestion des budgets
 */

import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface BudgetItemInput {
  name: string;
  description?: string;
  category: string;
  type: 'REVENUE' | 'EXPENSE';
  plannedAmount: number;
  ownerId?: string;
}

export interface CreateBudgetParams {
  name: string;
  description?: string;
  fiscalYear: number;
  startDate: Date;
  endDate: Date;
  status?: 'DRAFT' | 'ACTIVE';
  revenueItems: BudgetItemInput[];
  expenseItems: BudgetItemInput[];
}

export interface CreateBudgetResult {
  success: boolean;
  budget: {
    id: string;
    name: string;
  };
}

export async function createBudgetAction(
  params: CreateBudgetParams
): Promise<CreateBudgetResult> {
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
    fiscalYear,
    startDate,
    endDate,
    status = 'DRAFT',
    revenueItems,
    expenseItems,
  } = params;

  // Calculate totals
  const totalRevenuePlanned = revenueItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const totalExpensePlanned = expenseItems.reduce((sum, item) => sum + item.plannedAmount, 0);

  // Create budget with items in a transaction
  const budget = await prisma.$transaction(async (tx) => {
    // Create budget
    const newBudget = await tx.budget.create({
      data: {
        organizationId: user.organizationId,
        name,
        description,
        fiscalYear,
        startDate,
        endDate,
        status,
        totalRevenuePlanned,
        totalRevenueActual: 0,
        totalExpensePlanned,
        totalExpenseActual: 0,
      },
    });

    // Create revenue items
    await Promise.all(
      revenueItems.map((item) =>
        tx.budgetItem.create({
          data: {
            budgetId: newBudget.id,
            name: item.name,
            description: item.description,
            category: item.category,
            type: 'REVENUE',
            plannedAmount: item.plannedAmount,
            actualAmount: 0,
            variance: -item.plannedAmount,
            variancePercent: 0,
            ownerId: item.ownerId,
          },
        })
      )
    );

    // Create expense items
    await Promise.all(
      expenseItems.map((item) =>
        tx.budgetItem.create({
          data: {
            budgetId: newBudget.id,
            name: item.name,
            description: item.description,
            category: item.category,
            type: 'EXPENSE',
            plannedAmount: item.plannedAmount,
            actualAmount: 0,
            variance: -item.plannedAmount,
            variancePercent: 0,
            ownerId: item.ownerId,
          },
        })
      )
    );

    return newBudget;
  });

  return {
    success: true,
    budget: {
      id: budget.id,
      name: budget.name,
    },
  };
}
