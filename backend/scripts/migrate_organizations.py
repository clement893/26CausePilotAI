#!/usr/bin/env python3
"""
Script pour exécuter les migrations sur toutes les bases de données d'organisation

Usage:
    python scripts/migrate_organizations.py
    python scripts/migrate_organizations.py --organization-id <uuid>
"""

import asyncio
import sys
import argparse
from pathlib import Path
from uuid import UUID

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.models.organization import Organization
from app.core.organization_database_manager import OrganizationDatabaseManager
from app.core.logging import logger


async def migrate_organization(org: Organization) -> bool:
    """Migrate a single organization database"""
    print(f"\n🏢 Organisation: {org.name} ({org.slug})")
    
    if not org.db_connection_string:
        print(f"   ⚠️  Pas de connexion DB configurée")
        return False
    
    try:
        # Check current tables
        tables_before = await OrganizationDatabaseManager.list_database_tables(
            org.db_connection_string
        )
        print(f"   📋 Tables actuelles: {len(tables_before)}")
        if tables_before:
            print(f"      {', '.join(tables_before[:5])}{'...' if len(tables_before) > 5 else ''}")
        
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
            print(f"   🆕 Nouvelles tables créées:")
            for table in sorted(new_tables):
                print(f"      - {table}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        logger.error(f"Error migrating organization {org.id}: {e}", exc_info=True)
        return False


async def migrate_all_organizations():
    """Migrate all organization databases"""
    # Connect to main database
    main_db_url = settings.DATABASE_URL
    engine = create_async_engine(main_db_url)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Get all organizations
            result = await session.execute(select(Organization))
            organizations = result.scalars().all()
            
            print(f"📊 Trouvé {len(organizations)} organisation(s)\n")
            
            success_count = 0
            for org in organizations:
                if await migrate_organization(org):
                    success_count += 1
            
            print(f"\n✅ {success_count}/{len(organizations)} organisation(s) migrée(s) avec succès")
            
    finally:
        await engine.dispose()


async def migrate_single_organization(organization_id: UUID):
    """Migrate a single organization by ID"""
    # Connect to main database
    main_db_url = settings.DATABASE_URL
    engine = create_async_engine(main_db_url)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Get organization
            result = await session.execute(
                select(Organization).where(Organization.id == organization_id)
            )
            organization = result.scalar_one_or_none()
            
            if not organization:
                print(f"❌ Organisation {organization_id} non trouvée")
                return False
            
            return await migrate_organization(organization)
            
    finally:
        await engine.dispose()


async def main():
    parser = argparse.ArgumentParser(description="Migrate organization databases")
    parser.add_argument(
        "--organization-id",
        type=str,
        help="UUID of a specific organization to migrate (if not provided, migrates all)"
    )
    
    args = parser.parse_args()
    
    if args.organization_id:
        try:
            org_id = UUID(args.organization_id)
            await migrate_single_organization(org_id)
        except ValueError:
            print(f"❌ UUID invalide: {args.organization_id}")
            sys.exit(1)
    else:
        await migrate_all_organizations()


if __name__ == "__main__":
    asyncio.run(main())
