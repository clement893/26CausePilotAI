'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';

function ParametresContent() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres Super Admin</h1>
        <p className="text-muted-foreground">Configurez les paramètres système</p>
      </div>

      <Card title="Paramètres système">
        <div className="space-y-4">
          <p className="text-muted-foreground">Contenu de la page Paramètres à venir...</p>
        </div>
      </Card>
    </Container>
  );
}

export default function ParametresPage() {
  return (
    <ProtectedSuperAdminRoute>
      <ParametresContent />
    </ProtectedSuperAdminRoute>
  );
}
