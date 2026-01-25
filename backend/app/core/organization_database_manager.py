"""
Organization Database Manager

Manages separate databases for organizations.
This module handles:
- Creating new organization databases
- Getting database connections for organizations
- Testing database connections
- Running migrations for organization databases
"""

from typing import Optional, Dict, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text, create_engine, pool
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
    def _convert_railway_url_to_internal(cls, url: str) -> str:
        """
        Try to convert Railway public URL to internal URL if we're on Railway.
        
        Railway internal URLs (.railway.internal) work better for connections
        within the same Railway project, but we should only convert if we can
        reliably determine the internal hostname.
        """
        import os
        
        # First, clean up any malformed URLs before processing
        # This prevents issues with nested URLs
        if "@" in url and url.count("@") > 1:
            # Check for nested URL patterns and clean them first
            at_positions = [i for i, char in enumerate(url) if char == '@']
            for at_pos in reversed(at_positions):
                after_at = url[at_pos + 1:]
                if after_at.startswith("postgresql://") or after_at.startswith("postgres://"):
                    # Extract the clean URL
                    if after_at.startswith("postgresql://"):
                        url = "postgresql+asyncpg://" + after_at[len("postgresql://"):]
                    else:
                        url = "postgresql+asyncpg://" + after_at[len("postgres://"):]
                    logger.warning(f"Cleaned malformed URL before Railway conversion: {cls.mask_connection_string(url)}")
                    break
        
        # Check if we're on Railway
        is_railway = os.getenv("RAILWAY_ENVIRONMENT") is not None or os.getenv("RAILWAY_SERVICE_NAME") is not None
        
        if not is_railway:
            return url
        
        # Only convert if we have PGHOST (Railway's internal hostname)
        # Don't guess - let the user configure it correctly
        railway_pghost = os.getenv("PGHOST")
        if railway_pghost and (".railway.app" in url or ".up.railway.app" in url or ".rlwy.net" in url):
            # Parse the URL properly to extract hostname
            try:
                # Use parse_db_connection_string to get clean components
                parsed = cls.parse_db_connection_string(url)
                hostname = parsed.get('host', '')
                
                if hostname and hostname != railway_pghost and hostname not in ['postgresql', 'postgres']:
                    # Rebuild URL with new hostname
                    user_pass = ''
                    if parsed['user']:
                        if parsed['password']:
                            user_pass = f"{parsed['user']}:{parsed['password']}@"
                        else:
                            user_pass = f"{parsed['user']}@"
                    
                    port = parsed.get('port', 5432)
                    db_part = f"/{parsed['database']}" if parsed.get('database') else ''
                    new_url = f"postgresql+asyncpg://{user_pass}{railway_pghost}:{port}{db_part}"
                    logger.info(f"Converted Railway public URL to internal using PGHOST: {hostname} -> {railway_pghost}")
                    return new_url
            except Exception as e:
                logger.warning(f"Failed to parse URL for Railway conversion: {e}, using original URL")
                # Fallback to simple replace if parsing fails
                parsed = urlparse(url)
                hostname = parsed.hostname or ""
                if hostname and hostname != railway_pghost:
                    # Use more precise replacement to avoid duplicates
                    # Only replace the hostname part, not if it appears in password or elsewhere
                    if f"@{hostname}:" in url or f"@{hostname}/" in url:
                        new_url = url.replace(f"@{hostname}:", f"@{railway_pghost}:", 1).replace(f"@{hostname}/", f"@{railway_pghost}/", 1)
                        logger.info(f"Converted Railway public URL to internal (fallback): {hostname} -> {railway_pghost}")
                        return new_url
        
        # Don't convert if we can't reliably determine the internal hostname
        # Let the user configure the correct URL
        return url
    
    @classmethod
    def get_org_db_base_url(cls) -> Optional[str]:
        """
        Get base database URL for organization databases.
        
        If ORG_DB_BASE_URL is not set, derives it from DATABASE_URL by removing the database name.
        On Railway, tries to use internal URLs for better connectivity.
        """
        base_url = getattr(settings, 'ORG_DB_BASE_URL', None)
        if base_url:
            base_url = str(base_url)
            # First, clean up any malformed URLs
            if "@" in base_url and base_url.count("@") > 1:
                # Check for nested URL patterns and clean them
                at_positions = [i for i, char in enumerate(base_url) if char == '@']
                for at_pos in reversed(at_positions):
                    after_at = base_url[at_pos + 1:]
                    if after_at.startswith("postgresql://") or after_at.startswith("postgres://"):
                        if after_at.startswith("postgresql://"):
                            base_url = "postgresql+asyncpg://" + after_at[len("postgresql://"):]
                        else:
                            base_url = "postgresql+asyncpg://" + after_at[len("postgres://"):]
                        logger.warning(f"Cleaned malformed ORG_DB_BASE_URL: {cls.mask_connection_string(base_url)}")
                        break
            # Try to convert to internal URL if on Railway
            base_url = cls._convert_railway_url_to_internal(base_url)
            return base_url
        
        # Fallback: derive from DATABASE_URL
        # Extract base URL (without database name) from DATABASE_URL
        db_url = str(settings.DATABASE_URL)
        
        # First, clean up any malformed URLs in DATABASE_URL
        if "@" in db_url and db_url.count("@") > 1:
            # Check for nested URL patterns and clean them
            at_positions = [i for i, char in enumerate(db_url) if char == '@']
            for at_pos in reversed(at_positions):
                after_at = db_url[at_pos + 1:]
                if after_at.startswith("postgresql://") or after_at.startswith("postgres://"):
                    if after_at.startswith("postgresql://"):
                        db_url = "postgresql+asyncpg://" + after_at[len("postgresql://"):]
                    else:
                        db_url = "postgresql+asyncpg://" + after_at[len("postgres://"):]
                    logger.warning(f"Cleaned malformed DATABASE_URL: {cls.mask_connection_string(db_url)}")
                    break
        
        # Remove the database name from the URL
        # Format: postgresql+asyncpg://user:pass@host:port/dbname?params
        if "/" in db_url:
            # Find query string and fragment positions
            query_idx = db_url.find("?")
            fragment_idx = db_url.find("#")
            
            # Find the last slash before query/fragment (this is before the database name)
            if query_idx > 0 or fragment_idx > 0:
                # Find the minimum valid index (first occurrence of ? or #)
                valid_indices = [idx for idx in [query_idx, fragment_idx] if idx > 0]
                if valid_indices:
                    end_idx = min(valid_indices)
                    last_slash_idx = db_url.rfind("/", 0, end_idx)
                else:
                    last_slash_idx = db_url.rfind("/")
            else:
                last_slash_idx = db_url.rfind("/")
            
            if last_slash_idx > 0:
                # Extract base URL without database name
                base_without_db = db_url[:last_slash_idx]
                # Preserve query string and fragment if they exist
                query_part = ""
                if query_idx > 0:
                    query_part = db_url[query_idx:]
                elif fragment_idx > 0:
                    query_part = db_url[fragment_idx:]
                
                base_url = base_without_db + query_part
                
                # Try to convert to internal URL if on Railway
                base_url = cls._convert_railway_url_to_internal(base_url)
                
                logger.info("Derived ORG_DB_BASE_URL from DATABASE_URL")
                return base_url
        
        # If we can't parse it, return None
        logger.warning("Could not derive ORG_DB_BASE_URL from DATABASE_URL")
        return None
    
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
            Connection string or None if base URL cannot be determined
        """
        base_url = cls.get_org_db_base_url()
        if not base_url:
            return None
        
        db_name = cls.get_organization_db_name(organization_slug)
        
        # Parse base URL and add database name
        # Format: postgresql+asyncpg://user:pass@host:port/dbname?params
        # The base_url should already be without database name (from get_org_db_base_url)
        
        # Check if base_url already ends with a database name (shouldn't happen, but handle it)
        if "/" in base_url:
            # Check if there's a query string or fragment
            query_idx = base_url.find("?")
            fragment_idx = base_url.find("#")
            
            # Find the last slash before query/fragment
            valid_indices = [idx for idx in [query_idx, fragment_idx] if idx > 0]
            if valid_indices:
                end_idx = min(valid_indices)
                last_slash_idx = base_url.rfind("/", 0, end_idx)
            else:
                last_slash_idx = base_url.rfind("/")
            
            if last_slash_idx > 0:
                # Extract the part before the last slash (base without db)
                base_without_db = base_url[:last_slash_idx]
                # Extract query string and fragment if they exist
                query_part = ""
                if query_idx > 0:
                    query_part = base_url[query_idx:]
                elif fragment_idx > 0:
                    query_part = base_url[fragment_idx:]
                return f"{base_without_db}/{db_name}{query_part}"
        
        # If no slash found, just append the database name
        return f"{base_url}/{db_name}"
    
    @classmethod
    def _normalize_port(cls, port_value) -> int:
        """
        Safely normalize a port value to an integer.
        
        Args:
            port_value: Port value (int, str, None, or empty string)
        
        Returns:
            Integer port (defaults to 5432 if invalid)
        """
        # Handle None
        if port_value is None:
            return 5432
        
        # Handle empty string explicitly
        if isinstance(port_value, str):
            port_str = port_value.strip()
            if not port_str:  # Empty string after strip
                return 5432
            
            # Handle malformed port strings like "25091:5432" - take the first part
            if ':' in port_str:
                port_str = port_str.split(':')[0].strip()
                logger.warning(f"Detected malformed port value '{port_value}', using first part: '{port_str}'")
            
            try:
                port_int = int(port_str)
                if 1 <= port_int <= 65535:
                    return port_int
                return 5432
            except (ValueError, TypeError) as e:
                logger.warning(f"Failed to convert port string '{port_value}' to int: {e}")
                return 5432
        
        # Handle integer
        if isinstance(port_value, int):
            if 1 <= port_value <= 65535:
                return port_value
            return 5432
        
        # Try to convert other types
        try:
            # Convert to string first, then to int (handles edge cases)
            port_str = str(port_value).strip()
            if not port_str:
                return 5432
            
            # Handle malformed port strings like "25091:5432" - take the first part
            if ':' in port_str:
                port_str = port_str.split(':')[0].strip()
                logger.warning(f"Detected malformed port value '{port_value}', using first part: '{port_str}'")
            
            port_int = int(port_str)
            if 1 <= port_int <= 65535:
                return port_int
            return 5432
        except (ValueError, TypeError) as e:
            logger.warning(f"Failed to convert port value '{port_value}' (type: {type(port_value)}) to int: {e}")
            return 5432
    
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
            # Log the original connection string (masked) for debugging (only at debug level to avoid spam)
            # Removed verbose logging to reduce log spam
            
            # CRITICAL: Clean up nested/malformed URLs FIRST before any other processing
            # Pattern: postgresql+asyncpg://user:pass@postgresql://user:pass@host:port/db
            # This happens when URLs are incorrectly concatenated
            
            original_string = connection_string
            
            # Step 1: Detect and extract the actual URL from nested patterns
            # Look for pattern where we have multiple @ symbols and scheme indicators
            if "@" in connection_string and connection_string.count("@") > 1:
                # Find all positions of @
                at_positions = [i for i, char in enumerate(connection_string) if char == '@']
                
                # Check each @ position to see if it's followed by a scheme
                for at_pos in reversed(at_positions):
                    after_at = connection_string[at_pos + 1:]
                    # Check if this @ is followed by a PostgreSQL scheme
                    if after_at.startswith("postgresql://") or after_at.startswith("postgres://"):
                        # This is a nested URL - extract from here
                        if after_at.startswith("postgresql://"):
                            # Extract everything after "postgresql://"
                            actual_url = "postgresql+asyncpg://" + after_at[len("postgresql://"):]
                        else:
                            # Extract everything after "postgres://"
                            actual_url = "postgresql+asyncpg://" + after_at[len("postgres://"):]
                        
                        # Clean up: remove any remaining nested patterns
                        # Check if the extracted URL still has nested patterns
                        if "@" in actual_url and actual_url.count("@") > 1:
                            # Recursively clean
                            at_positions_clean = [i for i, char in enumerate(actual_url) if char == '@']
                            for at_pos_clean in reversed(at_positions_clean):
                                after_at_clean = actual_url[at_pos_clean + 1:]
                                if after_at_clean.startswith("postgresql://") or after_at_clean.startswith("postgres://"):
                                    if after_at_clean.startswith("postgresql://"):
                                        actual_url = "postgresql+asyncpg://" + after_at_clean[len("postgresql://"):]
                                    else:
                                        actual_url = "postgresql+asyncpg://" + after_at_clean[len("postgres://"):]
                                    break
                        
                        connection_string = actual_url
                        logger.info(f"Detected and cleaned nested URL pattern. Original: {cls.mask_connection_string(original_string)}, Cleaned: {cls.mask_connection_string(connection_string)}")
                        break
            
            # Step 2: Check for multiple occurrences of postgresql+asyncpg://
            if "postgresql+asyncpg://" in connection_string:
                count_asyncpg = connection_string.count("postgresql+asyncpg://")
                if count_asyncpg > 1:
                    # Find the last occurrence (should be the actual URL)
                    last_idx = connection_string.rfind("postgresql+asyncpg://")
                    if last_idx >= 0:
                        connection_string = connection_string[last_idx:]
                        logger.info(f"Detected multiple asyncpg URLs, using last: {cls.mask_connection_string(connection_string)}")
            
            # Step 3: Check for nested postgresql:// inside postgresql+asyncpg://
            if connection_string.startswith("postgresql+asyncpg://") and ("@postgresql://" in connection_string or "@postgres://" in connection_string):
                # Find the last @postgresql:// or @postgres://
                last_postgres_idx = max(
                    connection_string.rfind("@postgresql://"),
                    connection_string.rfind("@postgres://")
                )
                if last_postgres_idx > 0:
                    # Extract from postgresql:// or postgres:// onwards
                    if "@postgresql://" in connection_string[last_postgres_idx:]:
                        actual_url_start = connection_string.find("postgresql://", last_postgres_idx)
                        if actual_url_start > 0:
                            connection_string = "postgresql+asyncpg://" + connection_string[actual_url_start + len("postgresql://"):]
                    elif "@postgres://" in connection_string[last_postgres_idx:]:
                        actual_url_start = connection_string.find("postgres://", last_postgres_idx)
                        if actual_url_start > 0:
                            connection_string = "postgresql+asyncpg://" + connection_string[actual_url_start + len("postgres://"):]
                    logger.info(f"Detected nested URL inside asyncpg, extracted: {cls.mask_connection_string(connection_string)}")
            
            # Step 4: Check for multiple postgresql:// (without asyncpg)
            if "postgresql://" in connection_string and connection_string.count("postgresql://") > 1:
                last_idx = connection_string.rfind("postgresql://")
                if last_idx > 0:
                    connection_string = connection_string[last_idx:]
                    # Convert to asyncpg format
                    if not connection_string.startswith("postgresql+asyncpg://"):
                        connection_string = connection_string.replace("postgresql://", "postgresql+asyncpg://", 1)
                    logger.info(f"Detected multiple postgresql URLs, using last: {cls.mask_connection_string(connection_string)}")
            
            # Handle both postgresql:// and postgresql+asyncpg://
            clean_url = connection_string.replace('postgresql+asyncpg://', 'postgresql://')
            
            # Fix malformed URLs: if there's a colon after host but no port (e.g., host:/db)
            # This can happen when user pastes URL with trailing colon
            if '@' in clean_url:
                parts = clean_url.split('@', 1)
                if len(parts) == 2:
                    before_at = parts[0]
                    after_at = parts[1]
                    # Check for pattern like host:/db or host:/
                    if ':' in after_at and '/' in after_at:
                        host_port_db = after_at.split('/', 1)
                        host_port = host_port_db[0]
                        db_part = host_port_db[1] if len(host_port_db) > 1 else ''
                        
                        # Clean up database path: remove duplicate port patterns (e.g., /railway:5432/db -> /db)
                        # Pattern: /something:port/dbname should become /dbname
                        if db_part and ':' in db_part and '/' in db_part:
                            # Split by / to get parts
                            db_parts = db_part.split('/')
                            # Find the last part that doesn't contain : (should be the actual database name)
                            actual_db = None
                            for part in reversed(db_parts):
                                if ':' not in part and part.strip():
                                    actual_db = part
                                    break
                            if actual_db:
                                db_part = actual_db
                                logger.info(f"Cleaned duplicate port pattern in database path, using: {db_part}")
                        
                        if ':' in host_port:
                            # Split by : and take the last part as port (in case there are multiple colons)
                            # But first, check if there are multiple colons which might indicate a malformed port
                            host_port_parts = host_port.rsplit(':', 1)
                            if len(host_port_parts) == 2:
                                host = host_port_parts[0]
                                port_str = host_port_parts[1]
                                # Clean up port string in case it contains multiple colons (e.g., "25091:5432")
                                if ':' in port_str:
                                    port_str = port_str.split(':')[0]
                                    logger.warning(f"Detected malformed port in host_port '{host_port}', using first part: '{port_str}'")
                            else:
                                host = host_port
                                port_str = ''
                            
                            # If port is empty, add default port
                            if not port_str or port_str == '':
                                after_at = f'{host}:5432/{db_part}' if db_part else f'{host}:5432'
                                clean_url = f'{before_at}@{after_at}'
                            else:
                                # Port is present, just clean the db_part
                                after_at = f'{host}:{port_str}/{db_part}' if db_part else f'{host}:{port_str}'
                                clean_url = f'{before_at}@{after_at}'
            
            parsed = urlparse(clean_url)
            
            # Log parsed components for debugging (removed verbose logging to reduce log spam)
            
            # Additional check: if netloc contains a colon but port is None or empty,
            # manually extract and validate the port
            port = None
            if parsed.port is not None:
                port = cls._normalize_port(parsed.port)
            elif parsed.netloc and ':' in parsed.netloc:
                # Extract port from netloc manually
                # Handle case where netloc might be user:pass@host:port
                if '@' in parsed.netloc:
                    # Format: user:pass@host:port
                    after_at = parsed.netloc.split('@', 1)[1]
                    if ':' in after_at:
                        # Extract port (last part after :)
                        port_str = after_at.rsplit(':', 1)[1]
                        # Clean up port string in case it contains multiple colons (e.g., "25091:5432")
                        if ':' in port_str:
                            port_str = port_str.split(':')[0]
                        port = cls._normalize_port(port_str)
                    else:
                        port = 5432
                else:
                    # Format: host:port
                    netloc_parts = parsed.netloc.rsplit(':', 1)
                    if len(netloc_parts) == 2:
                        port_str = netloc_parts[1]
                        # Clean up port string in case it contains multiple colons (e.g., "25091:5432")
                        if ':' in port_str:
                            port_str = port_str.split(':')[0]
                        port = cls._normalize_port(port_str)
                    else:
                        port = 5432
            else:
                port = 5432
            
            # Final safety check - ensure port is always an integer
            port = cls._normalize_port(port)
            
            # Extract hostname - handle cases where netloc might not be properly parsed
            hostname = parsed.hostname or ''
            
            # If hostname is empty but netloc exists, try to extract it manually
            if not hostname and parsed.netloc:
                # Try to extract hostname from netloc
                if '@' in parsed.netloc:
                    # Format: user:pass@host:port
                    after_at = parsed.netloc.split('@', 1)[1]
                    if ':' in after_at:
                        hostname = after_at.split(':')[0]
                    else:
                        hostname = after_at
                elif ':' in parsed.netloc:
                    # Format: host:port
                    hostname = parsed.netloc.split(':')[0]
                else:
                    hostname = parsed.netloc
            
            # Clean up database name from path
            # Handle cases where path might contain duplicate patterns like /railway:5432/dbname
            database_name = parsed.path.lstrip('/') if parsed.path else ''
            if database_name:
                # Remove any duplicate port patterns in database name
                # Pattern: something:port/dbname -> dbname
                if ':' in database_name and '/' in database_name:
                    # Split by / and find the last part without :
                    db_parts = database_name.split('/')
                    for part in reversed(db_parts):
                        if ':' not in part and part.strip():
                            database_name = part
                            break
                # Also handle cases where database name might have :port at the end
                if ':' in database_name:
                    database_name = database_name.split(':')[0]
            
            result = {
                'scheme': parsed.scheme,
                'user': parsed.username or '',
                'password': parsed.password or '',
                'host': hostname,
                'port': port,
                'database': database_name,
                'full': connection_string
            }
            
            # Validate required fields
            if not result['host']:
                raise ValueError(
                    f"Host is required in connection string. "
                    f"URL reçue: {cls.mask_connection_string(connection_string)}. "
                    f"Vérifiez que l'URL est au format: postgresql://user:password@host:port/database"
                )
            
            # Check if hostname is the same as scheme (common parsing error)
            if result['host'].lower() == parsed.scheme.lower() or result['host'].lower() in ['postgresql', 'postgres']:
                logger.error(f"Invalid hostname detected: '{result['host']}' from URL: {cls.mask_connection_string(connection_string)}")
                raise ValueError(
                    f"Format d'URL invalide: le nom d'hôte '{result['host']}' semble incorrect. "
                    f"L'URL reçue semble malformée.\n\n"
                    f"Vérifiez que votre URL de connexion est au format complet:\n"
                    f"postgresql://user:password@host:port/database\n\n"
                    f"Exemple Railway:\n"
                    f"postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway\n\n"
                    f"Assurez-vous que l'URL contient bien:\n"
                    f"- Le schéma (postgresql:// ou postgresql+asyncpg://)\n"
                    f"- Le nom d'utilisateur et le mot de passe\n"
                    f"- Le nom d'hôte (pas 'postgresql')\n"
                    f"- Le port (généralement 5432)\n"
                    f"- Le nom de la base de données"
                )
            
            if not result['database']:
                raise ValueError("Database name is required in connection string")
            
            return result
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Failed to parse connection string: {e}", exc_info=True)
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
        
        # First, clean up any malformed/nested URLs before normalization
        # This prevents issues with duplicated URLs
        original = db_connection_string
        if "@" in db_connection_string and db_connection_string.count("@") > 1:
            # Check for nested URL patterns
            at_positions = [i for i, char in enumerate(db_connection_string) if char == '@']
            for at_pos in reversed(at_positions):
                after_at = db_connection_string[at_pos + 1:]
                if after_at.startswith("postgresql://") or after_at.startswith("postgres://"):
                    # Extract the clean URL
                    if after_at.startswith("postgresql://"):
                        db_connection_string = "postgresql+asyncpg://" + after_at[len("postgresql://"):]
                    else:
                        db_connection_string = "postgresql+asyncpg://" + after_at[len("postgres://"):]
                    logger.warning(f"Cleaned malformed URL in normalize_connection_string. Original: {cls.mask_connection_string(original)}, Cleaned: {cls.mask_connection_string(db_connection_string)}")
                    break
        
        # Remove any existing driver specification
        normalized = db_connection_string.strip()
        
        # Handle different PostgreSQL URL formats
        if normalized.startswith('postgresql+asyncpg://'):
            # Already correct format, but validate and fix port if needed
            pass
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
        
        # Validate and fix malformed URLs (e.g., host: without port)
        # Parse to check for issues and ensure port is always present
        try:
            # Use parse_db_connection_string to validate and fix the URL
            parsed = cls.parse_db_connection_string(normalized)
            # Reconstruct URL with guaranteed valid port
            port = parsed['port']
            if not isinstance(port, int) or port < 1 or port > 65535:
                port = 5432
            
            # Reconstruct the URL with the validated port
            user_pass = ''
            if parsed['user']:
                if parsed['password']:
                    user_pass = f"{parsed['user']}:{parsed['password']}@"
                else:
                    user_pass = f"{parsed['user']}@"
            
            db_part = f"/{parsed['database']}" if parsed['database'] else ''
            normalized = f"postgresql+asyncpg://{user_pass}{parsed['host']}:{port}{db_part}"
        except Exception as e:
            # If parsing fails, try manual fix for common patterns
            logger.warning(f"Failed to parse URL in normalize_connection_string: {e}, attempting manual fix")
            # Try to fix common malformed patterns manually
            if '@' in normalized:
                parts = normalized.split('@', 1)
                if len(parts) == 2:
                    before_at = parts[0]
                    after_at = parts[1]
                    # Check for host:/db pattern
                    if ':' in after_at:
                        host_port_db = after_at.split('/', 1)
                        host_port = host_port_db[0]
                        db_part = '/' + host_port_db[1] if len(host_port_db) > 1 and host_port_db[1] else ''
                        if ':' in host_port:
                            host, port_str = host_port.split(':', 1)
                            if not port_str or port_str == '' or port_str.startswith('/'):
                                # Port is empty, add default
                                normalized = f'{before_at}@{host}:5432{db_part}'
                        else:
                            # No port at all, add default
                            normalized = f'{before_at}@{host_port}:5432{db_part}'
                    elif '/' in after_at:
                        # No port specified, add default
                        host_part = after_at.split('/')[0]
                        db_part = '/' + after_at.split('/', 1)[1] if '/' in after_at else ''
                        normalized = f'{before_at}@{host_part}:5432{db_part}'
        
        return normalized
    
    @classmethod
    async def test_connection(cls, db_connection_string: str, timeout: int = 180) -> tuple[bool, str, Optional[str]]:
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
        original_url = db_connection_string
        db_connection_string = cls.normalize_connection_string(db_connection_string)
        
        # Log for debugging
        logger.debug(f"Original URL: {cls.mask_connection_string(original_url)}")
        logger.debug(f"Normalized URL: {cls.mask_connection_string(db_connection_string)}")
        
        # Validate format after normalization
        if not db_connection_string.startswith('postgresql+asyncpg://'):
            return False, (
                f"Format de chaîne de connexion invalide. Doit être une chaîne de connexion PostgreSQL valide.\n"
                f"URL reçue: {cls.mask_connection_string(original_url)}\n"
                f"URL normalisée: {cls.mask_connection_string(db_connection_string)}"
            ), None
        
        # Parse to validate and ensure port is valid
        try:
            parsed = cls.parse_db_connection_string(db_connection_string)
            logger.debug(f"Parsed connection - host: {parsed.get('host')}, port: {parsed.get('port')}, database: {parsed.get('database')}")
            # Reconstruct URL with guaranteed valid port to avoid asyncpg parsing issues
            port = parsed['port']
            if not isinstance(port, int) or port < 1 or port > 65535:
                port = 5432
            
            user_pass = ''
            if parsed['user']:
                if parsed['password']:
                    user_pass = f"{parsed['user']}:{parsed['password']}@"
                else:
                    user_pass = f"{parsed['user']}@"
            
            db_part = f"/{parsed['database']}" if parsed['database'] else ''
            # Reconstruct URL with validated components to ensure asyncpg can parse it
            db_connection_string = f"postgresql+asyncpg://{user_pass}{parsed['host']}:{port}{db_part}"
        except ValueError as e:
            return False, f"Format de chaîne de connexion invalide: {str(e)}", None
        except Exception as e:
            logger.error(f"Error parsing connection string in test_connection: {e}", exc_info=True)
            return False, f"Erreur lors de l'analyse de la chaîne de connexion: {str(e)}", None
        
        try:
            # Log the connection string (masked) for debugging
            logger.debug(f"Testing connection with URL: {cls.mask_connection_string(db_connection_string)}")
            
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
                host = parsed.get('host', 'unknown') if 'parsed' in locals() else 'unknown'
                port = parsed.get('port', 'unknown') if 'parsed' in locals() else 'unknown'
                is_railway_public = '.railway.app' in host.lower() or '.rlwy.net' in host.lower() or '.up.railway.app' in host.lower()
                
                if is_railway_public:
                    return False, (
                        f"Timeout: La connexion à la base de données Railway a pris trop de temps (plus de 3 minutes).\n\n"
                        f"Host: {host}, Port: {port}\n\n"
                        f"🔧 Guide de Configuration Railway :\n\n"
                        f"1. Obtenez la bonne URL de connexion :\n"
                        f"   - Allez dans votre service PostgreSQL sur Railway\n"
                        f"   - Ouvrez l'onglet 'Variables' ou 'Connect'\n"
                        f"   - Copiez la variable DATABASE_URL ou PGDATABASE_URL\n\n"
                        f"2. Choisissez le bon type d'URL :\n"
                        f"   ✅ Si backend et DB sont dans le MÊME projet Railway :\n"
                        f"      → Utilisez l'URL avec .railway.internal (ex: postgres.railway.internal)\n"
                        f"   ✅ Si backend et DB sont dans des projets DIFFÉRENTS :\n"
                        f"      → Utilisez l'URL publique avec .railway.app ou .up.railway.app\n"
                        f"      → Activez 'Public Networking' dans Settings de votre service PostgreSQL\n\n"
                        f"3. Vérifications :\n"
                        f"   - Le port {port} est correct (généralement 5432)\n"
                        f"   - Le nom d'utilisateur et le mot de passe sont corrects\n"
                        f"   - La base de données existe (créez-la d'abord si nécessaire)\n"
                        f"   - 'Public Networking' est activé si vous utilisez l'URL publique"
                    ), None
                else:
                    return False, (
                        f"Timeout: La connexion à la base de données a pris trop de temps.\n\n"
                        f"Host: {host}, Port: {port}\n\n"
                        f"Vérifiez que:\n"
                        f"- La base de données est démarrée et accessible\n"
                        f"- Le port {port} est correct et ouvert\n"
                        f"- Le serveur backend peut accéder au réseau pour se connecter à {host}\n"
                        f"- Il n'y a pas de firewall bloquant la connexion"
                    ), None
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
            
            # Check for DNS resolution errors
            if "name or service not known" in error_msg.lower() or "[errno -2]" in error_msg.lower() or "name resolution" in error_msg.lower():
                host = parsed.get('host', 'unknown') if 'parsed' in locals() else 'unknown'
                is_railway_internal = '.railway.internal' in host.lower()
                
                if is_railway_internal:
                    return False, (
                        f"Résolution DNS échouée: Impossible de résoudre le nom d'hôte '{host}'. "
                        f"\n\nLes URLs Railway internes (.railway.internal) ne fonctionnent QUE si votre backend et votre base de données "
                        f"sont dans le MÊME projet Railway.\n\n"
                        f"SOLUTION : Utilisez l'URL PUBLIQUE de votre base de données Railway.\n"
                        f"1. Allez dans votre service PostgreSQL sur Railway\n"
                        f"2. Ouvrez l'onglet 'Variables' ou 'Connect'\n"
                        f"3. Copiez l'URL publique (elle contient '.railway.app' ou '.up.railway.app' au lieu de '.railway.internal')\n"
                        f"4. Utilisez cette URL publique dans le formulaire\n\n"
                        f"Si vous devez absolument utiliser l'URL interne, assurez-vous que votre backend est dans le même projet Railway que la base de données."
                    ), None
                else:
                    return False, (
                        f"Résolution DNS échouée: Impossible de résoudre le nom d'hôte '{host}'. "
                        f"Vérifiez que le nom d'hôte est correct et que le serveur backend peut accéder à Internet "
                        f"pour résoudre les noms DNS."
                    ), None
            
            # Check for timeout specifically
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                host = parsed.get('host', 'unknown') if 'parsed' in locals() else 'unknown'
                port = parsed.get('port', 'unknown') if 'parsed' in locals() else 'unknown'
                is_railway = 'railway' in host.lower()
                
                if is_railway:
                    return False, (
                        f"Timeout: La connexion à la base de données Railway a pris trop de temps.\n\n"
                        f"Host: {host}, Port: {port}\n\n"
                        f"🔧 Solutions :\n\n"
                        f"1. Vérifiez que vous utilisez la bonne URL :\n"
                        f"   - Même projet Railway → URL avec .railway.internal\n"
                        f"   - Projets différents → URL publique avec .railway.app + 'Public Networking' activé\n\n"
                        f"2. Obtenez l'URL correcte depuis Railway :\n"
                        f"   - Service PostgreSQL → Variables → DATABASE_URL ou PGDATABASE_URL\n\n"
                        f"3. Vérifiez que la base de données existe (créez-la d'abord si nécessaire)\n\n"
                        f"4. Vérifiez que 'Public Networking' est activé si vous utilisez l'URL publique"
                    ), None
                else:
                    return False, (
                        f"Timeout: La connexion a pris trop de temps.\n\n"
                        f"Host: {host}, Port: {port}\n\n"
                        f"Vérifiez que :\n"
                        f"- La base de données est démarrée et accessible\n"
                        f"- Le port {port} est correct et ouvert\n"
                        f"- Le serveur backend peut accéder au réseau pour se connecter à {host}\n"
                        f"- Il n'y a pas de firewall bloquant la connexion\n"
                        f"- L'URL de connexion est correcte et complète"
                    ), None
            
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
        
        # Normalize and clean the connection string before using it
        db_connection_string = cls.normalize_connection_string(db_connection_string)
        
        parsed = cls.parse_db_connection_string(db_connection_string)
        db_name = parsed['database']
        
        # Get admin connection (connect to 'postgres' database)
        # Ensure port is always an integer (parsed['port'] should already be int from parse_db_connection_string)
        port = cls._normalize_port(parsed['port'])
        admin_url = f"postgresql+asyncpg://{parsed['user']}:{parsed['password']}@{parsed['host']}:{port}/postgres"
        
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
    def _ensure_alembic_version_table(cls, db_url: str) -> None:
        """
        Ensure the alembic_version table exists in the database.
        This must be called before any Alembic command that reads the version table.
        
        Args:
            db_url: Database connection URL
        """
        init_engine = create_engine(db_url, poolclass=pool.NullPool)
        try:
            with init_engine.connect() as init_conn:
                # Check if table exists
                check_result = init_conn.execute(text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'alembic_version'
                    )
                """))
                table_exists = check_result.scalar()
                
                if not table_exists:
                    logger.info("Creating alembic_version table...")
                    # Create the alembic_version table
                    init_conn.execute(text("""
                        CREATE TABLE alembic_version (
                            version_num VARCHAR(32) NOT NULL,
                            CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
                        )
                    """))
                    init_conn.commit()
                    logger.info("✓ alembic_version table created successfully")
                else:
                    logger.debug("✓ alembic_version table already exists")
        finally:
            init_engine.dispose()
    
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
            import contextlib  # Import at function level for use in error handlers
            
            # Normalize connection string
            db_connection_string = cls.normalize_connection_string(db_connection_string)
            
            # Convert asyncpg to psycopg2 for Alembic (Alembic doesn't support asyncpg)
            # This matches what env.py does
            alembic_db_url = db_connection_string
            if "postgresql+asyncpg://" in alembic_db_url:
                alembic_db_url = alembic_db_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
            elif "postgresql://" in alembic_db_url and "+" not in alembic_db_url:
                alembic_db_url = alembic_db_url.replace("postgresql://", "postgresql+psycopg2://")
            
            # Create alembic config - use absolute path to alembic.ini
            import os
            from pathlib import Path
            
            # Find alembic.ini - it should be in the backend directory
            # Get the directory where this file is located (app/core/)
            current_file = Path(__file__)
            # Go up to backend directory: app/core/ -> app/ -> backend/
            backend_dir = current_file.parent.parent.parent
            alembic_ini_path = backend_dir / "alembic.ini"
            
            if not alembic_ini_path.exists():
                # Fallback: try relative to current working directory
                alembic_ini_path = Path("alembic.ini")
                if not alembic_ini_path.exists():
                    # Try backend/alembic.ini
                    alembic_ini_path = Path("backend/alembic.ini")
                    if not alembic_ini_path.exists():
                        # Try from current working directory
                        import os
                        cwd = Path(os.getcwd())
                        alembic_ini_path = cwd / "alembic.ini"
                        if not alembic_ini_path.exists():
                            alembic_ini_path = cwd / "backend" / "alembic.ini"
            
            if not alembic_ini_path.exists():
                error_msg = f"Cannot find alembic.ini. Tried: {backend_dir / 'alembic.ini'}, {Path('alembic.ini')}, {Path('backend/alembic.ini')}, {Path(os.getcwd()) / 'alembic.ini'}"
                logger.error(error_msg)
                raise ValueError(f"Cannot find alembic.ini configuration file. {error_msg}")
            
            logger.info(f"Using Alembic config from: {alembic_ini_path.absolute()}")
            alembic_cfg = Config(str(alembic_ini_path))
            alembic_cfg.set_main_option("sqlalchemy.url", alembic_db_url)
            
            # Log the connection string (masked) for debugging
            logger.info(f"Migration target database URL: {cls.mask_connection_string(alembic_db_url)}")
            
            # Verify connection before running migrations
            try:
                test_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                with test_engine.connect() as test_conn:
                    # Test connection and get database name
                    result = test_conn.execute(text("SELECT current_database()"))
                    actual_db_name = result.scalar()
                    logger.info(f"Connected to database: {actual_db_name}")
                    
                    # Verify it matches expected database name
                    parsed_conn = cls.parse_db_connection_string(db_connection_string)
                    expected_db_name = parsed_conn.get('database')
                    if actual_db_name != expected_db_name:
                        logger.warning(
                            f"Database name mismatch: expected '{expected_db_name}', "
                            f"but connected to '{actual_db_name}'. Proceeding anyway..."
                        )
                test_engine.dispose()
            except Exception as conn_test_error:
                logger.error(f"Failed to connect to database before migration: {conn_test_error}", exc_info=True)
                raise ValueError(
                    f"Impossible de se connecter à la base de données avant d'exécuter les migrations: {str(conn_test_error)}. "
                    f"Vérifiez que la chaîne de connexion est correcte."
                ) from conn_test_error
            
            # For organization databases, we need to apply only the organization-specific migrations
            # These migrations start with add_donor_tables_001 and end with add_donor_crm_002
            # We'll try to upgrade to the specific revision for organization databases
            target_revision = "add_donor_crm_002"  # Latest organization database migration
            base_revision = "add_donor_tables_001"  # Base revision for organization databases
            
            # Check current revision before migration and verify migrations exist
            try:
                from alembic.script import ScriptDirectory
                script = ScriptDirectory.from_config(alembic_cfg)
                
                # Log script location for debugging
                logger.info(f"Alembic script directory location: {script.dir}")
                logger.info(f"Alembic script directory exists: {Path(script.dir).exists()}")
                
                # Check if our specific migrations exist
                try:
                    base_rev_obj = script.get_revision(base_revision)
                    logger.info(f"✓ Found base revision {base_revision}: {base_rev_obj}")
                except Exception as e:
                    logger.error(f"✗ Could not find base revision {base_revision}: {e}")
                
                try:
                    target_rev_obj = script.get_revision(target_revision)
                    logger.info(f"✓ Found target revision {target_revision}: {target_rev_obj}")
                except Exception as e:
                    logger.error(f"✗ Could not find target revision {target_revision}: {e}")
                
                heads = script.get_revisions("heads")
                logger.info(f"Available migration heads: {[str(h) for h in heads]}")
                
                # List all available revisions
                all_revisions = list(script.walk_revisions())
                logger.info(f"All available revisions: {[str(r) for r in all_revisions]}")
                
                # List all revisions for debugging
                all_revs = list(script.walk_revisions())
                rev_names = [str(r.revision) for r in all_revs]
                logger.info(f"All available revisions ({len(rev_names)}): {rev_names}")
                
                # Check if our target revision exists
                try:
                    target_rev = script.get_revision(target_revision)
                    logger.info(f"✓ Target revision {target_revision} found: {target_rev}")
                    logger.info(f"  - Revision ID: {target_rev.revision}")
                    logger.info(f"  - Down revision: {target_rev.down_revision}")
                    logger.info(f"  - Branch labels: {target_rev.branch_labels}")
                except Exception as rev_error:
                    logger.error(f"✗ Target revision {target_revision} not found: {rev_error}")
                    logger.error(f"Available revisions: {rev_names}")
                    
                    # Check if base revision exists
                    try:
                        base_rev = script.get_revision(base_revision)
                        logger.info(f"Base revision {base_revision} found: {base_rev}")
                    except Exception as base_rev_error:
                        logger.error(f"Base revision {base_revision} also not found: {base_rev_error}")
                        raise ValueError(
                            f"Les migrations pour les bases de données d'organisations ne sont pas trouvées. "
                            f"Vérifiez que les fichiers backend/alembic/versions/add_donor_tables.py et "
                            f"backend/alembic/versions/add_donor_crm_tables.py existent. "
                            f"Révisions disponibles: {', '.join(rev_names[:10])}"
                        ) from base_rev_error
                    
                    raise ValueError(
                        f"La révision cible {target_revision} n'a pas été trouvée. "
                        f"Révisions disponibles: {', '.join(rev_names[:10])}"
                    ) from rev_error
                
                # Also verify base revision exists
                try:
                    base_rev = script.get_revision(base_revision)
                    logger.info(f"✓ Base revision {base_revision} found: {base_rev}")
                    logger.info(f"  - Revision ID: {base_rev.revision}")
                    logger.info(f"  - Down revision: {base_rev.down_revision}")
                    logger.info(f"  - Branch labels: {base_rev.branch_labels}")
                except Exception as base_rev_error:
                    logger.error(f"✗ Base revision {base_revision} not found: {base_rev_error}")
                    raise ValueError(
                        f"La révision de base {base_revision} n'a pas été trouvée. "
                        f"Révisions disponibles: {', '.join(rev_names[:10])}"
                    ) from base_rev_error
            except ValueError:
                # Re-raise ValueError as-is (it's our custom error)
                raise
            except Exception as script_error:
                logger.error(f"Could not check migration script directory: {script_error}", exc_info=True)
                raise ValueError(
                    f"Erreur lors de la vérification des migrations: {str(script_error)}. "
                    f"Vérifiez que le répertoire backend/alembic/versions/ existe et contient les migrations."
                ) from script_error
            
            logger.info(f"Running migrations for organization database, target revision: {target_revision}")
            logger.info(f"Connection string (masked): {cls.mask_connection_string(db_connection_string)}")
            
            # Check current revision in the database and determine migration strategy
            is_empty_db = False
            current_rev_in_db = None
            
            try:
                # Create a sync engine to check current revision
                sync_db_url = alembic_db_url
                check_engine = create_engine(sync_db_url, poolclass=pool.NullPool)
                
                with check_engine.connect() as conn:
                    # Check if alembic_version table exists
                    result = conn.execute(text("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = 'alembic_version'
                        )
                    """))
                    has_alembic_table = result.scalar()
                    
                    if has_alembic_table:
                        # Get current revision
                        result = conn.execute(text("SELECT version_num FROM alembic_version"))
                        current_rev_in_db = result.scalar_one_or_none()
                        logger.info(f"Current revision in database: {current_rev_in_db}")
                        
                        # If database has a revision from main database migrations, we need to stamp it
                        # Organization databases should start from None or add_donor_tables_001
                        if current_rev_in_db and current_rev_in_db not in [None, base_revision, target_revision]:
                            # Check if it's a main database revision (numeric or different format)
                            # Main DB revisions are typically numeric like '032', '033', etc.
                            if current_rev_in_db.isdigit() or current_rev_in_db not in ['add_donor_tables_001', 'add_donor_crm_002']:
                                logger.warning(
                                    f"Database has revision '{current_rev_in_db}' which appears to be from main database. "
                                    f"Stamping to base organization revision '{base_revision}'..."
                                )
                                # Stamp to base revision
                                command.stamp(alembic_cfg, base_revision)
                                logger.info(f"Database stamped to {base_revision}")
                                current_rev_in_db = base_revision
                    else:
                        # No alembic_version table, database is empty
                        is_empty_db = True
                        logger.info("Database is empty (no alembic_version table). Will start from base revision.")
                
                check_engine.dispose()
            except Exception as check_error:
                logger.warning(f"Could not check current revision: {check_error}. Assuming empty database and proceeding...")
                is_empty_db = True
            
            # Run migrations based on database state
            try:
                if is_empty_db or current_rev_in_db is None:
                    # Empty database - start from base_revision
                    logger.info("=" * 80)
                    logger.info("STARTING MIGRATION FROM EMPTY DATABASE")
                    logger.info(f"Database state: is_empty_db={is_empty_db}, current_rev_in_db={current_rev_in_db}")
                    logger.info(f"Alembic config script_location: {alembic_cfg.get_main_option('script_location')}")
                    logger.info(f"Target database URL: {cls.mask_connection_string(alembic_db_url)}")
                    logger.info("=" * 80)
                    
                    # Verify migrations exist before attempting upgrade
                    from alembic.script import ScriptDirectory
                    script = ScriptDirectory.from_config(alembic_cfg)
                    base_rev_obj = script.get_revision(base_revision)
                    target_rev_obj = script.get_revision(target_revision)
                    logger.info(f"Base revision object: {base_rev_obj}")
                    logger.info(f"Target revision object: {target_rev_obj}")
                    
                    # CRITICAL: For empty databases, ensure alembic_version table exists
                    # If it's empty, we need to handle it properly for Alembic
                    logger.info("Preparing database for migration...")
                    
                    # First, check what tables exist in the database
                    check_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                    current_rev = None
                    try:
                        with check_engine.connect() as check_conn:
                            # Check if alembic_version table exists
                            result = check_conn.execute(text("""
                                SELECT table_name FROM information_schema.tables 
                                WHERE table_schema = 'public' AND table_name = 'alembic_version'
                            """))
                            has_alembic_table = result.fetchone() is not None
                            
                            if has_alembic_table:
                                result = check_conn.execute(text("SELECT version_num FROM alembic_version"))
                                current_rev = result.scalar_one_or_none()
                                logger.info(f"Current revision in database: {current_rev}")
                                
                                if current_rev is None:
                                    # Table exists but is empty - drop it
                                    logger.info("alembic_version table is empty. Dropping it...")
                                    check_conn.execute(text("DROP TABLE alembic_version"))
                                    check_conn.commit()
                                    logger.info("✓ Dropped empty alembic_version table")
                                    current_rev = None
                            else:
                                logger.info("alembic_version table does not exist")
                                current_rev = None
                            
                            # Check what other tables exist (besides alembic_version)
                            result = check_conn.execute(text("""
                                SELECT table_name FROM information_schema.tables 
                                WHERE table_schema = 'public' AND table_name != 'alembic_version'
                                ORDER BY table_name
                            """))
                            other_tables = [row[0] for row in result]
                            logger.info(f"Other tables in database (excluding alembic_version): {other_tables}")
                            
                            # If there are other tables but alembic_version is None, this is suspicious
                            # Alembic might think the database is already migrated based on table existence
                            if other_tables and current_rev is None:
                                logger.warning(f"⚠️  Database has tables {other_tables} but alembic_version is None!")
                                logger.warning("This might confuse Alembic. We'll force stamp to 'base' to reset state.")
                    finally:
                        check_engine.dispose()
                    
                    # CRITICAL FIX: For empty databases, Alembic may do a stamp_revision instead of upgrade
                    # when there are multiple migration heads. The issue is that Alembic detects multiple heads
                    # and tries to resolve them by stamping instead of upgrading.
                    # Solution: Execute migrations directly by importing their modules and calling upgrade()
                    # functions with a properly configured Alembic context
                    logger.info(f"Executing migrations directly to bypass Alembic's stamp_revision detection...")
                    try:
                        from alembic.script import ScriptDirectory
                        from alembic import context as alembic_context
                        import sys
                        import io
                        
                        old_stdout = sys.stdout
                        old_stderr = sys.stderr
                        stdout_capture = io.StringIO()
                        stderr_capture = io.StringIO()
                        
                        try:
                            sys.stdout = stdout_capture
                            sys.stderr = stderr_capture
                            
                            # Create engine and connection
                            migration_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                            
                            # Get script directory
                            script = ScriptDirectory.from_config(alembic_cfg)
                            
                            # Get the migration revision objects
                            base_rev_obj = script.get_revision(base_revision)
                            target_rev_obj = script.get_revision(target_revision)
                            
                            # Check current revision and prepare database
                            with migration_engine.connect() as migration_conn:
                                # Ensure alembic_version table exists
                                migration_conn.execute(text("""
                                    CREATE TABLE IF NOT EXISTS alembic_version (
                                        version_num VARCHAR(32) NOT NULL,
                                        CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
                                    )
                                """))
                                migration_conn.commit()
                                
                                # Check current revision
                                result = migration_conn.execute(text("SELECT version_num FROM alembic_version"))
                                current_rev = result.scalar_one_or_none()
                                logger.info(f"Current revision in database: {current_rev}")
                                
                                # If database is empty, drop alembic_version table to force real upgrade
                                if current_rev is None:
                                    logger.info(f"Database is empty, dropping alembic_version table to force real upgrade...")
                                    migration_conn.execute(text("DROP TABLE IF EXISTS alembic_version"))
                                    migration_conn.commit()
                                    logger.info(f"✓ Dropped alembic_version table")
                            
                            # Execute migrations directly using Alembic's runtime API
                            # This bypasses command.upgrade() which does stamp_revision with multiple heads
                            if current_rev is None:
                                logger.info(f"Executing migrations directly using Alembic runtime API...")
                                
                                # Ensure alembic_version table exists
                                cls._ensure_alembic_version_table(alembic_db_url)
                                
                                # Import Alembic runtime modules
                                from alembic.runtime.migration import MigrationContext
                                from alembic.script import ScriptDirectory
                                from alembic.operations import Operations
                                
                                # Create engine and connection
                                manual_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                                with manual_engine.begin() as connection:
                                    # Get script directory
                                    script_dir = ScriptDirectory.from_config(alembic_cfg)
                                    
                                    # Get migration modules
                                    base_rev_obj = script_dir.get_revision(base_revision)
                                    target_rev_obj = script_dir.get_revision(target_revision)
                                    
                                    logger.info(f"Step 1: Executing migration {base_revision} directly...")
                                    
                                    # Create migration context
                                    migration_context = MigrationContext.configure(connection)
                                    
                                    # Create Operations object with the migration context
                                    # This allows us to use op operations
                                    ops = Operations(migration_context)
                                    
                                    # Patch op in the migration module to use our Operations object
                                    # Use the module directly instead of sys.modules
                                    migration_module = base_rev_obj.module
                                    original_op_in_module = getattr(migration_module, 'op', None)
                                    setattr(migration_module, 'op', ops)
                                    
                                    try:
                                        # Execute base migration upgrade function directly
                                        base_rev_obj.module.upgrade()
                                        
                                        # Update alembic_version table manually
                                        # Delete any existing row and insert the new revision
                                        connection.execute(text("DELETE FROM alembic_version"))
                                        connection.execute(text(
                                            f"INSERT INTO alembic_version (version_num) VALUES ('{base_revision}')"
                                        ))
                                        logger.info(f"✓ Step 1 completed: executed {base_revision}")
                                    finally:
                                        # Restore original op
                                        if original_op_in_module is not None:
                                            setattr(migration_module, 'op', original_op_in_module)
                                        else:
                                            if hasattr(migration_module, 'op'):
                                                delattr(migration_module, 'op')
                                    
                                    # Step 2: Execute target migration
                                    logger.info(f"Step 2: Executing migration {target_revision} directly...")
                                    
                                    # Reconfigure context for target migration
                                    migration_context = MigrationContext.configure(connection)
                                    ops = Operations(migration_context)
                                    
                                    # Patch op in the target migration module
                                    target_migration_module = target_rev_obj.module
                                    original_op_in_target = getattr(target_migration_module, 'op', None)
                                    setattr(target_migration_module, 'op', ops)
                                    
                                    try:
                                        # Execute target migration upgrade function directly
                                        target_rev_obj.module.upgrade()
                                        
                                        # Update alembic_version table manually
                                        # Delete any existing row and insert the new revision
                                        connection.execute(text("DELETE FROM alembic_version"))
                                        connection.execute(text(
                                            f"INSERT INTO alembic_version (version_num) VALUES ('{target_revision}')"
                                        ))
                                        logger.info(f"✓ Step 2 completed: executed {target_revision}")
                                    finally:
                                        # Restore original op
                                        if original_op_in_target is not None:
                                            setattr(target_migration_module, 'op', original_op_in_target)
                                        else:
                                            if hasattr(target_migration_module, 'op'):
                                                delattr(target_migration_module, 'op')
                                
                                manual_engine.dispose()
                            else:
                                # Database has a revision, upgrade normally using command.upgrade()
                                logger.info(f"Database has revision {current_rev}, upgrading to {target_revision}...")
                                command.upgrade(alembic_cfg, target_revision)
                            
                            migration_engine.dispose()
                            
                            # Get the output
                            stdout_output = stdout_capture.getvalue()
                            stderr_output = stderr_capture.getvalue()
                            
                            # Log the output
                            if stdout_output:
                                logger.info(f"Alembic stdout: {stdout_output}")
                            if stderr_output:
                                logger.info(f"Alembic stderr: {stderr_output}")
                        finally:
                            sys.stdout = old_stdout
                            sys.stderr = old_stderr
                        
                        # Immediately verify the revision was applied and check tables
                        verify_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                        applied_rev = None
                        tables_after_base = []
                        needs_retry = False
                        
                        with verify_engine.connect() as verify_conn:
                            result = verify_conn.execute(text("SELECT version_num FROM alembic_version"))
                            applied_rev = result.scalar_one_or_none()
                            logger.info(f"✓ Verified: alembic_version table exists with revision: {applied_rev}")
                            
                            # Check what tables exist after migration
                            result = verify_conn.execute(text("""
                                SELECT table_name FROM information_schema.tables 
                                WHERE table_schema = 'public' 
                                ORDER BY table_name
                            """))
                            tables_after_migration = [row[0] for row in result]
                            logger.info(f"✓ Tables after migration: {tables_after_migration}")
                            
                            # CRITICAL: Check if Alembic did a stamp instead of upgrade
                            # If revision is set but no tables were created, Alembic did a stamp_revision
                            if applied_rev == target_revision and 'donors' not in tables_after_migration:
                                logger.error(f"✗ CRITICAL: Alembic did a stamp_revision instead of upgrade!")
                                logger.error(f"  Revision is {applied_rev} but donors table doesn't exist.")
                                logger.error(f"  This means Alembic marked the revision without executing migrations.")
                                logger.error(f"  Forcing a real upgrade by dropping alembic_version and retrying...")
                                
                                # Drop alembic_version table to force Alembic to start from scratch
                                verify_conn.execute(text("DROP TABLE alembic_version"))
                                verify_conn.commit()
                                logger.info("✓ Dropped alembic_version table to force real upgrade")
                                needs_retry = True
                        verify_engine.dispose()
                        
                        # If we detected a stamp instead of upgrade, retry with a clean slate
                        if needs_retry:
                            logger.info("Retrying upgrade after detecting stamp_revision issue...")
                            # Wait a moment for the table drop to be committed
                            import time
                            time.sleep(0.5)
                            
                            # Retry the upgrade - this time use 'base' explicitly to force upgrade from scratch
                            stdout_capture_retry = io.StringIO()
                            stderr_capture_retry = io.StringIO()
                            try:
                                sys.stdout = stdout_capture_retry
                                sys.stderr = stderr_capture_retry
                                logger.info(f"Retrying command.upgrade(alembic_cfg, 'base', '{target_revision}')...")
                                # Try upgrading from 'base' explicitly
                                # First stamp to base, then upgrade
                                command.stamp(alembic_cfg, 'base')
                                logger.info("✓ Stamped database to 'base'")
                                command.upgrade(alembic_cfg, target_revision)
                                logger.info(f"Retry upgrade completed")
                                
                                stdout_output_retry = stdout_capture_retry.getvalue()
                                stderr_output_retry = stderr_capture_retry.getvalue()
                                
                                if stdout_output_retry:
                                    logger.info(f"Alembic stdout (retry): {stdout_output_retry}")
                                if stderr_output_retry:
                                    logger.info(f"Alembic stderr (retry): {stderr_output_retry}")
                            finally:
                                sys.stdout = old_stdout
                                sys.stderr = old_stderr
                            
                            # Verify again after retry
                            verify_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                            with verify_engine.connect() as verify_conn:
                                result = verify_conn.execute(text("SELECT version_num FROM alembic_version"))
                                applied_rev_retry = result.scalar_one_or_none()
                                logger.info(f"✓ Verified after retry: revision = {applied_rev_retry}")
                                
                                result = verify_conn.execute(text("""
                                    SELECT table_name FROM information_schema.tables 
                                    WHERE table_schema = 'public' 
                                    ORDER BY table_name
                                """))
                                tables_after_retry = [row[0] for row in result]
                                logger.info(f"✓ Tables after retry: {tables_after_retry}")
                                
                                if 'donors' not in tables_after_retry:
                                    raise ValueError(
                                        f"Les migrations n'ont pas été exécutées même après retry. "
                                        f"Tables trouvées: {tables_after_retry}. "
                                        f"Vérifiez les logs Alembic ci-dessus pour voir pourquoi les migrations ne s'exécutent pas."
                                    )
                                
                                # Update applied_rev and tables_after_migration after retry
                                applied_rev = applied_rev_retry
                                tables_after_migration = tables_after_retry
                            verify_engine.dispose()
                        
                        if applied_rev != target_revision:
                            logger.warning(f"⚠️  Expected revision {target_revision} but got {applied_rev}")
                        if 'donors' not in tables_after_migration:
                            logger.error(f"✗ donors table was not created after migration!")
                        
                        logger.info(f"✓ Successfully upgraded to {target_revision}")
                    except Exception as base_upgrade_err:
                        error_msg = str(base_upgrade_err)
                        error_type = type(base_upgrade_err).__name__
                        
                        # Check if the error is about alembic_version table not existing
                        # This shouldn't happen now since we create it before, but handle it just in case
                        if "alembic_version" in error_msg.lower() and ("does not exist" in error_msg.lower() or "relation" in error_msg.lower()):
                            logger.warning(f"alembic_version table does not exist (unexpected). Creating it first...")
                            try:
                                # Ensure table exists
                                cls._ensure_alembic_version_table(alembic_db_url)
                                
                                # Now stamp the database with the base revision
                                logger.info(f"Stamping database with base revision {base_revision}...")
                                command.stamp(alembic_cfg, base_revision)
                                logger.info(f"✓ Database stamped with {base_revision}")
                                
                                # Now retry the upgrade
                                logger.info("Retrying upgrade after initializing alembic_version table...")
                                import contextlib
                                with contextlib.redirect_stdout(None), contextlib.redirect_stderr(None):
                                    command.upgrade(alembic_cfg, base_revision)
                                logger.info(f"✓ Successfully applied base revision {base_revision} after retry")
                                
                                # Verify the revision was applied
                                verify_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                                with verify_engine.connect() as verify_conn:
                                    result = verify_conn.execute(text("SELECT version_num FROM alembic_version"))
                                    applied_rev = result.scalar_one_or_none()
                                    logger.info(f"✓ Verified: alembic_version table exists with revision: {applied_rev}")
                                verify_engine.dispose()
                                
                            except Exception as init_err:
                                logger.error(f"✗ Failed to initialize alembic_version table: {init_err}", exc_info=True)
                                raise ValueError(
                                    f"Échec de l'initialisation de la table alembic_version: {str(init_err)}. "
                                    f"Vérifiez les logs du backend pour plus de détails."
                                ) from init_err
                        else:
                            # Different error, raise it as before
                            logger.error(f"✗ Failed to apply base revision {base_revision}", exc_info=True)
                            logger.error(f"Error type: {error_type}")
                            logger.error(f"Error message: {error_msg}")
                            raise ValueError(
                                f"Échec de l'application de la migration de base {base_revision}: {error_msg}. "
                                f"Vérifiez les logs du backend pour plus de détails."
                            ) from base_upgrade_err
                elif current_rev_in_db == target_revision:
                    logger.info(f"Database already at target revision {target_revision}, skipping migration")
                elif current_rev_in_db == base_revision:
                    # Database is at base revision, upgrade to target
                    logger.info(f"Database at base revision {base_revision}, upgrading to {target_revision}...")
                    logger.info(f"Calling command.upgrade(alembic_cfg, '{target_revision}')")
                    try:
                        command.upgrade(alembic_cfg, target_revision)
                        logger.info(f"Successfully upgraded to {target_revision}")
                    except Exception as target_upgrade_err:
                        logger.error(f"Failed to upgrade to target revision {target_revision}: {target_upgrade_err}", exc_info=True)
                        raise ValueError(
                            f"Échec de la mise à jour vers la révision cible {target_revision}: {str(target_upgrade_err)}. "
                            f"Vérifiez les logs du backend pour plus de détails."
                        ) from target_upgrade_err
                else:
                    # Database has a different revision, try to upgrade to target
                    logger.info(f"Database has revision {current_rev_in_db}, attempting to upgrade to {target_revision}...")
                    logger.info(f"Calling command.upgrade(alembic_cfg, '{target_revision}')")
                    try:
                        command.upgrade(alembic_cfg, target_revision)
                        logger.info(f"Successfully upgraded to {target_revision}")
                    except Exception as target_upgrade_err:
                        logger.error(f"Failed to upgrade to target revision {target_revision}: {target_upgrade_err}", exc_info=True)
                        raise ValueError(
                            f"Échec de la mise à jour vers la révision cible {target_revision}: {str(target_upgrade_err)}. "
                            f"Vérifiez les logs du backend pour plus de détails."
                        ) from target_upgrade_err
                    
            except Exception as revision_error:
                error_msg = str(revision_error)
                logger.error(f"Failed to upgrade migrations: {error_msg}", exc_info=True)
                
                # Check if the error is about alembic_version table not existing
                if "alembic_version" in error_msg.lower() and ("does not exist" in error_msg.lower() or "relation" in error_msg.lower()):
                    logger.warning(f"alembic_version table does not exist. Creating it first...")
                    try:
                        # Create alembic_version table manually if it doesn't exist
                        # Ensure alembic_version table exists
                        cls._ensure_alembic_version_table(alembic_db_url)
                        
                        # Now stamp the database with the base revision
                        logger.info(f"Stamping database with base revision {base_revision}...")
                        command.stamp(alembic_cfg, base_revision)
                        logger.info(f"✓ Database stamped with {base_revision}")
                        
                        # Now retry the upgrade from base
                        logger.info("Retrying upgrade after initializing alembic_version table...")
                        import contextlib
                        with contextlib.redirect_stdout(None), contextlib.redirect_stderr(None):
                            command.upgrade(alembic_cfg, base_revision)
                        logger.info(f"Successfully upgraded to {base_revision}, now upgrading to {target_revision}...")
                        # Then upgrade to the latest
                        command.upgrade(alembic_cfg, target_revision)
                        logger.info(f"Successfully upgraded to {target_revision}")
                    except Exception as init_err:
                        logger.error(f"Failed to initialize alembic_version table: {init_err}", exc_info=True)
                        raise ValueError(
                            f"Échec de l'initialisation de la table alembic_version: {str(init_err)}. "
                            f"Vérifiez les logs du backend pour plus de détails."
                        ) from init_err
                # Check if the revision doesn't exist or if we need to start from base
                elif "Can't locate revision identified by" in error_msg or "revision" in error_msg.lower() and "not found" in error_msg.lower():
                    logger.info("Target revision not found, trying to upgrade from base (add_donor_tables_001)...")
                    try:
                        # Try upgrading from the base organization migration first
                        # This will create alembic_version table if it doesn't exist
                        command.upgrade(alembic_cfg, base_revision)
                        logger.info(f"Successfully upgraded to {base_revision}, now upgrading to {target_revision}...")
                        # Then upgrade to the latest
                        command.upgrade(alembic_cfg, target_revision)
                        logger.info(f"Successfully upgraded to {target_revision}")
                    except Exception as base_error:
                        error_msg_base = str(base_error)
                        logger.error(f"Failed to upgrade from base: {error_msg_base}", exc_info=True)
                        
                        # Check if the error is about alembic_version table not existing
                        if "alembic_version" in error_msg_base.lower() and ("does not exist" in error_msg_base.lower() or "relation" in error_msg_base.lower()):
                            logger.warning(f"alembic_version table does not exist in base_error handler. Creating it first...")
                            try:
                                # Ensure alembic_version table exists
                                cls._ensure_alembic_version_table(alembic_db_url)
                                
                                # Now stamp the database with the base revision
                                logger.info(f"Stamping database with base revision {base_revision}...")
                                command.stamp(alembic_cfg, base_revision)
                                logger.info(f"✓ Database stamped with {base_revision}")
                                
                                # Now retry the upgrade
                                logger.info("Retrying upgrade after initializing alembic_version table...")
                                import contextlib
                                with contextlib.redirect_stdout(None), contextlib.redirect_stderr(None):
                                    command.upgrade(alembic_cfg, base_revision)
                                logger.info(f"Successfully upgraded to {base_revision}, now upgrading to {target_revision}...")
                                # Then upgrade to the latest
                                command.upgrade(alembic_cfg, target_revision)
                                logger.info(f"Successfully upgraded to {target_revision}")
                            except Exception as init_err:
                                logger.error(f"Failed to initialize alembic_version table: {init_err}", exc_info=True)
                                raise ValueError(
                                    f"Échec de l'initialisation de la table alembic_version: {str(init_err)}. "
                                    f"Vérifiez les logs du backend pour plus de détails."
                                ) from init_err
                        # If base revision also fails, try upgrading step by step
                        elif "Can't locate revision" in error_msg_base:
                            logger.error(
                                f"Migration {base_revision} not found! "
                                f"Please verify that the migration file exists in backend/alembic/versions/"
                            )
                            raise ValueError(
                                f"Les migrations pour les bases de données d'organisations ne sont pas trouvées. "
                                f"Vérifiez que le fichier backend/alembic/versions/add_donor_tables.py existe. "
                                f"Erreur: {error_msg_base}"
                            ) from base_error
                        
                        # Try with 'head' as fallback
                        logger.warning("Trying 'head' as fallback...")
                        try:
                            command.upgrade(alembic_cfg, "head")
                            logger.info("Successfully upgraded using 'head'")
                        except Exception as head_error:
                            error_msg_head = str(head_error)
                            # Check if error is about multiple heads
                            if "Multiple head revisions" in error_msg_head or "overlaps" in error_msg_head.lower():
                                logger.warning("Multiple migration heads detected. Using 'heads' to upgrade all heads...")
                                # Use 'heads' to upgrade all heads
                                try:
                                    command.upgrade(alembic_cfg, "heads")
                                    logger.info("Successfully upgraded using 'heads'")
                                except Exception as heads_error:
                                    error_msg_heads = str(heads_error)
                                    logger.error(f"Failed to upgrade even with 'heads': {error_msg_heads}", exc_info=True)
                                    raise ValueError(
                                        f"Failed to run migrations: {error_msg_heads}. "
                                        f"Please check that the organization database migrations (add_donor_tables_001, add_donor_crm_002) exist."
                                    ) from heads_error
                            else:
                                logger.error(f"Migration error: {error_msg_head}", exc_info=True)
                                raise ValueError(f"Failed to run migrations: {error_msg_head}") from head_error
                elif "Multiple head revisions" in error_msg or "overlaps" in error_msg.lower():
                    logger.warning("Multiple migration heads detected. Using 'heads' to upgrade all heads...")
                    # Use 'heads' to upgrade all heads
                    try:
                        command.upgrade(alembic_cfg, "heads")
                        logger.info("Successfully upgraded using 'heads'")
                    except Exception as heads_error:
                        error_msg_heads = str(heads_error)
                        logger.error(f"Failed to upgrade even with 'heads': {error_msg_heads}", exc_info=True)
                        raise ValueError(
                            f"Multiple head revisions detected and could not be resolved automatically. "
                            f"Please run 'alembic merge heads' manually to create a merge migration, "
                            f"or specify a specific target revision. Error: {error_msg_heads}"
                        ) from heads_error
                else:
                    # Different error - could be SQL error, connection error, etc.
                    logger.error(f"Migration error: {error_msg}", exc_info=True)
                    
                    # Check for SQL errors that might indicate migration issues
                    if "relation" in error_msg.lower() and "does not exist" in error_msg.lower():
                        # Check if it's specifically the alembic_version table
                        if "alembic_version" in error_msg.lower():
                            logger.warning(f"alembic_version table does not exist. Creating it first...")
                            try:
                                # Create alembic_version table manually if it doesn't exist
                                # Ensure alembic_version table exists
                                cls._ensure_alembic_version_table(alembic_db_url)
                                
                                # Now stamp the database with the base revision
                                logger.info(f"Stamping database with base revision {base_revision}...")
                                command.stamp(alembic_cfg, base_revision)
                                logger.info(f"✓ Database stamped with {base_revision}")
                                
                                # Now retry the upgrade
                                logger.info("Retrying upgrade after initializing alembic_version table...")
                                import contextlib
                                with contextlib.redirect_stdout(None), contextlib.redirect_stderr(None):
                                    command.upgrade(alembic_cfg, base_revision)
                                logger.info(f"✓ Successfully applied base revision {base_revision}")
                                
                                # Then upgrade to target
                                command.upgrade(alembic_cfg, target_revision)
                                logger.info(f"✓ Successfully upgraded to {target_revision}")
                                
                            except Exception as init_err:
                                logger.error(f"Failed to initialize alembic_version table: {init_err}", exc_info=True)
                                raise ValueError(
                                    f"Échec de l'initialisation de la table alembic_version: {str(init_err)}. "
                                    f"Vérifiez les logs du backend pour plus de détails."
                                ) from init_err
                        else:
                            raise ValueError(
                                f"Erreur SQL lors de la migration: {error_msg}. "
                                f"Cela peut indiquer que les migrations précédentes n'ont pas été appliquées correctement. "
                                f"Vérifiez les logs du backend pour plus de détails."
                            ) from revision_error
                    elif "syntax error" in error_msg.lower() or "invalid" in error_msg.lower():
                        raise ValueError(
                            f"Erreur de syntaxe SQL lors de la migration: {error_msg}. "
                            f"Vérifiez que les fichiers de migration sont correctement formatés. "
                            f"Vérifiez les logs du backend pour plus de détails."
                        ) from revision_error
                    else:
                        # Re-raise with more context
                        raise ValueError(
                            f"Erreur lors de l'exécution des migrations: {error_msg}. "
                            f"Vérifiez les logs du backend pour plus de détails."
                        ) from revision_error
            
            parsed = cls.parse_db_connection_string(db_connection_string)
            db_name = parsed['database']
            logger.info(f"Ran migrations on organization database: {db_name}")
            
            # Wait a moment for database to be ready
            import time
            time.sleep(2)
            
            # Verify that tables were created by checking if alembic_version was updated
            try:
                verify_engine = create_engine(alembic_db_url, poolclass=pool.NullPool)
                with verify_engine.connect() as conn:
                    # First, check if any tables exist at all
                    result = conn.execute(text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        ORDER BY table_name
                    """))
                    all_tables = [row[0] for row in result]
                    logger.info(f"All tables found in database: {all_tables}")
                    
                    # Check if alembic_version table exists
                    has_alembic_table = 'alembic_version' in all_tables
                    
                    if not has_alembic_table:
                        logger.error(f"alembic_version table does not exist in database {db_name} after migration!")
                        logger.error(f"This indicates that migrations were not executed successfully.")
                        logger.error(f"All tables in database: {all_tables}")
                        raise ValueError(
                            f"La table alembic_version n'existe pas dans la base de données '{db_name}' après la migration. "
                            f"Cela indique que les migrations n'ont pas été exécutées avec succès. "
                            f"Vérifiez les logs du backend pour voir les erreurs de migration. "
                            f"Tables trouvées dans la base de données: {all_tables if all_tables else 'aucune'}"
                        )
                    
                    # Now safely check alembic_version
                    result = conn.execute(text("SELECT version_num FROM alembic_version"))
                    final_rev = result.scalar_one_or_none()
                    logger.info(f"Final revision after migration: {final_rev}")
                    
                    # Filter out alembic_version
                    tables_after = [t for t in all_tables if t != 'alembic_version']
                    logger.info(f"Tables found after migration (excluding alembic_version): {tables_after}")
                    
                    # Expected tables from migrations
                    expected_tables = [
                        'donors', 'payment_methods', 'donations', 'donor_notes', 'donor_activities',
                        'donor_segments', 'donor_segment_assignments', 'donor_tags', 'donor_tag_assignments',
                        'donor_communications', 'campaigns', 'recurring_donations'
                    ]
                    
                    missing_tables = [t for t in expected_tables if t not in tables_after]
                    
                    if not tables_after:
                        logger.error(f"No tables found in database {db_name} after migration!")
                        logger.error(f"Final revision: {final_rev}, Expected: {target_revision}")
                        logger.error(f"All tables in database: {all_tables}")
                        logger.error(f"Expected tables: {expected_tables}")
                        raise ValueError(
                            f"Aucune table n'a été créée dans la base de données '{db_name}' après la migration. "
                            f"Révision finale: {final_rev}, Révision attendue: {target_revision}. "
                            f"Vérifiez que les migrations add_donor_tables_001 et add_donor_crm_002 existent et sont correctement configurées. "
                            f"Tables trouvées: {all_tables}"
                        )
                    elif missing_tables:
                        logger.warning(f"Some expected tables are missing: {missing_tables}")
                        logger.info(f"Successfully created {len(tables_after)}/{len(expected_tables)} expected tables in database {db_name}")
                    else:
                        logger.info(f"Successfully created all {len(tables_after)} expected tables in database {db_name}")
                
                verify_engine.dispose()
            except ValueError:
                # Re-raise ValueError as-is (it's our custom error)
                raise
            except Exception as verify_error:
                error_msg = str(verify_error)
                logger.error(f"Could not verify tables after migration: {verify_error}", exc_info=True)
                
                # Check if it's the alembic_version table error
                if "alembic_version" in error_msg.lower() and "does not exist" in error_msg.lower():
                    raise ValueError(
                        f"La table alembic_version n'existe pas dans la base de données '{db_name}' après la migration. "
                        f"Cela indique que les migrations n'ont pas été exécutées avec succès. "
                        f"Vérifiez les logs du backend pour voir les erreurs de migration. "
                        f"Erreur: {error_msg}"
                    ) from verify_error
                
                # Don't fail silently - re-raise to ensure we know about the problem
                raise ValueError(
                    f"Erreur lors de la vérification des tables après la migration: {error_msg}. "
                    f"Vérifiez les logs du backend pour plus de détails."
                ) from verify_error
            
        except OperationalError as e:
            logger.error(f"Database operational error running migrations: {e}", exc_info=True)
            raise ValueError(f"Failed to connect to database for migrations: {str(e)}") from e
        except ProgrammingError as e:
            logger.error(f"Database programming error running migrations: {e}", exc_info=True)
            raise ValueError(f"Migration SQL error: {str(e)}") from e
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Unexpected error running migrations: {error_msg}", exc_info=True)
            
            # Provide more helpful error messages
            if "Can't locate revision" in error_msg or "revision" in error_msg.lower() and "not found" in error_msg.lower():
                raise ValueError(
                    f"Les migrations pour les bases de données d'organisations ne sont pas trouvées. "
                    f"Vérifiez que les fichiers de migration add_donor_tables_001 et add_donor_crm_002 existent dans backend/alembic/versions/. "
                    f"Erreur: {error_msg}"
                ) from e
            elif "Multiple head revisions" in error_msg:
                # Last resort: try upgrading all heads
                try:
                    logger.warning("Multiple heads error caught, attempting to upgrade all heads as fallback...")
                    alembic_cfg.set_main_option("sqlalchemy.url", alembic_db_url)
                    command.upgrade(alembic_cfg, "heads")
                    parsed = cls.parse_db_connection_string(db_connection_string)
                    logger.info(f"Ran migrations on organization database (using heads): {parsed['database']}")
                except Exception as fallback_error:
                    logger.error(f"Failed to run migrations even with 'heads': {fallback_error}", exc_info=True)
                    raise ValueError(
                        f"Échec de la migration: Plusieurs révisions head détectées et impossible de les résoudre automatiquement. "
                        f"Vérifiez que les migrations d'organisations (add_donor_tables_001, add_donor_crm_002) sont correctement configurées. "
                        f"Erreur: {str(e)}"
                    ) from e
            else:
                logger.error(f"Unexpected error running migrations: {e}", exc_info=True)
                raise
    
    @classmethod
    async def list_database_tables(cls, db_connection_string: str) -> List[str]:
        """
        List all tables in the organization database.
        
        Args:
            db_connection_string: Connection string to the organization database
        
        Returns:
            List of table names
        """
        from typing import List
        
        try:
            # Normalize connection string
            db_connection_string = cls.normalize_connection_string(db_connection_string)
            
            # Create temporary engine
            test_engine = create_async_engine(
                db_connection_string,
                echo=False,
                pool_pre_ping=True,
            )
            
            tables: List[str] = []
            async with test_engine.connect() as conn:
                # Query PostgreSQL system catalog for tables
                result = await conn.execute(
                    text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_type = 'BASE TABLE'
                        ORDER BY table_name
                    """)
                )
                tables = [row[0] for row in result.fetchall()]
            
            await test_engine.dispose()
            
            parsed = cls.parse_db_connection_string(db_connection_string)
            logger.debug(f"Found {len(tables)} tables in database {parsed['database']}")
            
            return tables
            
        except OperationalError as e:
            logger.error(f"Database operational error listing tables: {e}", exc_info=True)
            raise ValueError(f"Failed to connect to database: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error listing tables: {e}", exc_info=True)
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
