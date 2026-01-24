"""
Organization Database Manager

Manages separate databases for organizations.
This module handles:
- Creating new organization databases
- Getting database connections for organizations
- Testing database connections
- Running migrations for organization databases
"""

from typing import Optional, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError, SQLAlchemyError
import re
from urllib.parse import urlparse, urlunparse

from app.core.config import settings
from app.core.logging import logger


class OrganizationDatabaseManager:
    """
    Manager for organization databases.
    
    This class handles creating and managing separate databases for each organization.
    Each organization can have its own PostgreSQL database with a custom connection string.
    """
    
    _engines: Dict[str, any] = {}  # Key: organization_id (UUID as string)
    _sessions: Dict[str, async_sessionmaker] = {}  # Key: organization_id (UUID as string)
    
    @classmethod
    def get_org_db_base_url(cls) -> Optional[str]:
        """Get base database URL for organization databases"""
        base_url = getattr(settings, 'ORG_DB_BASE_URL', None)
        return str(base_url) if base_url else None
    
    @classmethod
    def get_org_db_prefix(cls) -> str:
        """Get prefix for organization database names"""
        return getattr(settings, 'ORG_DB_PREFIX', 'causepilot_org_')
    
    @classmethod
    def get_organization_db_name(cls, organization_slug: str) -> str:
        """
        Get database name for an organization based on its slug.
        
        Args:
            organization_slug: Organization slug (e.g., 'croix-rouge')
        
        Returns:
            Database name (e.g., 'causepilot_org_croix_rouge')
        """
        # Sanitize slug: replace dashes with underscores, ensure lowercase
        sanitized_slug = organization_slug.lower().replace('-', '_')
        # Remove any invalid characters
        sanitized_slug = re.sub(r'[^a-z0-9_]', '', sanitized_slug)
        return f"{cls.get_org_db_prefix()}{sanitized_slug}"
    
    @classmethod
    def generate_db_connection_string(cls, organization_slug: str) -> Optional[str]:
        """
        Generate a database connection string for an organization.
        
        Args:
            organization_slug: Organization slug
        
        Returns:
            Connection string or None if ORG_DB_BASE_URL is not configured
        """
        base_url = cls.get_org_db_base_url()
        if not base_url:
            return None
        
        db_name = cls.get_organization_db_name(organization_slug)
        
        # Parse base URL and replace database name
        # Format: postgresql+asyncpg://user:pass@host:port/dbname
        if "/" in base_url:
            parts = base_url.rsplit("/", 1)
            base_without_db = parts[0]
            return f"{base_without_db}/{db_name}"
        else:
            return f"{base_url}/{db_name}"
    
    @classmethod
    def parse_db_connection_string(cls, connection_string: str) -> dict:
        """
        Parse a database connection string and extract components.
        
        Args:
            connection_string: PostgreSQL connection string
        
        Returns:
            Dictionary with parsed components (scheme, user, password, host, port, database)
        """
        try:
            # Handle both postgresql:// and postgresql+asyncpg://
            clean_url = connection_string.replace('postgresql+asyncpg://', 'postgresql://')
            parsed = urlparse(clean_url)
            
            result = {
                'scheme': parsed.scheme,
                'user': parsed.username,
                'password': parsed.password,
                'host': parsed.hostname,
                'port': parsed.port or 5432,
                'database': parsed.path.lstrip('/'),
                'full': connection_string
            }
            
            # Validate required fields
            if not result['host']:
                raise ValueError("Host is required in connection string")
            if not result['database']:
                raise ValueError("Database name is required in connection string")
            
            return result
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Failed to parse connection string: {e}")
            raise ValueError(f"Invalid connection string format: {e}")
    
    @classmethod
    def mask_connection_string(cls, connection_string: str) -> str:
        """
        Mask password in connection string for logging/display.
        
        Args:
            connection_string: Full connection string
        
        Returns:
            Connection string with masked password
        """
        try:
            parsed = cls.parse_db_connection_string(connection_string)
            if parsed['password']:
                masked_password = '*' * len(parsed['password'])
                return connection_string.replace(parsed['password'], masked_password)
            return connection_string
        except Exception:
            # If parsing fails, just mask common patterns
            return re.sub(r':([^:@]+)@', r':****@', connection_string)
    
    @classmethod
    def normalize_connection_string(cls, db_connection_string: str) -> str:
        """
        Normalize a database connection string to use asyncpg driver.
        
        Args:
            db_connection_string: PostgreSQL connection string (any format)
        
        Returns:
            Normalized connection string with asyncpg driver
        """
        if not db_connection_string:
            return db_connection_string
        
        # Remove any existing driver specification
        normalized = db_connection_string
        
        # Handle different PostgreSQL URL formats
        if normalized.startswith('postgresql+asyncpg://'):
            return normalized  # Already correct
        elif normalized.startswith('postgresql+psycopg2://'):
            normalized = normalized.replace('postgresql+psycopg2://', 'postgresql+asyncpg://', 1)
        elif normalized.startswith('postgresql://'):
            normalized = normalized.replace('postgresql://', 'postgresql+asyncpg://', 1)
        elif normalized.startswith('postgres://'):
            normalized = normalized.replace('postgres://', 'postgresql+asyncpg://', 1)
        elif not normalized.startswith(('postgresql://', 'postgresql+asyncpg://', 'postgres://')):
            # If it doesn't start with a known prefix, try to add one
            # This handles cases where user might paste just the connection parts
            if '@' in normalized and ':' in normalized:
                # Looks like it might be a connection string without prefix
                normalized = f'postgresql+asyncpg://{normalized}'
        
        return normalized
    
    @classmethod
    async def test_connection(cls, db_connection_string: str, timeout: int = 30) -> tuple[bool, str, Optional[str]]:
        """
        Test a database connection string.
        
        Args:
            db_connection_string: PostgreSQL connection string to test
            timeout: Connection timeout in seconds
        
        Returns:
            Tuple of (success: bool, message: str, database_name: Optional[str])
        """
        if not db_connection_string:
            return False, "Connection string is empty", None
        
        # Normalize connection string
        db_connection_string = cls.normalize_connection_string(db_connection_string)
        
        # Validate format after normalization
        if not db_connection_string.startswith('postgresql+asyncpg://'):
            return False, "Format de chaîne de connexion invalide. Doit être une chaîne de connexion PostgreSQL valide.", None
        
        # Parse to get host for better error messages
        try:
            parsed = cls.parse_db_connection_string(db_connection_string)
        except ValueError as e:
            return False, f"Format de chaîne de connexion invalide: {str(e)}", None
        
        try:
            
            # Create a temporary engine for testing
            test_engine = create_async_engine(
                db_connection_string,
                echo=False,
                pool_pre_ping=True,
                connect_args={
                    "command_timeout": timeout,
                    "server_settings": {
                        "application_name": "causepilot_test_connection",
                    },
                    "timeout": timeout,  # Connection timeout
                },
                pool_timeout=timeout,  # Pool timeout
            )
            
            async with test_engine.connect() as conn:
                # Test basic connection
                result = await conn.execute(text("SELECT version()"))
                version = result.scalar()
                
                # Get database name
                result = await conn.execute(text("SELECT current_database()"))
                db_name = result.scalar()
                
                logger.info(f"Successfully tested connection to database: {db_name}")
            
            await test_engine.dispose()
            
            parsed = cls.parse_db_connection_string(db_connection_string)
            return True, f"Connection successful to database '{db_name}'", db_name
            
        except OperationalError as e:
            error_msg = str(e)
            logger.error(f"Database operational error testing connection: {error_msg}")
            # Provide more helpful error messages
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                return False, f"Timeout: La connexion à la base de données a pris trop de temps. Vérifiez que la base de données est accessible depuis le serveur backend et que l'URL est correcte.", None
            elif "could not translate host name" in error_msg.lower() or "name resolution" in error_msg.lower():
                return False, f"Résolution DNS échouée: Impossible de résoudre le nom d'hôte '{parsed.get('host', 'unknown')}'. Vérifiez que l'hôte est correct et accessible.", None
            elif "connection refused" in error_msg.lower():
                return False, f"Connexion refusée: Le serveur PostgreSQL refuse la connexion. Vérifiez que PostgreSQL est démarré et que le port est correct.", None
            elif "authentication failed" in error_msg.lower() or "password authentication failed" in error_msg.lower():
                return False, f"Authentification échouée: Le nom d'utilisateur ou le mot de passe est incorrect.", None
            else:
                return False, f"Erreur de connexion: {error_msg}", None
        except ProgrammingError as e:
            error_msg = str(e)
            logger.error(f"Database programming error testing connection: {error_msg}")
            return False, f"Erreur de base de données: {error_msg}", None
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Unexpected error testing connection: {error_msg}", exc_info=True)
            # Check for timeout specifically
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                return False, f"Timeout: La connexion a pris trop de temps. Vérifiez que la base de données est accessible depuis le backend et que l'URL de connexion est correcte (utilisez l'URL interne Railway si le backend est sur Railway).", None
            return False, f"Échec du test de connexion: {error_msg}", None
    
    @classmethod
    async def create_organization_database(cls, organization_slug: str, db_connection_string: Optional[str] = None) -> tuple[bool, str]:
        """
        Create a new database for an organization.
        
        Args:
            organization_slug: Organization slug
            db_connection_string: Optional connection string. If not provided, generates one.
        
        Returns:
            Tuple of (success: bool, connection_string: str)
        
        Raises:
            ValueError: If base URL is not configured or database creation fails
        """
        # Generate connection string if not provided
        if not db_connection_string:
            db_connection_string = cls.generate_db_connection_string(organization_slug)
            if not db_connection_string:
                raise ValueError(
                    "ORG_DB_BASE_URL must be set to create organization databases automatically"
                )
        
        parsed = cls.parse_db_connection_string(db_connection_string)
        db_name = parsed['database']
        
        # Get admin connection (connect to 'postgres' database)
        admin_url = f"postgresql+asyncpg://{parsed['user']}:{parsed['password']}@{parsed['host']}:{parsed['port']}/postgres"
        
        try:
            # Create async engine for admin connection
            admin_engine = create_async_engine(
                admin_url,
                echo=False,
                isolation_level="AUTOCOMMIT"
            )
            
            async with admin_engine.connect() as conn:
                # Check if database already exists
                result = await conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :db_name").bindparams(db_name=db_name)
                )
                exists = result.scalar_one_or_none() is not None
                
                if exists:
                    logger.info(f"Organization database {db_name} already exists")
                    await admin_engine.dispose()
                    return True, db_connection_string
                
                # Create database
                await conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                logger.info(f"Created organization database: {db_name}")
            
            await admin_engine.dispose()
            
            # Run migrations on new database
            await cls.run_migrations_for_organization(db_connection_string)
            
            return True, db_connection_string
            
        except OperationalError as e:
            logger.error(f"Database operational error creating organization database {db_name}: {e}", exc_info=True)
            raise ValueError(f"Failed to connect to database: {str(e)}") from e
        except ProgrammingError as e:
            logger.error(f"Database programming error creating organization database {db_name}: {e}", exc_info=True)
            raise ValueError(f"Database SQL error: {str(e)}") from e
        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemy error creating organization database {db_name}: {e}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating organization database {db_name}: {e}", exc_info=True)
            raise
    
    @classmethod
    async def run_migrations_for_organization(cls, db_connection_string: str) -> None:
        """
        Run database migrations on an organization database.
        
        Args:
            db_connection_string: Connection string to the organization database
        """
        try:
            # Import alembic here to avoid circular imports
            from alembic.config import Config
            from alembic import command
            
            # Normalize connection string
            db_connection_string = cls.normalize_connection_string(db_connection_string)
            
            # Create alembic config
            alembic_cfg = Config("alembic.ini")
            alembic_cfg.set_main_option("sqlalchemy.url", db_connection_string)
            
            # Run migrations
            command.upgrade(alembic_cfg, "head")
            
            parsed = cls.parse_db_connection_string(db_connection_string)
            logger.info(f"Ran migrations on organization database: {parsed['database']}")
            
        except OperationalError as e:
            logger.error(f"Database operational error running migrations: {e}", exc_info=True)
            raise ValueError(f"Failed to connect to database for migrations: {str(e)}") from e
        except ProgrammingError as e:
            logger.error(f"Database programming error running migrations: {e}", exc_info=True)
            raise ValueError(f"Migration SQL error: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error running migrations: {e}", exc_info=True)
            raise
    
    @classmethod
    def get_organization_db_engine(cls, organization_id: UUID, db_connection_string: str):
        """
        Get or create SQLAlchemy engine for an organization database.
        
        Args:
            organization_id: Organization UUID
            db_connection_string: Connection string to the organization database
        
        Returns:
            SQLAlchemy async engine
        """
        org_id_str = str(organization_id)
        
        # Invalidate cache if connection string changed
        if org_id_str in cls._engines:
            # Note: In a real implementation, you might want to check if the connection string
            # has changed and invalidate the cache accordingly
            pass
        
        if org_id_str not in cls._engines:
            # Normalize connection string to ensure asyncpg driver
            db_connection_string = cls.normalize_connection_string(db_connection_string)
            
            cls._engines[org_id_str] = create_async_engine(
                db_connection_string,
                echo=settings.DEBUG,
                future=True,
                pool_pre_ping=True,
                pool_size=getattr(settings, 'ORG_DB_POOL_SIZE', 10),
                max_overflow=getattr(settings, 'ORG_DB_MAX_OVERFLOW', 20),
                pool_recycle=3600,
                connect_args={
                    "server_settings": {
                        "application_name": f"causepilot_org_{org_id_str[:8]}",
                    },
                    "command_timeout": 60,
                },
            )
            logger.debug(f"Created engine for organization {org_id_str}")
        
        return cls._engines[org_id_str]
    
    @classmethod
    def get_organization_session_factory(cls, organization_id: UUID, db_connection_string: str) -> async_sessionmaker:
        """
        Get or create session factory for an organization database.
        
        Args:
            organization_id: Organization UUID
            db_connection_string: Connection string to the organization database
        
        Returns:
            AsyncSessionLocal factory
        """
        org_id_str = str(organization_id)
        
        if org_id_str not in cls._sessions:
            engine = cls.get_organization_db_engine(organization_id, db_connection_string)
            cls._sessions[org_id_str] = async_sessionmaker(
                engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False,
            )
        
        return cls._sessions[org_id_str]
    
    @classmethod
    async def get_organization_db_session(cls, organization_id: UUID, db_connection_string: str) -> AsyncSession:
        """
        Get database session for an organization.
        
        This is a generator function compatible with FastAPI Depends.
        
        Args:
            organization_id: Organization UUID
            db_connection_string: Connection string to the organization database
        
        Yields:
            AsyncSession for organization database
        """
        session_factory = cls.get_organization_session_factory(organization_id, db_connection_string)
        async with session_factory() as session:
            try:
                yield session
            finally:
                await session.close()
    
    @classmethod
    def invalidate_cache(cls, organization_id: UUID) -> None:
        """
        Invalidate cached engine and session for an organization.
        Use this when the connection string is updated.
        
        Args:
            organization_id: Organization UUID
        """
        org_id_str = str(organization_id)
        if org_id_str in cls._engines:
            # Note: In a real implementation, you'd want to dispose the engine properly
            del cls._engines[org_id_str]
        if org_id_str in cls._sessions:
            del cls._sessions[org_id_str]
        logger.debug(f"Invalidated cache for organization {org_id_str}")
