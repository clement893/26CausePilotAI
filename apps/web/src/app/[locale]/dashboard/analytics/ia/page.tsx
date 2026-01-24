'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function IAPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">IA Analytics</h1>
        <p className="text-muted-foreground">Analytics assistés par intelligence artificielle</p>
      </div>

      <Card title="IA Analytics">
        <div className="space-y-4">
          <p className="text-muted-foreground">Contenu de la page IA Analytics à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
