'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function DonateursPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Donateurs</h1>
        <p className="text-gray-400">Gérez votre base de données de donateurs</p>
      </div>

      <Card title="Liste des donateurs">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Donateurs à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
