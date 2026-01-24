'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container } from '@/components/ui';
import { TagManager } from '@/components/donors';
import { useOrganization } from '@/hooks/useOrganization';

export default function TagsPage() {
  const { activeOrganization, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </Container>
    );
  }

  if (!activeOrganization) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="text-center py-12">
          <p className="text-destructive">Veuillez sélectionner une organisation</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Tags</h1>
        <p className="text-muted-foreground">
          Créez et gérez les tags pour catégoriser vos donateurs
        </p>
      </div>
      <TagManager />
    </Container>
  );
}
