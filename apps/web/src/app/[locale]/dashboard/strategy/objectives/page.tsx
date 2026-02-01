'use client';

/**
 * Objectives List Page
 * Étape 7.2.1 - Planification stratégique
 */

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Container, Card, Button, Badge, LoadingSkeleton, useToast } from '@/components/ui';
import { getObjectivesAction } from '@/app/actions/strategy';
import type { ObjectiveWithKeyResults } from '@/app/actions/strategy';
import { Plus, Target, Calendar, User } from 'lucide-react';

export default function ObjectivesPage() {
  const { error: showErrorToast } = useToast();
  const [objectives, setObjectives] = useState<ObjectiveWithKeyResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('ALL');

  useEffect(() => {
    loadObjectives();
  }, [statusFilter]);

  const loadObjectives = async () => {
    try {
      setIsLoading(true);
      const result = await getObjectivesAction({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setObjectives(result.objectives);
    } catch (error) {
      showErrorToast('Erreur lors du chargement des objectifs');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
      DRAFT: 'default',
      ACTIVE: 'warning',
      COMPLETED: 'success',
      ARCHIVED: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const groupedObjectives = {
    ACTIVE: objectives.filter((o) => o.status === 'ACTIVE'),
    COMPLETED: objectives.filter((o) => o.status === 'COMPLETED'),
    DRAFT: objectives.filter((o) => o.status === 'DRAFT'),
  };

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planification stratégique</h1>
          <p className="text-gray-400">Gérez vos objectifs et résultats clés (OKR)</p>
        </div>
        <Link href="/dashboard/strategy/objectives/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Créer un objectif
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(['ALL', 'DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'ALL' ? 'Tous' : status}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card" count={3} />
      ) : objectives.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucun objectif</h3>
            <p className="text-gray-400 mb-6">Créez votre premier objectif pour commencer</p>
            <Link href="/dashboard/strategy/objectives/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un objectif
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kanban columns */}
          {(['ACTIVE', 'COMPLETED', 'DRAFT'] as const).map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{status}</h2>
                <Badge>{groupedObjectives[status].length}</Badge>
              </div>
              {groupedObjectives[status].map((objective) => (
                <Card key={objective.id} className="hover:shadow-lg transition-shadow">
                  <Link href={`/dashboard/strategy/objectives/${objective.id}`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{objective.title}</h3>
                        {getStatusBadge(objective.status)}
                      </div>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {objective.description || 'Aucune description'}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <User className="w-4 h-4" />
                          <span>
                            {objective.owner.firstName} {objective.owner.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(objective.startDate).toLocaleDateString()} -{' '}
                            {new Date(objective.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progression</span>
                          <span className="text-white font-semibold">{objective.progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                            style={{ width: `${objective.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          {objective.keyResults.length} Key Results
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
