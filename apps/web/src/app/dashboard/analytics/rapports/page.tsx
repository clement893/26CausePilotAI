'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function RapportsPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Rapports</h1>
        <p className="text-gray-400">Générez et consultez vos rapports d'analytics</p>
      </div>

      <Card title="Rapports Analytics">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Rapports à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
