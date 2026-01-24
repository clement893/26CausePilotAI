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
        // Normalize URL for parsing
        let urlString = currentConnectionString.replace(/^postgresql\+?asyncpg?:\/\//, 'http://');
        const url = new URL(urlString);
        
        setDbHost(url.hostname || '');
        // Ensure port is valid - default to 5432 if empty
        setDbPort(url.port && url.port.trim() ? url.port.trim() : '5432');
        setDbName(url.pathname.replace(/^\//, '') || '');
        setDbUser(url.username || 'postgres');
        setDbPassword(url.password || '');
      } catch (e) {
        // If parsing fails, keep simple mode but don't fill fields
        console.warn('Failed to parse connection string:', e);
      }
    }
  }, [currentConnectionString, useSimpleMode]);

  // Build connection string from simple form fields
  const buildConnectionString = (): string => {
    if (!useSimpleMode) {
      return connectionString;
    }
    
    // If dbHost contains a full connection string and other fields are not filled,
    // try to parse it. Otherwise, use the individual field values.
    const hasFullUrl = dbHost && (dbHost.includes('://') || (dbHost.includes('postgresql') && dbHost.includes('@')));
    const hasIndividualFields = dbHost && dbName && dbUser && dbPassword && 
                                 !dbHost.includes('://') && !dbHost.includes('@');
    
    // If we have individual fields filled (parsing worked), use them
    if (hasIndividualFields) {
      if (!dbHost || !dbName || !dbUser || !dbPassword) {
        return '';
      }
      
      // Encode password and user to handle special characters
      const encodedUser = encodeURIComponent(dbUser);
      const encodedPassword = encodeURIComponent(dbPassword);
      // Ensure port is valid - default to 5432 if empty or invalid
      const port = dbPort && dbPort.trim() && !isNaN(Number(dbPort)) ? dbPort.trim() : '5432';
      
      return `postgresql+asyncpg://${encodedUser}:${encodedPassword}@${dbHost}:${port}/${dbName}`;
    }
    
    // If dbHost contains a full URL but parsing didn't work, try to parse it now
    if (hasFullUrl) {
      try {
        // Remove scheme prefix to get the connection part
        let connectionPart = dbHost;
        
        // Remove postgresql+asyncpg://, postgresql://, or postgres://
        connectionPart = connectionPart.replace(/^postgresql\+asyncpg:\/\//, '');
        connectionPart = connectionPart.replace(/^postgresql:\/\//, '');
        connectionPart = connectionPart.replace(/^postgres:\/\//, '');
        
        // Parse: user:password@host:port/database
        let username = dbUser && dbUser.trim() ? dbUser.trim() : 'postgres';
        let password = dbPassword && dbPassword.trim() ? dbPassword.trim() : '';
        let hostname = '';
        let port = dbPort && dbPort.trim() ? dbPort.trim() : '5432';
        let database = dbName && dbName.trim() ? dbName.trim() : '';
        
        // Check if there's a @ (user:password@host)
        if (connectionPart.includes('@')) {
          const [authPart, hostPart] = connectionPart.split('@', 2);
          
          // Parse username and password
          if (authPart.includes(':')) {
            const [user, pass] = authPart.split(':', 2);
            username = user || username;
            password = pass || password;
          } else {
            username = authPart || username;
          }
          
          // Parse host:port/database
          connectionPart = hostPart;
        }
        
        // Parse host:port/database
        if (connectionPart.includes('/')) {
          const [hostPortPart, dbPart] = connectionPart.split('/', 2);
          if (!database) {
            database = dbPart || '';
          }
          connectionPart = hostPortPart;
        }
        
        // Parse host:port
        if (connectionPart.includes(':')) {
          const [host, portPart] = connectionPart.split(':', 2);
          hostname = host || '';
          const parsedPort = portPart || port;
          // Clean up port if it contains multiple colons (malformed)
          port = parsedPort.includes(':') ? parsedPort.split(':')[0] : parsedPort;
        } else {
          hostname = connectionPart || '';
        }
        
        // Use parsed values, but prefer user-provided values if they exist
        const finalUser = dbUser && dbUser.trim() ? dbUser.trim() : username;
        const finalPassword = dbPassword && dbPassword.trim() ? dbPassword.trim() : password;
        const finalHost = hostname || dbHost;
        const finalPort = (dbPort && dbPort.trim()) ? dbPort.trim() : port;
        const finalDbName = dbName && dbName.trim() ? dbName.trim() : database;
        
        if (!finalHost || !finalDbName || !finalUser || !finalPassword) {
          return '';
        }
        
        // Encode password and user to handle special characters
        const encodedUser = encodeURIComponent(finalUser);
        const encodedPassword = encodeURIComponent(finalPassword);
        const portNum = finalPort && !isNaN(Number(finalPort)) ? finalPort : '5432';
        
        return `postgresql+asyncpg://${encodedUser}:${encodedPassword}@${finalHost}:${portNum}/${finalDbName}`;
      } catch (err) {
        console.warn('Failed to parse connection string from host field:', err);
        // Fall through to normal building
      }
    }
    
    // Normal building from individual fields
    if (!dbHost || !dbName || !dbUser || !dbPassword) {
      return '';
    }
    
    // Encode password and user to handle special characters
    const encodedUser = encodeURIComponent(dbUser);
    const encodedPassword = encodeURIComponent(dbPassword);
    // Ensure port is valid - default to 5432 if empty or invalid
    const port = dbPort && dbPort.trim() && !isNaN(Number(dbPort)) ? dbPort.trim() : '5432';
    
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
      let errorMessage = err instanceof Error ? err.message : 'Erreur lors du test de connexion';
      
      // Provide more helpful error messages for timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('exceeded') || errorMessage.includes('Timeout')) {
        const isRailway = dbHost?.includes('railway') || connectionString?.includes('railway');
        const isInternal = dbHost?.includes('railway.internal') || connectionString?.includes('railway.internal');
        
        errorMessage = `Timeout: La connexion à la base de données prend trop de temps (plus de 3 minutes).\n\n`;
        
        if (isRailway) {
          errorMessage += `🔧 Configuration Railway :\n\n`;
          if (isInternal) {
            errorMessage += `Vous utilisez une URL Railway interne (.railway.internal).\n\n`;
            errorMessage += `✅ Si votre backend et votre base de données sont dans le MÊME projet Railway :\n`;
            errorMessage += `   - Vérifiez que les deux services sont bien dans le même projet\n`;
            errorMessage += `   - Vérifiez que les deux services sont démarrés\n\n`;
            errorMessage += `❌ Si votre backend et votre base de données sont dans des projets DIFFÉRENTS :\n`;
            errorMessage += `   - Utilisez l'URL PUBLIQUE Railway (avec .railway.app)\n`;
            errorMessage += `   - Activez "Public Networking" dans les paramètres de votre service PostgreSQL\n`;
            errorMessage += `   - Copiez l'URL depuis les variables d'environnement Railway (DATABASE_URL ou PGDATABASE_URL)\n\n`;
          } else {
            errorMessage += `Vous utilisez une URL Railway publique (.railway.app).\n\n`;
            errorMessage += `✅ Vérifications :\n`;
            errorMessage += `   1. Allez dans votre service PostgreSQL sur Railway\n`;
            errorMessage += `   2. Ouvrez l'onglet "Settings"\n`;
            errorMessage += `   3. Activez "Public Networking" si ce n'est pas déjà fait\n`;
            errorMessage += `   4. Vérifiez que le port est correct (généralement 5432)\n`;
            errorMessage += `   5. Vérifiez que l'URL de connexion correspond exactement à celle dans Railway\n\n`;
          }
        } else {
          errorMessage += `Causes possibles :\n`;
          errorMessage += `- La base de données est inaccessible depuis le serveur backend\n`;
          errorMessage += `- Le réseau est lent ou instable\n`;
          errorMessage += `- Les paramètres de connexion sont incorrects\n`;
          errorMessage += `- Le firewall bloque la connexion\n\n`;
        }
        
        errorMessage += `📋 Vérifications générales :\n`;
        errorMessage += `- L'URL de connexion est correcte et complète\n`;
        errorMessage += `- Le nom d'hôte, le port, l'utilisateur et le mot de passe sont corrects\n`;
        errorMessage += `- La base de données existe (si vous testez une connexion, créez d'abord la base)\n`;
        errorMessage += `- Le serveur backend peut accéder à Internet pour se connecter à la base de données`;
      }
      
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
      let errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      
      // Provide more helpful error messages for timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('exceeded')) {
        errorMessage = `Timeout: Le test de connexion prend trop de temps (plus de 3 minutes).\n\n` +
          `La connexion n'a pas été sauvegardée. Vérifiez que:\n` +
          `- L'URL de connexion est correcte\n` +
          `- Le serveur backend peut accéder à Internet pour se connecter à la base de données\n` +
          `- Si vous utilisez Railway, vérifiez que "Public Networking" est activé pour votre service PostgreSQL\n` +
          `- Vérifiez que le port est correct (Railway utilise parfois des ports non-standard)`;
      }
      
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
                      const value = e.target.value;
                      setDbHost(value);
                      setError(null);
                      setSuccess(null);
                      setTestResult(null);
                      
                      // Auto-detect and parse full connection string if pasted
                      if (value.includes('://') && (value.includes('postgresql') || value.includes('postgres'))) {
                        try {
                          // Remove scheme prefix to get the connection part
                          let connectionPart = value;
                          
                          // Remove postgresql+asyncpg://, postgresql://, or postgres://
                          connectionPart = connectionPart.replace(/^postgresql\+asyncpg:\/\//, '');
                          connectionPart = connectionPart.replace(/^postgresql:\/\//, '');
                          connectionPart = connectionPart.replace(/^postgres:\/\//, '');
                          
                          // Parse: user:password@host:port/database
                          // Format: [user[:password]@]host[:port][/database]
                          
                          let username = 'postgres';
                          let password = '';
                          let hostname = '';
                          let port = '5432';
                          let database = '';
                          
                          // Check if there's a @ (user:password@host)
                          if (connectionPart.includes('@')) {
                            const [authPart, hostPart] = connectionPart.split('@', 2);
                            
                            // Parse username and password
                            if (authPart.includes(':')) {
                              const [user, pass] = authPart.split(':', 2);
                              username = user || 'postgres';
                              password = pass || '';
                            } else {
                              username = authPart || 'postgres';
                            }
                            
                            // Parse host:port/database
                            connectionPart = hostPart;
                          }
                          
                          // Parse host:port/database
                          if (connectionPart.includes('/')) {
                            const [hostPortPart, dbPart] = connectionPart.split('/', 2);
                            database = dbPart || '';
                            connectionPart = hostPortPart;
                          }
                          
                          // Parse host:port
                          if (connectionPart.includes(':')) {
                            const [host, portPart] = connectionPart.split(':', 2);
                            hostname = host || '';
                            port = portPart || '5432';
                            // Clean up port if it contains multiple colons (malformed)
                            if (port.includes(':')) {
                              port = port.split(':')[0];
                            }
                          } else {
                            hostname = connectionPart || '';
                          }
                          
                          // Only update if we successfully parsed hostname
                          if (hostname) {
                            setDbHost(hostname);
                            setDbPort(port);
                            setDbName(database);
                            setDbUser(username);
                            setDbPassword(password);
                          }
                        } catch (err) {
                          // If parsing fails, just use the value as-is
                          console.warn('Failed to parse connection string from host field:', err);
                        }
                      }
                    }}
                    placeholder="tramway.proxy.rlwy.net"
                    disabled={isSaving || isTesting || isCreating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Adresse du serveur PostgreSQL (ou collez l'URL complète pour auto-remplir)
                  </p>
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
              <p className="text-xs text-info-700 dark:text-info-300 mb-2">
                <strong>📘 Guide de Configuration Railway :</strong>
              </p>
              <ol className="text-xs text-info-700 dark:text-info-300 list-decimal list-inside space-y-1 mb-2">
                <li>Allez dans votre service PostgreSQL sur Railway</li>
                <li>Ouvrez l'onglet <strong>"Variables"</strong> ou <strong>"Connect"</strong></li>
                <li>Copiez la variable <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">DATABASE_URL</code> ou <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">PGDATABASE_URL</code></li>
                <li>Si backend et DB sont dans le même projet Railway : utilisez l'URL avec <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">.railway.internal</code></li>
                <li>Sinon : utilisez l'URL publique avec <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">.railway.app</code> et activez "Public Networking"</li>
                <li>Remplacez le nom de la base de données par le nom souhaité pour cette organisation</li>
              </ol>
              <p className="text-xs text-info-700 dark:text-info-300">
                <strong>Note:</strong> La création automatique fonctionne maintenant sans <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">ORG_DB_BASE_URL</code> - 
                elle utilise automatiquement votre <code className="bg-info-100 dark:bg-info-900/40 px-1 rounded">DATABASE_URL</code>.
              </p>
            </div>
            
            {/* Railway URL Help */}
            {(dbHost?.includes('railway.internal') || connectionString?.includes('railway.internal')) && (
              <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                <p className="text-xs text-warning-700 dark:text-warning-300 font-medium mb-1">
                  ⚠️ URL Railway Interne Détectée
                </p>
                <p className="text-xs text-warning-700 dark:text-warning-300 mb-2">
                  L'URL <code className="bg-warning-100 dark:bg-warning-900/40 px-1 rounded">*.railway.internal</code> ne fonctionne que si votre backend est sur Railway dans le même projet Railway. 
                  Si vous obtenez une erreur "Name or service not known" ou des timeouts, cela signifie que :
                </p>
                <ul className="text-xs text-warning-700 dark:text-warning-300 list-disc list-inside space-y-1 mb-2">
                  <li>Le backend n'est pas dans le même projet Railway que la base de données, OU</li>
                  <li>Les services ne sont pas correctement configurés pour communiquer entre eux</li>
                </ul>
                <p className="text-xs text-warning-700 dark:text-warning-300">
                  <strong>Solution :</strong> Utilisez l'URL publique Railway (avec <code className="bg-warning-100 dark:bg-warning-900/40 px-1 rounded">*.railway.app</code>) 
                  disponible dans les variables d'environnement Railway de votre base de données. Activez "Public Networking" dans Railway si nécessaire.
                </p>
              </div>
            )}
            
            {/* DNS Error Help */}
            {error && (error.toLowerCase().includes('name or service not known') || error.toLowerCase().includes('errno -2') || error.toLowerCase().includes('résolution dns')) && (
              <div className="p-3 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
                <p className="text-xs text-error-700 dark:text-error-300 font-medium mb-1">
                  🔍 Erreur de Résolution DNS
                </p>
                <p className="text-xs text-error-700 dark:text-error-300 mb-2">
                  Le serveur backend ne peut pas résoudre le nom d'hôte de la base de données. Causes possibles :
                </p>
                <ul className="text-xs text-error-700 dark:text-error-300 list-disc list-inside space-y-1 mb-2">
                  <li>URL Railway interne (.railway.internal) utilisée mais backend pas dans le même projet</li>
                  <li>Nom d'hôte incorrect ou typo dans l'URL</li>
                  <li>Problème de connectivité réseau du backend</li>
                </ul>
                <p className="text-xs text-error-700 dark:text-error-300">
                  <strong>Solution :</strong> Vérifiez que vous utilisez l'URL correcte (publique si backend et DB sont dans des projets différents, interne si dans le même projet).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
