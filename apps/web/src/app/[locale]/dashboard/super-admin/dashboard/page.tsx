'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';

function SuperAdminDashboardContent() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Super Admin</h1>
        <p className="text-gray-400">Vue d'ensemble du système</p>
      </div>

      <Card title="Dashboard Super Admin">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Dashboard Super Admin à venir...</p>
        </div>
      </Card>
    </Container>
  );
}

export default function SuperAdminDashboardPage() {
  return (
    <ProtectedSuperAdminRoute>
      <SuperAdminDashboardContent />
    </ProtectedSuperAdminRoute>
  );
}
