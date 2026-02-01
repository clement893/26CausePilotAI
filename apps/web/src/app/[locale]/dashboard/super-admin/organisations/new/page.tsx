'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Container, Card, Button, Input } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import { createOrganization } from '@/lib/api/organizations';
import { ArrowLeft, Building } from 'lucide-react';

function NewOrganizationContent() {
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await createOrganization({
        name: formData.name,
        slug: formData.slug,
        settings: {},
      });

      // Force a full page reload to ensure the list is updated with the new organization
      const targetPath = locale === 'fr' 
        ? '/fr/dashboard/super-admin/organisations'
        : `/${locale}/dashboard/super-admin/organisations`;
      window.location.href = targetPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug || value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <Link href="/dashboard/super-admin/organisations">
          <Button variant="ghost" className="mb-4 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Nouvelle organisation</h1>
        <p className="text-muted-foreground">Créez une nouvelle organisation avec sa base de données séparée</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-error-600 text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Nom de l'organisation *
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: Croix-Rouge Québec"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
              Slug (identifiant unique) *
            </label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Ex: croix-rouge-quebec"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Utilisé pour l'URL et l'identification. Lettres minuscules, chiffres et tirets uniquement.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              {isSubmitting ? 'Création...' : 'Créer l\'organisation'}
            </Button>
            <Link href="/dashboard/super-admin/organisations">
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </Container>
  );
}

export default function NewOrganizationPage() {
  return (
    <ProtectedSuperAdminRoute>
      <NewOrganizationContent />
    </ProtectedSuperAdminRoute>
  );
}
