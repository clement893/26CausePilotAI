'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Alert, Badge } from '@/components/ui';
import {
  updateOrganizationDatabase,
  testOrganizationDatabase,
  createOrganizationDatabase,
} from '@/lib/api/organizations';
import { Eye, EyeOff, Database, CheckCircle2, XCircle, Loader2, Settings, Code } from 'lucide-react';

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
  const [useSimpleMode, setUseSimpleMode] = useState(true);
  
  // Simple form fields
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('postgres');
  const [dbPassword, setDbPassword] = useState('');

  // Parse connection string to fill simple form
  useEffect(() => {
    if (currentConnectionString && useSimpleMode) {
      try {
        const url = new URL(currentConnectionString.replace(/^postgresql\+?asyncpg?:\/\//, 'http://'));
        setDbHost(url.hostname);
        setDbPort(url.port || '5432');
        setDbName(url.pathname.replace(/^\//, ''));
        setDbUser(url.username || 'postgres');
        setDbPassword(url.password || '');
      } catch (e) {
        // If parsing fails, keep simple mode but don't fill fields
      }
    }
  }, [currentConnectionString, useSimpleMode]);

  // Build connection string from simple form fields
  const buildConnectionString = (): string => {
    if (!useSimpleMode) {
      return connectionString;
    }
    
    if (!dbHost || !dbName || !dbUser || !dbPassword) {
      return '';
    }
    
    // Encode password and user to handle special characters
    const encodedUser = encodeURIComponent(dbUser);
    const encodedPassword = encodeURIComponent(dbPassword);
    const port = dbPort || '5432';
    
    return `postgresql+asyncpg://${encodedUser}:${encodedPassword}@${dbHost}:${port}/${dbName}`;
  };

  // Update connection string when simple form fields change
  useEffect(() => {
    if (useSimpleMode) {
      const built = buildConnectionString();
      if (built) {
        setConnectionString(built);
      }
    }
  }, [dbHost, dbPort, dbName, dbUser, dbPassword, useSimpleMode]);

  // Mask connection string for display (hide password)
  const maskConnectionString = (str: string): string => {
    if (!str) return '';
    // Replace password in connection string: postgresql://user:password@host/db
    return str.replace(/:([^:@]+)@/, ':****@');
  };

  const handleTestConnection = async () => {
    const finalConnectionString = buildConnectionString();
    
    if (!finalConnectionString.trim()) {
      setError(useSimpleMode 
        ? 'Veuillez remplir tous les champs requis' 
        : 'Veuillez entrer une chaîne de connexion');
      setTestResult(null);
      return;
    }

    setIsTesting(true);
    setError(null);
    setSuccess(null);
    setTestResult(null);

    try {
      const result = await testOrganizationDatabase(organizationId, {
        dbConnectionString: finalConnectionString,
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
    const finalConnectionString = buildConnectionString();
    
    if (!finalConnectionString.trim()) {
      setError(useSimpleMode 
        ? 'Veuillez remplir tous les champs requis' 
        : 'Veuillez entrer une chaîne de connexion');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateOrganizationDatabase(organizationId, {
        dbConnectionString: finalConnectionString,
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

          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-foreground">Mode de configuration</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={useSimpleMode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setUseSimpleMode(true)}
                disabled={isSaving || isTesting || isCreating}
              >
                <Settings className="w-4 h-4 mr-2" />
                Simple
              </Button>
              <Button
                type="button"
                variant={!useSimpleMode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setUseSimpleMode(false)}
                disabled={isSaving || isTesting || isCreating}
              >
                <Code className="w-4 h-4 mr-2" />
                Avancé
              </Button>
            </div>
          </div>

          {useSimpleMode ? (
            /* Simple Form Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="db-host" className="text-sm font-medium text-foreground">
                    Hôte <span className="text-error-600">*</span>
                  </label>
                  <Input
                    id="db-host"
                    type="text"
                    value={dbHost}
                    onChange={(e) => {
                      setDbHost(e.target.value);
                      setError(null);
                      setSuccess(null);
                      setTestResult(null);
                    }}
                    placeholder="postgres-tnv2.railway.internal"
                    disabled={isSaving || isTesting || isCreating}
                  />
                  <p className="text-xs text-muted-foreground">Adresse du serveur PostgreSQL</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="db-port" className="text-sm font-medium text-foreground">
                    Port
                  </label>
                  <Input
                    id="db-port"
                    type="number"
                    value={dbPort}
                    onChange={(e) => {
                      setDbPort(e.target.value);
                      setError(null);
                      setSuccess(null);
                      setTestResult(null);
                    }}
                    placeholder="5432"
                    disabled={isSaving || isTesting || isCreating}
                  />
                  <p className="text-xs text-muted-foreground">Port PostgreSQL (défaut: 5432)</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="db-name" className="text-sm font-medium text-foreground">
                  Nom de la base de données <span className="text-error-600">*</span>
                </label>
                <Input
                  id="db-name"
                  type="text"
                  value={dbName}
                  onChange={(e) => {
                    setDbName(e.target.value);
                    setError(null);
                    setSuccess(null);
                    setTestResult(null);
                  }}
                  placeholder="railway"
                  disabled={isSaving || isTesting || isCreating}
                />
                <p className="text-xs text-muted-foreground">Nom de la base de données PostgreSQL</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="db-user" className="text-sm font-medium text-foreground">
                    Utilisateur <span className="text-error-600">*</span>
                  </label>
                  <Input
                    id="db-user"
                    type="text"
                    value={dbUser}
                    onChange={(e) => {
                      setDbUser(e.target.value);
                      setError(null);
                      setSuccess(null);
                      setTestResult(null);
                    }}
                    placeholder="postgres"
                    disabled={isSaving || isTesting || isCreating}
                  />
                  <p className="text-xs text-muted-foreground">Nom d'utilisateur PostgreSQL</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="db-password" className="text-sm font-medium text-foreground">
                    Mot de passe <span className="text-error-600">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      id="db-password"
                      type={showPassword ? 'text' : 'password'}
                      value={dbPassword}
                      onChange={(e) => {
                        setDbPassword(e.target.value);
                        setError(null);
                        setSuccess(null);
                        setTestResult(null);
                      }}
                      placeholder="••••••••"
                      className="pr-10"
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
                  <p className="text-xs text-muted-foreground">Mot de passe PostgreSQL</p>
                </div>
              </div>

              {/* Preview of generated connection string */}
              {buildConnectionString() && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Chaîne générée automatiquement :</p>
                  <code className="text-xs font-mono text-foreground break-all">
                    {maskConnectionString(buildConnectionString())}
                  </code>
                </div>
              )}
            </div>
          ) : (
            /* Advanced Mode - Direct Connection String */
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
                <br />
                Le système convertit automatiquement <code className="bg-muted px-1 rounded">postgresql://</code> en <code className="bg-muted px-1 rounded">postgresql+asyncpg://</code>
              </p>
            </div>
          )}

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
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800">
              <p className="text-xs text-info-700 dark:text-info-300">
                <strong>Note:</strong> La création automatique nécessite que la variable d'environnement{' '}
                <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">ORG_DB_BASE_URL</code> soit configurée.
                La base de données sera nommée automatiquement selon le slug de l'organisation.
              </p>
            </div>
            
            {/* Railway URL Help */}
            {(dbHost?.includes('railway.internal') || connectionString?.includes('railway.internal')) && (
              <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                <p className="text-xs text-warning-700 dark:text-warning-300 font-medium mb-1">
                  ⚠️ URL Railway Interne Détectée
                </p>
                <p className="text-xs text-warning-700 dark:text-warning-300">
                  L'URL <code className="bg-warning-100 dark:bg-warning-900/40 px-1 rounded">*.railway.internal</code> ne fonctionne que si votre backend est sur Railway dans le même projet. 
                  Si vous avez des timeouts, utilisez l'URL publique Railway (avec <code className="bg-warning-100 dark:bg-warning-900/40 px-1 rounded">*.railway.app</code>) et activez "Public Networking" dans Railway.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
