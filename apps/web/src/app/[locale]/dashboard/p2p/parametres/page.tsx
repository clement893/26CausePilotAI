'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function P2PParametresPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres P2P</h1>
        <p className="text-muted-foreground">Configurez les paramètres des campagnes P2P</p>
      </div>

      <Card title="Paramètres P2P">
        <div className="space-y-4">
          <p className="text-muted-foreground">Contenu de la page Paramètres P2P à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
