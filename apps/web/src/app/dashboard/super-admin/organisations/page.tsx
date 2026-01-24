'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';

function OrganisationsContent() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Organisations</h1>
        <p className="text-muted-foreground">Gérez les organisations du système</p>
      </div>

      <Card title="Liste des organisations">
        <div className="space-y-4">
          <p className="text-muted-foreground">Contenu de la page Organisations à venir...</p>
        </div>
      </Card>
    </Container>
  );
}

export default function OrganisationsPage() {
  return (
    <ProtectedSuperAdminRoute>
      <OrganisationsContent />
    </ProtectedSuperAdminRoute>
  );
}
