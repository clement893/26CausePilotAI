'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Input } from '@/components/ui';
import ProtectedSuperAdminRoute from '@/components/auth/ProtectedSuperAdminRoute';
import { createOrganization } from '@/lib/api/organizations';
import { ArrowLeft, Building } from 'lucide-react';

function NewOrganizationContent() {
  const router = useRouter();
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

      router.push('/dashboard/super-admin/organisations');
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
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Nouvelle organisation</h1>
        <p className="text-gray-400">Créez une nouvelle organisation avec sa base de données séparée</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
              <p className="text-error-600 text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
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
            <label htmlFor="slug" className="block text-sm font-medium text-white mb-2">
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
            <p className="mt-1 text-xs text-gray-400">
              Utilisé pour l'URL et l'identification. Lettres minuscules, chiffres et tirets uniquement.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              {isSubmitting ? 'Création...' : 'Créer l\'organisation'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Annuler
            </Button>
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
