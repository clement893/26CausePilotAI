'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function CampagnesPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Campagnes</h1>
        <p className="text-gray-400">Gérez vos campagnes de collecte</p>
      </div>

      <Card title="Liste des campagnes">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Campagnes à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
