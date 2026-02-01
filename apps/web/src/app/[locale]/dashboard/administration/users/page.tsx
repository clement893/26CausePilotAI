'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card } from '@/components/ui';

export default function AdministrationUsersPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
        <p className="text-gray-400">Gérez les utilisateurs de l'administration</p>
      </div>

      <Card title="Gestion des utilisateurs">
        <div className="space-y-4">
          <p className="text-gray-400">Contenu de la page Users à venir...</p>
        </div>
      </Card>
    </Container>
  );
}
