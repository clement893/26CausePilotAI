"""
Organization Database Dependency

FastAPI dependency for getting organization-specific database sessions.
"""

from typing import Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.organization_database_manager import OrganizationDatabaseManager
from app.models.organization import Organization
from app.dependencies import get_current_user
from app.models.user import User


async def get_organization_db(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AsyncSession:
    """
    Get database session for organization-specific database.
    
    This dependency:
    1. Gets organization_id from query param or user's active organization
    2. Verifies user has access to the organization
    3. Retrieves organization's database connection string
    4. Returns AsyncSession for organization database
    
    Args:
        organization_id: Optional organization ID from query param
        db: Main database session
        current_user: Current authenticated user
    
    Returns:
        AsyncSession for organization database
    
    Raises:
        HTTPException: If organization not found or user doesn't have access
    """
    from app.dependencies import is_superadmin
    
    # Check if user is superadmin
    is_super = await is_superadmin(current_user, db)
    
    
    # Get organization from main database
    query = select(Organization).where(Organization.id == organization_id)
    result = await db.execute(query)
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Check access (unless superadmin)
    if not is_super:
        from app.models.organization_member import OrganizationMember
        
        query = select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_email == current_user.email
        )
        result = await db.execute(query)
        membership = result.scalar_one_or_none()
        
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this organization"
            )
    
    # Check if organization has database connection
    if not organization.db_connection_string:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Organization database not configured"
        )
    
    # Get organization database session
    async for session in OrganizationDatabaseManager.get_organization_db_session(
        organization_id,
        organization.db_connection_string
    ):
        yield session
