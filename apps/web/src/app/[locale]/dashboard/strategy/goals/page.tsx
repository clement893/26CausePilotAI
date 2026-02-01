'use client';

/**
 * Goals List Page
 * Étape 7.2.3 - Gestion des objectifs (Goals)
 */

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Container, Card, Button, Badge, LoadingSkeleton, useToast } from '@/components/ui';
import { getGoalsAction } from '@/app/actions/strategy';
import type { GoalWithDetails } from '@/app/actions/strategy';
import { Plus, Target, Calendar, User, AlertTriangle } from 'lucide-react';

export default function GoalsPage() {
  const { error: showErrorToast } = useToast();
  const [goals, setGoals] = useState<GoalWithDetails[]>([]);
  const [summary, setSummary] = useState({
    active: 0,
    completed: 0,
    averageProgress: 0,
    atRisk: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CAMPAIGN' | 'FORM' | 'ORGANIZATION' | 'CUSTOM'>('ALL');

  useEffect(() => {
    loadGoals();
  }, [typeFilter]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const result = await getGoalsAction({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
      setGoals(result.goals);
      setSummary(result.summary);
    } catch (error) {
      showErrorToast('Erreur lors du chargement des objectifs');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      CAMPAIGN: 'bg-blue-500/20 text-blue-400',
      FORM: 'bg-purple-500/20 text-purple-400',
      ORGANIZATION: 'bg-green-500/20 text-green-400',
      CUSTOM: 'bg-gray-500/20 text-gray-400',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type] || colors.CUSTOM}`}>
        {type}
      </span>
    );
  };

  const getStatusBadge = (goal: GoalWithDetails) => {
    if (goal.isCompleted) {
      return <Badge variant="success">Complété</Badge>;
    }
    const now = new Date();
    const totalDays = (goal.endDate.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysElapsed = (now.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const timeRemaining = (goal.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const timeRemainingPercent = totalDays > 0 ? (timeRemaining / totalDays) * 100 : 0;

    if (goal.progress < 50 && timeRemainingPercent < 25) {
      return (
        <Badge variant="error" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          À risque
        </Badge>
      );
    }
    return <Badge variant="warning">En cours</Badge>;
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$' || unit === 'CAD' || unit === 'USD') {
      return new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency: 'CAD',
      }).format(value);
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Objectifs opérationnels</h1>
          <p className="text-gray-400">Définissez et suivez vos objectifs mesurables</p>
        </div>
        <Link href="/dashboard/strategy/goals/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Créer un objectif
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-500/20 border-blue-500/30">
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-1">Objectifs actifs</p>
              <p className="text-2xl font-bold text-white">{summary.active}</p>
            </div>
          </Card>
          <Card className="bg-green-500/20 border-green-500/30">
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-1">Complétés</p>
              <p className="text-2xl font-bold text-white">{summary.completed}</p>
            </div>
          </Card>
          <Card className="bg-purple-500/20 border-purple-500/30">
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-1">Progression moyenne</p>
              <p className="text-2xl font-bold text-white">{summary.averageProgress.toFixed(0)}%</p>
            </div>
          </Card>
          <Card className="bg-red-500/20 border-red-500/30">
            <div className="p-4">
              <p className="text-sm text-gray-400 mb-1">À risque</p>
              <p className="text-2xl font-bold text-white">{summary.atRisk}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['ALL', 'CAMPAIGN', 'FORM', 'ORGANIZATION', 'CUSTOM'] as const).map((type) => (
          <Button
            key={type}
            variant={typeFilter === type ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter(type)}
          >
            {type === 'ALL' ? 'Tous' : type}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : goals.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun objectif</h3>
            <p className="text-gray-400 mb-6">Créez votre premier objectif pour commencer</p>
            <Link href="/dashboard/strategy/goals/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un objectif
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <Link href={`/dashboard/strategy/goals/${goal.id}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{goal.name}</h3>
                      {getTypeBadge(goal.type)}
                    </div>
                    {getStatusBadge(goal)}
                  </div>

                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {goal.description || 'Aucune description'}
                  </p>

                  <div className="space-y-3">
                    {/* Metric */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{goal.metric}</span>
                        <span className="text-white font-semibold">
                          {formatValue(goal.currentValue, goal.unit)} /{' '}
                          {formatValue(goal.targetValue, goal.unit)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            goal.progress >= 100
                              ? 'bg-green-500'
                              : goal.progress >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Owner and Dates */}
                    <div className="space-y-2 pt-3 border-t border-white/10">
                      {goal.owner && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <User className="w-4 h-4" />
                          <span>
                            {goal.owner.firstName} {goal.owner.lastName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(goal.startDate).toLocaleDateString()} -{' '}
                          {new Date(goal.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
