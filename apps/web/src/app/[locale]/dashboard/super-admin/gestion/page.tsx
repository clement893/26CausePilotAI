'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';

function GestionContent() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestion Super Admin</h1>
        <p className="text-gray-400">Gérez les utilisateurs et les permissions système</p>
      </div>

      <Card title="Gestion système">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Gestion à venir...</p>
        </div>
      </Card>
    </Container>
  );
}

export default function GestionPage() {
  return (
    <ProtectedSuperAdminRoute>
      <GestionContent />
    </ProtectedSuperAdminRoute>
  );
}
