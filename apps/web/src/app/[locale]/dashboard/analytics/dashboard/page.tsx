'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function AnalyticsDashboardPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Analytics</h1>
        <p className="text-muted-foreground">Vue d'ensemble de vos analytics</p>
      </div>

      <Card title="Dashboard Analytics">
        <div className="space-y-4">
          <p className="text-muted-foreground">Contenu de la page Dashboard Analytics à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
