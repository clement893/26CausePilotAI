'use client';

/**
 * Budgets List Page
 * Étape 7.2.2 - Gestion des budgets
 */

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Container, Card, Button, Badge, LoadingSkeleton, useToast } from '@/components/ui';
import { getBudgetsAction } from '@/app/actions/strategy';
import type { BudgetWithItems } from '@/app/actions/strategy';
import { Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function BudgetsPage() {
  const { error: showErrorToast } = useToast();
  const [budgets, setBudgets] = useState<BudgetWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setIsLoading(true);
      const result = await getBudgetsAction();
      setBudgets(result.budgets);
    } catch (error) {
      showErrorToast('Erreur lors du chargement des budgets');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning'> = {
      DRAFT: 'default',
      ACTIVE: 'warning',
      CLOSED: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des budgets</h1>
          <p className="text-gray-400">Planifiez et suivez vos budgets annuels</p>
        </div>
        <Link href="/dashboard/strategy/budgets/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Créer un budget
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : budgets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun budget</h3>
            <p className="text-gray-400 mb-6">Créez votre premier budget pour commencer</p>
            <Link href="/dashboard/strategy/budgets/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un budget
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const surplus = budget.totalRevenueActual - budget.totalExpenseActual;
            const plannedSurplus = budget.totalRevenuePlanned - budget.totalExpensePlanned;

            return (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                <Link href={`/dashboard/strategy/budgets/${budget.id}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{budget.name}</h3>
                        <p className="text-sm text-gray-400">Année fiscale {budget.fiscalYear}</p>
                      </div>
                      {getStatusBadge(budget.status)}
                    </div>

                    <div className="space-y-4">
                      {/* Revenue */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            Revenus
                          </span>
                          <span className="text-white font-semibold">
                            {formatCurrency(budget.totalRevenueActual)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Prévu: {formatCurrency(budget.totalRevenuePlanned)}
                        </div>
                      </div>

                      {/* Expenses */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            Dépenses
                          </span>
                          <span className="text-white font-semibold">
                            {formatCurrency(budget.totalExpenseActual)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Prévu: {formatCurrency(budget.totalExpensePlanned)}
                        </div>
                      </div>

                      {/* Surplus/Deficit */}
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-400">Surplus / Déficit</span>
                          <span
                            className={`font-semibold ${
                              surplus >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {formatCurrency(surplus)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Prévu: {formatCurrency(plannedSurplus)}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
                        {new Date(budget.startDate).toLocaleDateString()} -{' '}
                        {new Date(budget.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
