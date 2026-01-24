'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function SegmentsPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Segments</h1>
        <p className="text-muted-foreground">Créez et gérez des segments de donateurs</p>
      </div>

      <Card title="Segments de donateurs">
        <div className="space-y-4">
          <p className="text-muted-foreground">Contenu de la page Segments à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
