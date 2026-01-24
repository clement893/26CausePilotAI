'use client';

import { useState } from 'react';
import { Card, Button, Input, Alert, Badge } from '@/components/ui';
import {
  updateOrganizationDatabase,
  testOrganizationDatabase,
  createOrganizationDatabase,
} from '@/lib/api/organizations';
import { Eye, EyeOff, Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface DatabaseConnectionFormProps {
  organizationId: string;
  currentConnectionString?: string;
  organizationSlug?: string;
  onUpdate: () => void;
}

export function DatabaseConnectionForm({
  organizationId,
  currentConnectionString,
  organizationSlug,
  onUpdate,
}: DatabaseConnectionFormProps) {
  const [connectionString, setConnectionString] = useState(currentConnectionString || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    databaseName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Mask connection string for display (hide password)
  const maskConnectionString = (str: string): string => {
    if (!str) return '';
    // Replace password in connection string: postgresql://user:password@host/db
    return str.replace(/:([^:@]+)@/, ':****@');
  };

  const handleTestConnection = async () => {
    if (!connectionString.trim()) {
      setError('Veuillez entrer une chaîne de connexion');
      setTestResult(null);
      return;
    }

    setIsTesting(true);
    setError(null);
    setSuccess(null);
    setTestResult(null);

    try {
      const result = await testOrganizationDatabase(organizationId, {
        dbConnectionString: connectionString,
      });

      setTestResult(result);
      if (result.success) {
        setSuccess(`Connexion réussie à la base de données '${result.databaseName || 'inconnue'}'`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du test de connexion';
      setError(errorMessage);
      setTestResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!connectionString.trim()) {
      setError('Veuillez entrer une chaîne de connexion');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateOrganizationDatabase(organizationId, {
        dbConnectionString: connectionString,
        testConnection: true, // Test before saving
      });

      setSuccess('Chaîne de connexion mise à jour avec succès');
      setTestResult(null);
      onUpdate(); // Refresh parent component
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateDatabase = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    setTestResult(null);

    try {
      const result = await createOrganizationDatabase(organizationId);

      if (result.success) {
        setConnectionString(result.dbConnectionString);
        setSuccess(
          `Base de données '${result.databaseName}' créée avec succès. La chaîne de connexion a été mise à jour.`
        );
        onUpdate(); // Refresh parent component
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la base de données';
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card title="Configuration Base de Données" className="space-y-4">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Configurez la connexion à la base de données PostgreSQL pour cette organisation.
            Chaque organisation possède sa propre base de données isolée.
          </p>

          {/* Current Status */}
          {currentConnectionString && (
            <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Connexion actuelle</span>
                </div>
                <Badge variant="success">Configurée</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                {maskConnectionString(currentConnectionString)}
              </p>
            </div>
          )}

          {/* Connection String Input */}
          <div className="space-y-2">
            <label htmlFor="db-connection" className="text-sm font-medium text-foreground">
              Chaîne de connexion PostgreSQL
            </label>
            <div className="relative">
              <Input
                id="db-connection"
                type={showPassword ? 'text' : 'password'}
                value={connectionString}
                onChange={(e) => {
                  setConnectionString(e.target.value);
                  setError(null);
                  setSuccess(null);
                  setTestResult(null);
                }}
                placeholder="postgresql+asyncpg://user:password@host:5432/database"
                className="font-mono text-sm pr-10"
                disabled={isSaving || isTesting || isCreating}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isSaving || isTesting || isCreating}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: <code className="bg-muted px-1 rounded">postgresql+asyncpg://user:password@host:5432/database</code>
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert
              variant={testResult.success ? 'success' : 'error'}
              className="flex items-start gap-2"
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium">{testResult.success ? 'Connexion réussie' : 'Échec de la connexion'}</p>
                <p className="text-sm mt-1">{testResult.message}</p>
                {testResult.databaseName && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    Base de données: <code className="bg-muted px-1 rounded">{testResult.databaseName}</code>
                  </p>
                )}
              </div>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert variant="success" className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Succès</p>
                <p className="text-sm mt-1">{success}</p>
              </div>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="error" className="flex items-start gap-2">
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Erreur</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="primary"
              onClick={handleTestConnection}
              disabled={isTesting || isSaving || isCreating || !connectionString.trim()}
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Tester la connexion
                </>
              )}
            </Button>

            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isTesting || isSaving || isCreating || !connectionString.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Sauvegarder'
              )}
            </Button>

            {organizationSlug && (
              <Button
                variant="ghost"
                onClick={handleCreateDatabase}
                disabled={isTesting || isSaving || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Créer automatiquement la BD
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800">
            <p className="text-xs text-info-700 dark:text-info-300">
              <strong>Note:</strong> La création automatique nécessite que la variable d'environnement{' '}
              <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">ORG_DB_BASE_URL</code> soit configurée.
              La base de données sera nommée automatiquement selon le slug de l'organisation.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
