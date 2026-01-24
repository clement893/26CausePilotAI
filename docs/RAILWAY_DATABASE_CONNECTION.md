# Guide de Connexion aux Bases de Données Railway

## 🔍 Problème de Timeout

Si vous rencontrez une erreur de timeout lors du test de connexion à une base de données Railway, cela peut être dû à plusieurs raisons :

### 1. URL Interne vs URL Publique

Railway fournit deux types d'URLs pour les bases de données PostgreSQL :

#### URL Interne (`.railway.internal`)
```
postgresql://postgres:password@postgres-tnv2.railway.internal:5432/railway
```

**Utilisez cette URL si :**
- ✅ Votre backend est déployé sur Railway
- ✅ Le backend et la base de données sont dans le **même projet Railway**
- ✅ Vous voulez une connexion plus rapide et sécurisée

**Ne fonctionne PAS si :**
- ❌ Le backend n'est pas sur Railway
- ❌ Le backend est sur Railway mais dans un projet différent
- ❌ Vous testez depuis votre machine locale

#### URL Publique (`.railway.app` ou `.up.railway.app`)
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

**Utilisez cette URL si :**
- ✅ Votre backend n'est pas sur Railway
- ✅ Vous testez depuis votre machine locale
- ✅ Le backend est sur Railway mais dans un projet différent
- ✅ Vous avez besoin d'une connexion depuis l'extérieur de Railway

### 2. Comment Trouver la Bonne URL

#### Dans Railway Dashboard :

1. **URL Interne** :
   - Allez dans votre service PostgreSQL
   - Variables → `DATABASE_URL` ou `POSTGRES_URL`
   - Cherchez l'URL avec `.railway.internal`

2. **URL Publique** :
   - Allez dans votre service PostgreSQL
   - Variables → `DATABASE_URL` ou `POSTGRES_URL`
   - Cherchez l'URL avec `.railway.app` ou `.up.railway.app`
   - OU dans l'onglet "Connect" → "Public Networking"

### 3. Configuration Recommandée

#### Scénario A : Backend sur Railway (même projet)
```
✅ Utilisez l'URL interne : postgres-tnv2.railway.internal
```

#### Scénario B : Backend sur Railway (projet différent)
```
✅ Utilisez l'URL publique : containers-us-west-xxx.railway.app
⚠️ Activez "Public Networking" dans Railway
```

#### Scénario C : Backend local ou autre hébergeur
```
✅ Utilisez l'URL publique : containers-us-west-xxx.railway.app
⚠️ Activez "Public Networking" dans Railway
```

### 4. Activer le Public Networking sur Railway

Si vous devez utiliser l'URL publique :

1. Allez dans votre service PostgreSQL sur Railway
2. Cliquez sur l'onglet **"Networking"**
3. Activez **"Public Networking"**
4. Railway générera une URL publique avec un port
5. Utilisez cette URL dans votre chaîne de connexion

### 5. Vérification de l'Accessibilité

Pour vérifier si votre backend peut accéder à la base de données :

**Test depuis le backend Railway :**
```bash
# Dans les logs Railway ou via Railway CLI
railway run python -c "
import asyncio
import asyncpg

async def test():
    conn = await asyncpg.connect(
        'postgresql://postgres:password@postgres-tnv2.railway.internal:5432/railway'
    )
    result = await conn.fetchval('SELECT version()')
    print(result)
    await conn.close()

asyncio.run(test())
"
```

**Test depuis votre machine locale :**
```bash
# Utilisez l'URL publique
psql "postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

## 🔧 Solutions aux Erreurs Courantes

### Erreur : "timeout of 30000ms exceeded"

**Causes possibles :**
1. URL interne utilisée mais backend pas sur Railway
2. Public Networking non activé pour l'URL publique
3. Firewall ou règles de sécurité bloquant la connexion
4. Base de données non démarrée

**Solutions :**
1. Vérifiez que vous utilisez la bonne URL selon votre configuration
2. Activez Public Networking si nécessaire
3. Vérifiez que la base de données est démarrée dans Railway
4. Vérifiez les variables d'environnement Railway

### Erreur : "could not translate host name"

**Cause :** L'URL interne `.railway.internal` n'est pas résolvable depuis votre backend.

**Solution :** Utilisez l'URL publique ou assurez-vous que le backend est sur Railway dans le même projet.

### Erreur : "connection refused"

**Cause :** Le port ou l'hôte est incorrect, ou Public Networking n'est pas activé.

**Solution :** 
- Vérifiez l'URL dans Railway
- Activez Public Networking si vous utilisez l'URL publique
- Vérifiez que le port est correct (généralement 5432)

## 📝 Exemple de Configuration

### Exemple 1 : Backend et DB sur Railway (même projet)

**URL à utiliser :**
```
postgresql+asyncpg://postgres:iCLNsRJtFotPQtMBLjBaWnuPirrpPTpp@postgres-tnv2.railway.internal:5432/railway
```

### Exemple 2 : Backend sur Railway, DB sur Railway (projet différent)

**URL à utiliser (publique) :**
```
postgresql+asyncpg://postgres:iCLNsRJtFotPQtMBLjBaWnuPirrpPTpp@containers-us-west-xxx.railway.app:5432/railway
```

### Exemple 3 : Backend local, DB sur Railway

**URL à utiliser (publique) :**
```
postgresql+asyncpg://postgres:iCLNsRJtFotPQtMBLjBaWnuPirrpPTpp@containers-us-west-xxx.railway.app:5432/railway
```

## ⚠️ Sécurité

- 🔒 Les URLs internes Railway (`.railway.internal`) sont plus sécurisées car elles ne sont pas exposées publiquement
- 🔓 Les URLs publiques nécessitent un mot de passe fort
- 🔐 Utilisez toujours HTTPS/TLS pour les connexions publiques (Railway le fait automatiquement)
- 🛡️ Limitez l'accès aux IPs autorisées si possible

## 📚 Ressources

- [Railway PostgreSQL Documentation](https://docs.railway.app/databases/postgresql)
- [Railway Networking Guide](https://docs.railway.app/networking)
- [Guide de configuration DB](./ORGANIZATION_DATABASE_SETUP.md)
