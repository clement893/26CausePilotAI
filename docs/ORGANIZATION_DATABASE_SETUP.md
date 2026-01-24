# Guide de Configuration des Bases de Données d'Organisation

Ce guide explique comment configurer une base de données PostgreSQL pour une organisation dans CausePilot AI.

## 📋 Prérequis

- Accès SuperAdmin
- URL de connexion PostgreSQL valide
- Base de données PostgreSQL créée et accessible

## 🔧 Configuration via l'Interface Admin

### Étape 1 : Accéder à la page de l'organisation

1. Connectez-vous en tant que **SuperAdmin**
2. Naviguez vers **Dashboard > Super Admin > Organisations**
3. Cliquez sur l'organisation pour laquelle vous souhaitez configurer la base de données

### Étape 2 : Configurer la connexion

1. Dans la section **"Configuration Base de Données"**, vous verrez le formulaire de configuration
2. Collez votre chaîne de connexion PostgreSQL dans le champ **"Chaîne de connexion PostgreSQL"**

   **Format attendu :**
   ```
   postgresql+asyncpg://user:password@host:port/database
   ```
   
   **Note :** Le système accepte aussi `postgresql://` et le convertit automatiquement.

3. Cliquez sur **"Tester la connexion"** pour vérifier que la connexion fonctionne
4. Si le test réussit, cliquez sur **"Sauvegarder"** pour enregistrer la configuration

### Exemple de chaîne de connexion

**Railway PostgreSQL :**
```
postgresql+asyncpg://postgres:password@postgres-tnv2.railway.internal:5432/railway
```

**PostgreSQL local :**
```
postgresql+asyncpg://postgres:password@localhost:5432/causepilot_org_slug
```

**PostgreSQL cloud (ex: AWS RDS) :**
```
postgresql+asyncpg://username:password@your-db-instance.region.rds.amazonaws.com:5432/database_name
```

## 🔧 Configuration via l'API

### Test de connexion

```bash
curl -X POST "http://localhost:8000/api/v1/organizations/{organization_id}/database/test" \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "db_connection_string": "postgresql+asyncpg://postgres:password@host:5432/database"
  }'
```

### Mise à jour de la connexion

```bash
curl -X PATCH "http://localhost:8000/api/v1/organizations/{organization_id}/database" \
  -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "db_connection_string": "postgresql+asyncpg://postgres:password@host:5432/database",
    "test_connection": true
  }'
```

## 🔧 Configuration via Script PowerShell

Un script PowerShell est disponible pour faciliter la configuration :

```powershell
.\scripts\setup_organization_database.ps1 `
  -OrganizationId "uuid-de-l-organisation" `
  -ConnectionString "postgresql://postgres:password@host:5432/database" `
  -ApiBaseUrl "http://localhost:8000" `
  -BearerToken "votre-token-jwt"
```

Le script :
1. Convertit automatiquement l'URL en format asyncpg
2. Teste la connexion
3. Demande confirmation avant de sauvegarder
4. Affiche les résultats

## 📝 Format de la Chaîne de Connexion

### Structure

```
postgresql+asyncpg://[user]:[password]@[host]:[port]/[database]
```

### Composants

- **user** : Nom d'utilisateur PostgreSQL
- **password** : Mot de passe PostgreSQL
- **host** : Adresse du serveur (IP ou domaine)
- **port** : Port PostgreSQL (par défaut 5432)
- **database** : Nom de la base de données

### Exemples

**Railway (interne) :**
```
postgresql+asyncpg://postgres:password@postgres-tnv2.railway.internal:5432/railway
```

**Railway (public) :**
```
postgresql+asyncpg://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**PostgreSQL local :**
```
postgresql+asyncpg://postgres:password@localhost:5432/causepilot_org_slug
```

**AWS RDS :**
```
postgresql+asyncpg://admin:password@mydb.xxxxx.us-east-1.rds.amazonaws.com:5432/mydatabase
```

## ✅ Vérification

Après configuration, vous pouvez vérifier :

1. **Dans l'interface admin** : La section "Configuration Base de Données" affiche le statut "Configurée"
2. **Via l'API** : Récupérer les détails de l'organisation pour voir `db_connection_string`
3. **Logs backend** : Vérifier les logs pour confirmer la connexion

## 🔒 Sécurité

- ⚠️ **Ne partagez jamais** votre chaîne de connexion complète
- ✅ Les mots de passe sont masqués dans l'interface admin
- ✅ Utilisez des variables d'environnement pour les connexions en production
- ✅ Limitez l'accès réseau à votre base de données PostgreSQL

## 🚨 Dépannage

### Erreur : "Connection test failed"

**Causes possibles :**
- URL de connexion incorrecte
- Base de données inaccessible depuis le backend
- Identifiants incorrects
- Firewall bloquant la connexion

**Solutions :**
1. Vérifiez que la base de données est accessible depuis le serveur backend
2. Testez la connexion avec `psql` ou un client PostgreSQL
3. Vérifiez les règles de firewall/security groups
4. Pour Railway, utilisez l'URL interne (`*.railway.internal`) si le backend est sur Railway

### Erreur : "Invalid connection string format"

**Solution :** Assurez-vous que l'URL commence par `postgresql://` ou `postgresql+asyncpg://`

### Base de données non accessible depuis Railway

Si votre backend est sur Railway et votre DB aussi :
- Utilisez l'URL interne : `*.railway.internal`
- Vérifiez que les services sont dans le même projet Railway
- Vérifiez les variables d'environnement de connexion

## 📚 Ressources

- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)
- [Plan d'implémentation DB](./PLAN_IMPLEMENTATION_DB_ORGANISATIONS.md)
