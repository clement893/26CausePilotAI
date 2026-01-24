'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState } from 'react';
import { Container, Card, Button, Input } from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { createDonor } from '@/lib/api/donors';
import type { DonorCreate } from '@modele/types';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function NewDonorPage() {
  const locale = useLocale();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DonorCreate>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    preferred_language: 'fr',
    opt_in_email: true,
    opt_in_sms: false,
    opt_in_postal: true,
    is_anonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeOrganization) {
      setError('Aucune organisation active');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createDonor(activeOrganization.id, formData);

      // Redirect to donors list with full reload to ensure fresh data
      window.location.href = `/${locale}/dashboard/base-donateur/donateurs`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la création du donateur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof DonorCreate, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  if (orgLoading) {
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
        <Card>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune organisation active</p>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <Link href="/dashboard/base-donateur/donateurs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la liste
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Nouveau donateur</h1>
        <p className="text-muted-foreground">Ajouter un nouveau donateur à votre base de données</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informations de base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="donateur@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Téléphone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium mb-2">
                  Prénom
                </label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="Jean"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium mb-2">
                  Nom de famille
                </label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="Dupont"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Préférences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="preferred_language" className="block text-sm font-medium mb-2">
                  Langue préférée
                </label>
                <select
                  id="preferred_language"
                  value={formData.preferred_language}
                  onChange={(e) => handleChange('preferred_language', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="opt_in_email"
                  checked={formData.opt_in_email}
                  onChange={(e) => handleChange('opt_in_email', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="opt_in_email" className="text-sm">
                  Accepte de recevoir des emails
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="opt_in_sms"
                  checked={formData.opt_in_sms}
                  onChange={(e) => handleChange('opt_in_sms', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="opt_in_sms" className="text-sm">
                  Accepte de recevoir des SMS
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="opt_in_postal"
                  checked={formData.opt_in_postal}
                  onChange={(e) => handleChange('opt_in_postal', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="opt_in_postal" className="text-sm">
                  Accepte de recevoir du courrier postal
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={(e) => handleChange('is_anonymous', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="is_anonymous" className="text-sm">
                  Donateur anonyme
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/base-donateur/donateurs">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le donateur'}
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
