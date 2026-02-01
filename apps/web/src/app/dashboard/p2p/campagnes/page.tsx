'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function P2PCampagnesPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Campagnes P2P</h1>
        <p className="text-gray-400">Gérez vos campagnes peer-to-peer</p>
      </div>

      <Card title="Liste des campagnes P2P">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Campagnes P2P à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
