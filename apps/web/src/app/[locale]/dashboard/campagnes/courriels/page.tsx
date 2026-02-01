'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function CourrielsPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Courriels</h1>
        <p className="text-gray-400">Gérez vos campagnes par courriel</p>
      </div>

      <Card title="Campagnes courriel">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Courriels à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
