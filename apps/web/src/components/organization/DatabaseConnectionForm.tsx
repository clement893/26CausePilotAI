'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Alert, Badge } from '@/components/ui';
import {
  updateOrganizationDatabase,
  testOrganizationDatabase,
  createOrganizationDatabase,
  migrateOrganizationDatabase,
  getOrganizationDatabaseTables,
} from '@/lib/api/organizations';
import { Eye, EyeOff, Database, CheckCircle2, XCircle, Loader2, Settings, Code, Wand2 } from 'lucide-react';

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
  const [isMigrating, setIsMigrating] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [databaseTables, setDatabaseTables] = useState<string[]>([]);
  const [databaseName, setDatabaseName] = useState<string | null>(null);
  // Initialize showEditForm based on whether we have a connection string
  // Check both currentConnectionString prop and connectionString state
  const hasConnection = Boolean(currentConnectionString?.trim() || connectionString?.trim());
  const [showEditForm, setShowEditForm] = useState(!hasConnection);
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
          const partsAt = connectionPart.split('@', 2);
          const authPart = partsAt[0] ?? '';
          const hostPart = partsAt[1] ?? '';
          
          // Parse username and password
          if (authPart.includes(':')) {
            const partsColon = authPart.split(':', 2);
            username = partsColon[0] ?? username;
            password = partsColon[1] ?? password;
          } else {
            username = authPart || username;
          }
          
          // Parse host:port/database
          connectionPart = hostPart;
        }
        
        // Parse host:port/database
        if (connectionPart.includes('/')) {
          const partsSlash = connectionPart.split('/', 2);
          const hostPortPart = partsSlash[0] ?? connectionPart;
          const dbPart = partsSlash[1] ?? '';
          if (!database) {
            database = dbPart;
          }
          connectionPart = hostPortPart;
        }
        
        // Parse host:port
        if (connectionPart.includes(':')) {
          const partsColon = connectionPart.split(':', 2);
          hostname = partsColon[0] ?? '';
          const portPart = partsColon[1] ?? port;
          // Clean up port if it contains multiple colons (malformed)
          port = portPart.includes(':') ? (portPart.split(':')[0] ?? port) : portPart;
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

  // Helper function to parse a full connection string URL
  const parseConnectionString = (value: string): boolean => {
    if (!value || !value.trim()) {
      return false;
    }
    
    // Decode URL-encoded characters (%20 = space, etc.)
    let decodedValue = value;
    try {
      decodedValue = decodeURIComponent(value);
    } catch (e) {
      // If decoding fails, use original value
      decodedValue = value;
    }
    
    // Clean up: remove leading/trailing whitespace
    decodedValue = decodedValue.trim();
    
    // Check for URL patterns: postgresql://, postgres://, or postgresql+asyncpg://
    const isFullUrl = (
      (decodedValue.includes('://') && (decodedValue.includes('postgresql') || decodedValue.includes('postgres'))) ||
      (decodedValue.includes('@') && decodedValue.includes('.') && (decodedValue.includes(':') || decodedValue.match(/:\d+/)))
    );
    
    if (!isFullUrl) {
      return false;
    }
    
    try {
      // Remove scheme prefix to get the connection part
      let connectionPart = decodedValue.trim();
      
      // Remove postgresql+asyncpg://, postgresql://, or postgres://
      connectionPart = connectionPart.replace(/^postgresql\+asyncpg:\/\//i, '');
      connectionPart = connectionPart.replace(/^postgresql:\/\//i, '');
      connectionPart = connectionPart.replace(/^postgres:\/\//i, '');
      
      // Parse: user:password@host:port/database
      // Format: [user[:password]@]host[:port][/database]
      
      let username = 'postgres';
      let password = '';
      let hostname = '';
      let port = '5432';
      let database = '';
      
      // Check if there's a @ (user:password@host)
      if (connectionPart.includes('@')) {
        const atIndex = connectionPart.indexOf('@');
        const authPart = connectionPart.substring(0, atIndex);
        const hostPart = connectionPart.substring(atIndex + 1);
        
        // Parse username and password
        if (authPart.includes(':')) {
          const colonIndex = authPart.indexOf(':');
          username = authPart.substring(0, colonIndex) || 'postgres';
          password = authPart.substring(colonIndex + 1) || '';
        } else {
          username = authPart || 'postgres';
        }
        
        // Parse host:port/database
        connectionPart = hostPart;
      }
      
      // Parse host:port/database
      if (connectionPart.includes('/')) {
        const slashIndex = connectionPart.indexOf('/');
        const hostPortPart = connectionPart.substring(0, slashIndex);
        database = connectionPart.substring(slashIndex + 1) || '';
        connectionPart = hostPortPart;
      }
      
      // Parse host:port
      if (connectionPart.includes(':')) {
        const colonIndex = connectionPart.lastIndexOf(':'); // Use lastIndexOf to handle IPv6 addresses
        hostname = connectionPart.substring(0, colonIndex) || '';
        const portPart = connectionPart.substring(colonIndex + 1) || '5432';
        // Clean up port if it contains multiple colons (malformed)
        port = portPart.includes(':') ? (portPart.split(':')[0] ?? portPart) : portPart;
        // Remove any trailing characters that might be part of the database name
        port = port.split('/')[0] ?? port;
      } else {
        hostname = connectionPart || '';
      }
      
      // Clean up database name (remove any trailing path or query params)
      if (database) {
        const afterQ = database.split('?')[0] ?? database;
        database = afterQ.split('#')[0] ?? afterQ;
      }
      
      // Clean up parsed values
      hostname = hostname.trim();
      port = port.trim();
      database = database.trim();
      username = username.trim();
      password = password.trim();
      
      // Only update if we successfully parsed hostname (must contain a dot or be a valid hostname)
      if (hostname && (hostname.includes('.') || hostname.match(/^[a-zA-Z0-9-]+$/))) {
        // Remove any leading/trailing slashes or special characters
        hostname = hostname.replace(/^[\/\s]+|[\/\s]+$/g, '');
        port = port.replace(/^[\/\s:]+|[\/\s:]+$/g, '');
        database = database.replace(/^[\/\s]+|[\/\s]+$/g, '');
        
        setDbHost(hostname);
        setDbPort(port || '5432');
        setDbName(database);
        setDbUser(username);
        setDbPassword(password);
        return true;
      }
    } catch (err) {
      console.warn('Failed to parse connection string:', err);
    }
    
    return false;
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
    setTestResult(null);

    try {
      // Save and get the updated organization from the server
      const updatedOrganization = await updateOrganizationDatabase(organizationId, {
        dbConnectionString: finalConnectionString,
        testConnection: true, // Test before saving
      });

      // Use the connection string from the server response (normalized)
      const savedConnectionString = updatedOrganization.dbConnectionString || finalConnectionString;
      
      // Extract database name from connection string
      const dbName = savedConnectionString.split('/').pop()?.split('?')[0] || 'unknown';
      
      setSuccess(`✅ Base de données connectée avec succès ! (${dbName})`);
      setTestResult({
        success: true,
        message: `Connexion sauvegardée et testée avec succès. Base de données: ${dbName}`,
        databaseName: dbName
      });
      
      // Update current connection string locally to reflect the saved state from server
      setConnectionString(savedConnectionString);
      
      // Update the form fields to match the saved connection
      if (useSimpleMode) {
        // Re-parse the connection string to update form fields
        parseConnectionString(savedConnectionString);
      }
      
      // Reload tables after saving
      await loadTables();
      
      // Hide edit form after successful save
      setShowEditForm(false);
      
      // Refresh parent component to get updated connection string from server
      // Wait a bit to ensure backend has committed the transaction
      await new Promise(resolve => setTimeout(resolve, 300));
      await onUpdate();
    } catch (err: any) {
      console.error('Error saving database connection:', err);
      
      let errorMessage = 'Erreur lors de la sauvegarde';
      
      // Extract error message from response - FastAPI returns errors in response.data.detail
      if (err?.response?.data) {
        const responseData = err.response.data;
        
        // FastAPI error format: { detail: "error message" }
        if (responseData.detail) {
          if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail;
          } else if (Array.isArray(responseData.detail)) {
            // Validation errors format
            errorMessage = responseData.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join('\n');
          } else {
            errorMessage = JSON.stringify(responseData.detail);
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = typeof responseData.error === 'string' 
            ? responseData.error 
            : responseData.error.message || JSON.stringify(responseData.error);
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Provide more helpful error messages for timeout errors
      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes('timeout') || errorLower.includes('exceeded') || errorLower.includes('timed out')) {
        errorMessage = `Timeout: Le test de connexion prend trop de temps (plus de 3 minutes).\n\n` +
          `La connexion n'a pas été sauvegardée. Vérifiez que:\n` +
          `- L'URL de connexion est correcte\n` +
          `- Le serveur backend peut accéder à Internet pour se connecter à la base de données\n` +
          `- Si vous utilisez Railway, vérifiez que "Public Networking" est activé pour votre service PostgreSQL\n` +
          `- Vérifiez que le port est correct (Railway utilise parfois des ports non-standard)`;
      }
      
      // Check for connection test failure
      if (errorLower.includes('connection test failed') || errorLower.includes('test de connexion')) {
        errorMessage = `Le test de connexion a échoué. La connexion n'a pas été sauvegardée.\n\n${errorMessage}`;
      }
      
      setError(errorMessage);
      setTestResult({
        success: false,
        message: errorMessage,
      });
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
        // Load tables after creation
        await loadTables();
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

  const handleMigrateDatabase = async () => {
    console.log('[DatabaseConnectionForm] handleMigrateDatabase called', { organizationId });
    setIsMigrating(true);
    setError(null);
    setSuccess(null);
    setTestResult(null);

    try {
      console.log('[DatabaseConnectionForm] Calling migrateOrganizationDatabase API...');
      const result = await migrateOrganizationDatabase(organizationId);
      console.log('[DatabaseConnectionForm] Migration result:', result);

      if (result.success) {
        const successMsg = result.message + (result.tables_created && result.tables_created.length > 0 
          ? ` Tables créées: ${result.tables_created.join(', ')}`
          : '');
        console.log('[DatabaseConnectionForm] Migration successful:', successMsg);
        setSuccess(successMsg);
        // Reload tables after migration
        await loadTables();
        onUpdate(); // Refresh parent component
      } else {
        console.error('[DatabaseConnectionForm] Migration failed:', result.message);
        setError(result.message || 'La migration a échoué');
      }
    } catch (err) {
      console.error('[DatabaseConnectionForm] Migration error:', err);
      let errorMessage = 'Erreur lors de la mise à jour de la base de données';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check for specific error types
        if (err.message.includes('404')) {
          errorMessage = 'Organisation non trouvée. Vérifiez que l\'ID est correct.';
        } else if (err.message.includes('400')) {
          errorMessage = 'Connexion à la base de données non configurée. Configurez d\'abord la connexion.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Erreur serveur lors de la migration. Vérifiez les logs du backend.';
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setIsMigrating(false);
      console.log('[DatabaseConnectionForm] Migration process finished');
    }
  };

  const loadTables = async () => {
    if (!currentConnectionString) {
      return;
    }

    setIsLoadingTables(true);
    try {
      const result = await getOrganizationDatabaseTables(organizationId);
      if (result.success) {
        setDatabaseTables(result.tables || []);
        setDatabaseName(result.database_name || null);
      }
    } catch (err) {
      console.warn('Failed to load database tables:', err);
      // Don't show error, just log it
    } finally {
      setIsLoadingTables(false);
    }
  };

  // Update connectionString when currentConnectionString changes from props
  useEffect(() => {
    // Log for debugging
    if (currentConnectionString) {
      console.log('[DatabaseConnectionForm] Received currentConnectionString:', currentConnectionString.substring(0, 50) + '...');
    }
    
    if (currentConnectionString && currentConnectionString.trim() && currentConnectionString !== connectionString) {
      console.log('[DatabaseConnectionForm] Updating connectionString from prop');
      setConnectionString(currentConnectionString);
      // Hide edit form if connection is already configured
      setShowEditForm(false);
    } else if (!currentConnectionString && connectionString) {
      // If currentConnectionString becomes empty but we have a local connectionString, keep it
      // This handles the case where the prop might be temporarily undefined during reload
      console.log('[DatabaseConnectionForm] currentConnectionString is empty but we have local connectionString, keeping it');
    } else if (!currentConnectionString && !connectionString) {
      // No connection at all, show form
      console.log('[DatabaseConnectionForm] No connection found, showing form');
      setShowEditForm(true);
    }
  }, [currentConnectionString, connectionString]);
  
  // Hide edit form when connection is successfully saved
  useEffect(() => {
    if (success && (currentConnectionString || connectionString)) {
      setShowEditForm(false);
      // Clear success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [success, currentConnectionString, connectionString]);
  
  // Load tables when connection string is available
  useEffect(() => {
    const activeConnectionString = currentConnectionString || connectionString;
    if (activeConnectionString) {
      loadTables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConnectionString, connectionString, organizationId]);

  return (
    <Card title="Configuration Base de Données" className="space-y-4">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Configurez la connexion à la base de données PostgreSQL pour cette organisation.
            Chaque organisation possède sa propre base de données isolée.
          </p>

          {/* Current Status - Always visible when connection exists */}
          {(currentConnectionString || connectionString) && (
            <div className="mb-4 p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400" />
                  <span className="text-sm font-medium text-success-700 dark:text-success-300">
                    Base de données connectée
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">✅ Configurée</Badge>
                  {!showEditForm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditForm(true)}
                    >
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-success-600 dark:text-success-400 mt-2 font-mono break-all">
                {maskConnectionString(currentConnectionString || connectionString)}
              </p>
              <p className="text-xs text-success-600 dark:text-success-400 mt-2">
                La connexion est active. Utilisez le bouton "Mettre à jour la BD" ci-dessous pour créer les tables.
              </p>
            </div>
          )}

          {/* Edit Form - Only show if showEditForm is true or no connection exists */}
          {showEditForm || !(currentConnectionString || connectionString) ? (
            <>
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
                  <div className="flex gap-2">
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
                        
                        // Try to parse if it looks like a full URL
                        parseConnectionString(value);
                      }}
                      placeholder="tramway.proxy.rlwy.net"
                      disabled={isSaving || isTesting || isCreating}
                      className="flex-1"
                    />
                    {(() => {
                      // Check if dbHost looks like it might contain a full URL
                      const decodedHost = decodeURIComponent(dbHost).trim();
                      const looksLikeUrl = (
                        decodedHost.includes('://') ||
                        (decodedHost.includes('@') && decodedHost.includes('.')) ||
                        (decodedHost.includes('postgresql') && decodedHost.includes('@')) ||
                        (decodedHost.includes('postgres') && decodedHost.includes('@'))
                      );
                      return looksLikeUrl;
                    })() && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const parsed = parseConnectionString(dbHost);
                          if (parsed) {
                            setSuccess('URL parsée avec succès !');
                            setError(null);
                          } else {
                            setError('Impossible de parser l\'URL. Vérifiez le format.');
                          }
                        }}
                        disabled={isSaving || isTesting || isCreating}
                        title="Parser l'URL complète"
                      >
                        <Wand2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
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
          </>
          ) : null}

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
            <Alert 
              variant="success" 
              className="flex items-start gap-2"
              data-success-message
            >
              <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">✅ Succès - Base de données connectée</p>
                <p className="text-sm mt-1">{success}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Vous pouvez maintenant utiliser le bouton "Mettre à jour la BD" pour créer les tables.
                </p>
              </div>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="error" className="flex items-start gap-2">
              <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Erreur</p>
                <p className="text-sm mt-1 whitespace-pre-line">{error}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Vérifiez la console du navigateur (F12) pour plus de détails.
                </p>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {/* Show form buttons only when editing */}
            {showEditForm || !(currentConnectionString || connectionString) ? (
              <>
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
                  disabled={isTesting || isSaving || isCreating || isMigrating || !connectionString.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sauvegarde et test en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>

                {organizationSlug && (
                  <Button
                    variant="ghost"
                    onClick={handleCreateDatabase}
                    disabled={isTesting || isSaving || isCreating || isMigrating}
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
              </>
            ) : null}

            {/* Always show migrate button when connection exists */}
            {(currentConnectionString || connectionString) && (
              <Button
                variant="ghost"
                onClick={handleMigrateDatabase}
                disabled={isTesting || isSaving || isCreating || isMigrating}
                className="border border-primary/20"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Mettre à jour la BD
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

          {/* Database Tables List */}
          {(currentConnectionString || connectionString) && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  Tables de la base de données
                  {databaseName && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({databaseName})
                    </span>
                  )}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadTables}
                  disabled={isLoadingTables}
                >
                  {isLoadingTables ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Actualiser
                    </>
                  )}
                </Button>
              </div>
              
              {databaseTables.length > 0 ? (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {databaseTables.map((table) => (
                      <div
                        key={table}
                        className="px-3 py-2 rounded-md bg-background border border-border text-sm font-mono"
                      >
                        {table}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {databaseTables.length} table{databaseTables.length > 1 ? 's' : ''} trouvée{databaseTables.length > 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">
                    {isLoadingTables ? (
                      'Chargement des tables...'
                    ) : (
                      'Aucune table trouvée. Cliquez sur "Mettre à jour la BD" pour créer les tables.'
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
