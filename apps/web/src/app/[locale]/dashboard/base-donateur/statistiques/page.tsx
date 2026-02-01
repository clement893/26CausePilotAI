'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function StatistiquesPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Statistiques</h1>
        <p className="text-gray-400">Visualisez les statistiques de votre base de donateurs</p>
      </div>

      <Card title="Statistiques des donateurs">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Statistiques à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
