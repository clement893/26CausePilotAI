# 🔧 Guide : Exécuter les Migrations sur les Bases de Données d'Organisation

## ⚠️ Important

**Les donateurs sont stockés dans la base de données de l'organisation, PAS dans la base de données principale du backend.**

Chaque organisation a sa propre base de données PostgreSQL isolée. Les migrations doivent être exécutées sur **chaque** base de données d'organisation.

---

## 🎯 Problème Actuel

Si vous obtenez l'erreur `A database error occurred` lors de la création d'un donateur, c'est probablement parce que les nouvelles tables CRM n'existent pas encore dans la base de données de l'organisation.

---

## ✅ Solution : Exécuter les Migrations

### Option 1 : Via l'API (Recommandé)

Utilisez l'endpoint API pour exécuter les migrations sur une organisation spécifique :

```bash
POST /api/v1/organizations/{organization_id}/database/migrate
```

**Exemple avec curl :**
```bash
curl -X POST \
  "https://modelebackend-production-f855.up.railway.app/api/v1/organizations/ff52c391-a91a-44f4-8d0c-9db5d51385f5/database/migrate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Note :** Cet endpoint nécessite les droits SuperAdmin.

### Option 2 : Via Script Python

Créez un script pour exécuter les migrations sur toutes les organisations :

```python
# scripts/migrate_organizations.py
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.organization import Organization
from app.core.organization_database_manager import OrganizationDatabaseManager
from sqlalchemy import select

async def migrate_all_organizations():
    async for db in get_db():
        # Get all organizations
        query = select(Organization)
        result = await db.execute(query)
        organizations = result.scalars().all()
        
        for org in organizations:
            if not org.db_connection_string:
                print(f"⚠️  Organisation {org.slug} n'a pas de connexion DB configurée")
                continue
            
            try:
                print(f"🔄 Exécution des migrations pour {org.name} ({org.slug})...")
                await OrganizationDatabaseManager.run_migrations_for_organization(
                    org.db_connection_string
                )
                print(f"✅ Migrations exécutées avec succès pour {org.name}")
            except Exception as e:
                print(f"❌ Erreur pour {org.name}: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_all_organizations())
```

### Option 3 : Via Alembic Directement

Pour une organisation spécifique :

```bash
# 1. Obtenir la connection string de l'organisation
# 2. Exécuter Alembic avec cette connection string

export ORG_DB_URL="postgresql+asyncpg://user:pass@host:port/dbname"
alembic -x sqlalchemy.url=$ORG_DB_URL upgrade head
```

---

## 📋 Migrations à Exécuter

Les migrations suivantes doivent être exécutées sur chaque base de données d'organisation :

1. **`add_donor_tables_001`** - Tables de base (donors, donations, payment_methods, etc.)
2. **`add_donor_crm_002`** - Tables CRM (segments, tags, communications, campaigns, recurring_donations)

---

## 🔍 Vérifier l'État des Migrations

### Vérifier les Tables Existantes

Utilisez l'endpoint API :

```bash
GET /api/v1/organizations/{organization_id}/database/tables
```

Cela retournera la liste de toutes les tables dans la base de données de l'organisation.

### Tables Attendues

Après les migrations, vous devriez avoir :

**Tables de base :**
- `donors`
- `donations`
- `payment_methods`
- `donor_notes`
- `donor_activities`

**Tables CRM (nouvelles) :**
- `donor_segments`
- `donor_segment_assignments`
- `donor_tags`
- `donor_tag_assignments`
- `donor_communications`
- `campaigns`
- `recurring_donations`

---

## 🚨 Résolution du Problème Actuel

Pour résoudre l'erreur `A database error occurred` :

1. **Identifier l'organisation** : Notez l'`organization_id` de l'erreur
2. **Exécuter les migrations** : Utilisez l'endpoint `/database/migrate` ou le script
3. **Vérifier** : Utilisez `/database/tables` pour confirmer que les tables existent
4. **Réessayer** : Créez un donateur à nouveau

---

## 🔄 Migration Automatique lors de la Création d'Organisation

Quand une nouvelle organisation est créée avec `create_database=True`, les migrations sont automatiquement exécutées. Mais pour les organisations existantes, il faut les exécuter manuellement.

---

## 📝 Script Complet

Voici un script complet pour migrer toutes les organisations :

```python
#!/usr/bin/env python3
"""
Script pour exécuter les migrations sur toutes les bases de données d'organisation
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, text
from app.core.config import settings
from app.models.organization import Organization
from app.core.organization_database_manager import OrganizationDatabaseManager

async def main():
    # Connect to main database
    main_db_url = settings.DATABASE_URL
    engine = create_async_engine(main_db_url)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get all organizations
        result = await session.execute(select(Organization))
        organizations = result.scalars().all()
        
        print(f"📊 Trouvé {len(organizations)} organisation(s)\n")
        
        for org in organizations:
            print(f"🏢 Organisation: {org.name} ({org.slug})")
            
            if not org.db_connection_string:
                print(f"   ⚠️  Pas de connexion DB configurée\n")
                continue
            
            try:
                # Check current tables
                tables_before = await OrganizationDatabaseManager.list_database_tables(
                    org.db_connection_string
                )
                print(f"   📋 Tables actuelles: {len(tables_before)}")
                
                # Run migrations
                print(f"   🔄 Exécution des migrations...")
                await OrganizationDatabaseManager.run_migrations_for_organization(
                    org.db_connection_string
                )
                
                # Check tables after
                tables_after = await OrganizationDatabaseManager.list_database_tables(
                    org.db_connection_string
                )
                new_tables = set(tables_after) - set(tables_before)
                
                print(f"   ✅ Migrations terminées")
                print(f"   📋 Tables après: {len(tables_after)}")
                if new_tables:
                    print(f"   🆕 Nouvelles tables: {', '.join(new_tables)}")
                print()
                
            except Exception as e:
                print(f"   ❌ Erreur: {e}\n")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🎯 Prochaines Étapes

1. **Exécutez les migrations** sur la base de données de l'organisation concernée
2. **Vérifiez** que les tables existent
3. **Testez** la création d'un donateur
4. **Répétez** pour toutes les organisations si nécessaire

---

## 📞 Support

Si le problème persiste après avoir exécuté les migrations, vérifiez :
- Les logs du backend pour l'erreur exacte
- Que la connexion à la base de données de l'organisation fonctionne
- Que les permissions de la base de données permettent la création de tables
