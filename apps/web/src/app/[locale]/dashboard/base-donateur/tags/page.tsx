'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { Container, Card, LoadingSkeleton } from '@/components/ui';
import { TagManager } from '@/components/donors';
import { useOrganization } from '@/hooks/useOrganization';
import { Tag } from 'lucide-react';

export default function TagsPage() {
  const { activeOrganization, isLoading } = useOrganization();

  if (isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="mb-8 h-16 animate-pulse rounded-lg bg-muted/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </Container>
    );
  }

  if (!activeOrganization) {
    return (
      <Container className="py-8 lg:py-12">
        <Card className="p-12 text-center" elevated>
          <p className="text-destructive">Veuillez sélectionner une organisation</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Tags
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Créez et gérez les tags pour catégoriser vos donateurs
          </p>
        </div>
      </div>
      <TagManager />
    </Container>
  );
}
