'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState } from 'react';
import { Container, Card, Button, Input, Tooltip, useToast } from '@/components/ui';
import { useOrganization } from '@/hooks/useOrganization';
import { createDonor } from '@/lib/api/donors';
import { migrateOrganizationDatabase } from '@/lib/api/organizations';
import { errorLogger } from '@/lib/logger/errorLogger';
import type { DonorCreate } from '@modele/types';
import { ArrowLeft, Database, Loader2, User, Mail, Info, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';

export default function NewDonorPage() {
  const locale = useLocale();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { success, error: showErrorToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationSuccess, setMigrationSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMigrationButton, setShowMigrationButton] = useState(false);
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

      // Show success toast
      success('Donateur créé avec succès !', { duration: 3000 });
      
      // Small delay before redirect to show toast
      setTimeout(() => {
        window.location.href = `/${locale}/dashboard/base-donateur/donateurs`;
      }, 500);
    } catch (err) {
      const errorMessage = errorLogger.getUserFriendlyMessage(err);
      setError(errorMessage);
      
      // Log error
      errorLogger.error('Failed to create donor', err instanceof Error ? err : new Error(String(err)), {
        organizationId: activeOrganization?.id,
        formData: { ...formData, email: formData.email }, // Don't log full form data for privacy
      });
      
      // Check if error is related to missing database tables
      const errorLower = String(err).toLowerCase();
      const isDatabaseError = 
        errorLower.includes('database') || 
        errorLower.includes('table') ||
        errorLower.includes('does not exist') ||
        errorLower.includes('relation') ||
        errorLower.includes('migration') ||
        errorLower.includes('schema');
      
      setShowMigrationButton(isDatabaseError);
      
      // Show error toast
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof DonorCreate, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMigrateDatabase = async () => {
    if (!activeOrganization) {
      setError('Aucune organisation active');
      return;
    }

    setIsMigrating(true);
    setError(null);
    setMigrationSuccess(null);

    try {
      const result = await migrateOrganizationDatabase(activeOrganization.id);

      if (result.success) {
        const successMessage = 
          result.message + 
          (result.tables_created && result.tables_created.length > 0 
            ? ` Tables créées: ${result.tables_created.join(', ')}`
            : '');
        setMigrationSuccess(successMessage);
        setShowMigrationButton(false);
        setError(null);
        success('Migrations exécutées avec succès !', { duration: 6000 });
      } else {
        const errorMessage = result.message || 'Erreur lors de la mise à jour de la base de données';
        setError(errorMessage);
        setShowMigrationButton(true);
        showErrorToast(errorMessage);
      }
    } catch (err) {
      const errorMessage = errorLogger.getUserFriendlyMessage(err);
      setError(errorMessage);
      setShowMigrationButton(true);
      
      // Log error
      errorLogger.error('Failed to migrate database', err instanceof Error ? err : new Error(String(err)), {
        organizationId: activeOrganization?.id,
      });
      
      // Show error toast
      showErrorToast(errorMessage);
    } finally {
      setIsMigrating(false);
    }
  };

  if (orgLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="text-center py-12">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </Container>
    );
  }

  if (!activeOrganization) {
    return (
      <Container className="py-8 lg:py-12">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400">Aucune organisation active</p>
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
        <h1 className="text-3xl font-bold text-white mb-2">Nouveau donateur</h1>
        <p className="text-gray-400">Ajouter un nouveau donateur à votre base de données</p>
      </div>

      {/* Database Migration Alert */}
      {error && showMigrationButton && (
        <Card className="mb-6 border-warning bg-warning/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-warning">Migration de base de données requise</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Les tables de la base de données doivent être créées avant de pouvoir ajouter des donateurs.
                {error && <span className="block mt-2 text-destructive text-xs font-medium">{error}</span>}
              </p>
              <Tooltip content="Exécute les migrations Alembic pour créer les tables nécessaires">
                <Button
                  onClick={handleMigrateDatabase}
                  disabled={isMigrating || !activeOrganization}
                  className="bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour en cours...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Mettre à jour la BD
                    </>
                  )}
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}

      {migrationSuccess && (
        <Card className="mb-6 border-success bg-success/10 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-success-foreground text-xs font-bold">✓</span>
            </div>
            <p className="text-success font-medium">{migrationSuccess}</p>
          </div>
        </Card>
      )}

      <Card className="border-2 border-gray-800/50 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && !error.includes('Database tables not found') && !showMigrationButton && (
            <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Vérifiez les informations saisies et réessayez.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Informations de base</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-white">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Tooltip content="L'email doit être unique et sera utilisé pour les communications">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="donateur@example.com"
                  className="h-12 text-base border-2 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-white">
                  Téléphone
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-12 text-base border-2 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="first_name" className="block text-sm font-semibold text-white">
                  Prénom
                </label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="Jean"
                  className="h-12 text-base border-2 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="last_name" className="block text-sm font-semibold text-white">
                  Nom de famille
                </label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="Dupont"
                  className="h-12 text-base border-2 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center gap-3 pb-4">
              <div className="p-2 bg-success/10 rounded-lg">
                <Mail className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-2xl font-bold">Préférences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="preferred_language" className="block text-sm font-semibold text-white">
                  Langue préférée
                </label>
                <select
                  id="preferred_language"
                  value={formData.preferred_language}
                  onChange={(e) => handleChange('preferred_language', e.target.value)}
                  className="w-full h-12 px-4 py-2 border-2 rounded-lg bg-[#13131A] text-white focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-4 bg-[#1C1C26]/30 rounded-lg hover:bg-[#1C1C26]/50 transition-colors cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="opt_in_email"
                    checked={formData.opt_in_email}
                    onChange={(e) => handleChange('opt_in_email', e.target.checked)}
                    className="w-5 h-5 rounded border-2 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="opt_in_email" className="text-sm font-medium cursor-pointer flex-1">
                    Accepte de recevoir des emails
                  </label>
                </div>
              </div>

              <div className="p-4 bg-[#1C1C26]/30 rounded-lg hover:bg-[#1C1C26]/50 transition-colors cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="opt_in_sms"
                    checked={formData.opt_in_sms}
                    onChange={(e) => handleChange('opt_in_sms', e.target.checked)}
                    className="w-5 h-5 rounded border-2 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="opt_in_sms" className="text-sm font-medium cursor-pointer flex-1">
                    Accepte de recevoir des SMS
                  </label>
                </div>
              </div>

              <div className="p-4 bg-[#1C1C26]/30 rounded-lg hover:bg-[#1C1C26]/50 transition-colors cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="opt_in_postal"
                    checked={formData.opt_in_postal}
                    onChange={(e) => handleChange('opt_in_postal', e.target.checked)}
                    className="w-5 h-5 rounded border-2 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="opt_in_postal" className="text-sm font-medium cursor-pointer flex-1">
                    Accepte de recevoir du courrier postal
                  </label>
                </div>
              </div>

              <div className="p-4 bg-[#1C1C26]/30 rounded-lg hover:bg-[#1C1C26]/50 transition-colors cursor-pointer border-2 border-transparent hover:border-primary/20">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_anonymous"
                    checked={formData.is_anonymous}
                    onChange={(e) => handleChange('is_anonymous', e.target.checked)}
                    className="w-5 h-5 rounded border-2 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="is_anonymous" className="text-sm font-medium cursor-pointer flex-1">
                    Donateur anonyme
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href="/dashboard/base-donateur/donateurs">
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSubmitting}
                className="min-w-[120px] hover:scale-105 transition-transform"
              >
                Annuler
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[180px] shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le donateur'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
