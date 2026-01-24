'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function MediasSociauxPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Médias sociaux</h1>
        <p className="text-muted-foreground">Gérez vos campagnes sur les médias sociaux</p>
      </div>

      <Card title="Campagnes médias sociaux">
        <div className="space-y-4">
          <p className="text-muted-foreground">Contenu de la page Médias sociaux à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
