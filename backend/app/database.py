"""Database configuration and session management."""

import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Import settings to get DATABASE_URL
from app.core.config import settings

# Get database URL from settings and ensure it uses asyncpg
DATABASE_URL = str(settings.DATABASE_URL).strip()

# Detect and fix nested URLs before processing
if DATABASE_URL.count("postgresql://") > 1 or DATABASE_URL.count("postgresql+asyncpg://") > 1:
    import re
    # Find all postgresql URLs and use the last (most complete) one
    urls = re.findall(r'postgresql(?:\+asyncpg)?://[^\s]+', DATABASE_URL)
    if urls:
        DATABASE_URL = urls[-1]
        # Ensure it uses asyncpg
        if DATABASE_URL.startswith("postgresql://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Ensure DATABASE_URL uses asyncpg driver for async operations
if DATABASE_URL.startswith("postgresql://") and "+" not in DATABASE_URL:
    # Plain postgresql:// URL, add asyncpg driver
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql+psycopg2://"):
    # Replace psycopg2 with asyncpg for async operations
    DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
elif not DATABASE_URL.startswith("postgresql+asyncpg://"):
    # If it doesn't start with postgresql+asyncpg://, ensure it does
    if DATABASE_URL.startswith("postgresql+"):
        # Replace any other driver with asyncpg
        parts = DATABASE_URL.split("://", 1)
        if len(parts) == 2:
            DATABASE_URL = f"postgresql+asyncpg://{parts[1]}"
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "False").lower() == "true",
    future=True,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=0,
)

# Create session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connection."""
    await engine.dispose()
