'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Link } from '@/i18n/routing';
import { Container, Card, Button } from '@/components/ui';
import { Plus } from 'lucide-react';

export default function FormulairesPage() {
  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Formulaires de don</h1>
          <p className="text-gray-400">Créez et gérez vos formulaires de collecte</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/formulaires/new">
            <Plus className="h-4 w-4" />
            Nouveau formulaire
          </Link>
        </Button>
      </div>

      <Card title="Liste des formulaires">
        <div className="space-y-4">
          <p className="text-gray-400">
            Vos formulaires apparaîtront ici. Créez-en un avec le bouton « Nouveau formulaire ».
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/formulaires/new">Créer un formulaire</Link>
          </Button>
        </div>
      </Card>
    </Container>
  );
}
