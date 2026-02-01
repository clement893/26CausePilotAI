'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function IntegrationsPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Intégrations</h1>
        <p className="text-gray-400">Gérez les intégrations de vos formulaires</p>
      </div>

      <Card title="Intégrations de formulaires">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Intégrations à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
