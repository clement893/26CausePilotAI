"""
Platform Monitoring API Endpoints

Provides platform-wide statistics and monitoring data for SuperAdmins.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from uuid import UUID

from app.core.database import get_db
from app.dependencies import require_superadmin, get_current_user
from app.models import (
    User,
    Organization,
    OrganizationModule,
    OrganizationMember,
    Role,
    Permission,
    UserRole,
    Subscription,
    Invoice,
    AVAILABLE_MODULES,
)
from app.core.logging import logger
from pydantic import BaseModel

router = APIRouter()


class PlatformStatsResponse(BaseModel):
    """Platform-wide statistics"""
    organizations: Dict[str, int]
    users: Dict[str, int]
    modules: Dict[str, int]
    members: Dict[str, int]
    subscriptions: Dict[str, int]
    recent_activity: List[Dict]


class OrganizationStatsDetail(BaseModel):
    """Detailed statistics for an organization"""
    id: str
    name: str
    slug: str
    is_active: bool
    enabled_modules_count: int
    total_members: int
    created_at: datetime
    last_activity: Optional[datetime]


class ModuleUsageStats(BaseModel):
    """Module usage statistics"""
    module_key: str
    enabled_count: int
    total_organizations: int
    usage_percentage: float


@router.get("/stats", response_model=PlatformStatsResponse)
async def get_platform_stats(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Get platform-wide statistics (SuperAdmin only)
    
    Returns:
    - Total organizations (active/inactive)
    - Total users (active/inactive)
    - Module usage statistics
    - Member statistics
    - Subscription statistics
    - Recent activity
    """
    try:
        # Organizations stats
        org_total = await db.execute(select(func.count()).select_from(Organization))
        org_active = await db.execute(
            select(func.count()).select_from(Organization).where(Organization.is_active == True)
        )
        org_inactive = await db.execute(
            select(func.count()).select_from(Organization).where(Organization.is_active == False)
        )
        
        # Users stats
        user_total = await db.execute(select(func.count()).select_from(User))
        user_active = await db.execute(
            select(func.count()).select_from(User).where(User.is_active == True)
        )
        user_inactive = await db.execute(
            select(func.count()).select_from(User).where(User.is_active == False)
        )
        
        # Module stats
        module_enabled = await db.execute(
            select(func.count()).select_from(OrganizationModule).where(OrganizationModule.is_enabled == True)
        )
        module_total = await db.execute(select(func.count()).select_from(OrganizationModule))
        
        # Members stats
        member_total = await db.execute(select(func.count()).select_from(OrganizationMember))
        member_joined = await db.execute(
            select(func.count()).select_from(OrganizationMember).where(OrganizationMember.joined_at.isnot(None))
        )
        member_pending = await db.execute(
            select(func.count()).select_from(OrganizationMember).where(OrganizationMember.joined_at.is_(None))
        )
        
        # Subscriptions stats (if available)
        try:
            subscription_total = await db.execute(select(func.count()).select_from(Subscription))
            subscription_active = await db.execute(
                select(func.count()).select_from(Subscription).where(Subscription.status == 'active')
            )
        except Exception:
            subscription_total = None
            subscription_active = None
        
        # Recent organizations (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        org_recent = await db.execute(
            select(func.count()).select_from(Organization).where(Organization.created_at >= seven_days_ago)
        )
        
        # Recent users (last 7 days)
        user_recent = await db.execute(
            select(func.count()).select_from(User).where(User.created_at >= seven_days_ago)
        )
        
        return {
            "organizations": {
                "total": org_total.scalar() or 0,
                "active": org_active.scalar() or 0,
                "inactive": org_inactive.scalar() or 0,
                "new_last_7_days": org_recent.scalar() or 0,
            },
            "users": {
                "total": user_total.scalar() or 0,
                "active": user_active.scalar() or 0,
                "inactive": user_inactive.scalar() or 0,
                "new_last_7_days": user_recent.scalar() or 0,
            },
            "modules": {
                "total_enabled": module_enabled.scalar() or 0,
                "total_configured": module_total.scalar() or 0,
            },
            "members": {
                "total": member_total.scalar() or 0,
                "joined": member_joined.scalar() or 0,
                "pending": member_pending.scalar() or 0,
            },
            "subscriptions": {
                "total": subscription_total.scalar() if subscription_total else 0,
                "active": subscription_active.scalar() if subscription_active else 0,
            },
            "recent_activity": [],  # TODO: Implement activity tracking
        }
    except Exception as e:
        logger.error(f"Error getting platform stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve platform statistics"
        )


@router.get("/organizations/stats", response_model=List[OrganizationStatsDetail])
async def get_organizations_stats(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Get detailed statistics for all organizations (SuperAdmin only)
    """
    try:
        query = (
            select(Organization)
            .options(
                selectinload(Organization.modules),
                selectinload(Organization.members)
            )
            .offset(skip)
            .limit(limit)
            .order_by(Organization.created_at.desc())
        )
        result = await db.execute(query)
        organizations = result.scalars().all()
        
        stats = []
        for org in organizations:
            stats.append({
                "id": str(org.id),
                "name": org.name,
                "slug": org.slug,
                "is_active": org.is_active,
                "enabled_modules_count": org.enabled_modules_count,
                "total_members": org.total_members,
                "created_at": org.created_at,
                "last_activity": org.updated_at,  # Use updated_at as proxy for last activity
            })
        
        return stats
    except Exception as e:
        logger.error(f"Error getting organizations stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve organizations statistics"
        )


@router.get("/modules/usage", response_model=List[ModuleUsageStats])
async def get_module_usage_stats(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Get module usage statistics across all organizations (SuperAdmin only)
    """
    try:
        # Get total number of organizations
        org_total_result = await db.execute(select(func.count()).select_from(Organization))
        total_orgs = org_total_result.scalar() or 1  # Avoid division by zero
        
        # Get enabled count for each module
        module_stats = []
        for module_key in AVAILABLE_MODULES:
            enabled_result = await db.execute(
                select(func.count()).select_from(OrganizationModule).where(
                    and_(
                        OrganizationModule.module_key == module_key,
                        OrganizationModule.is_enabled == True
                    )
                )
            )
            enabled_count = enabled_result.scalar() or 0
            
            module_stats.append({
                "module_key": module_key,
                "enabled_count": enabled_count,
                "total_organizations": total_orgs,
                "usage_percentage": (enabled_count / total_orgs) * 100 if total_orgs > 0 else 0,
            })
        
        return module_stats
    except Exception as e:
        logger.error(f"Error getting module usage stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve module usage statistics"
        )


@router.get("/health")
async def get_platform_health(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Get platform health status (SuperAdmin only)
    
    Returns overall health metrics and status
    """
    try:
        # Check database connectivity
        db_healthy = True
        try:
            await db.execute(select(1))
        except Exception:
            db_healthy = False
        
        # Get basic counts
        org_count = await db.execute(select(func.count()).select_from(Organization))
        user_count = await db.execute(select(func.count()).select_from(User))
        
        return {
            "status": "healthy" if db_healthy else "degraded",
            "database": {
                "connected": db_healthy,
            },
            "counts": {
                "organizations": org_count.scalar() or 0,
                "users": user_count.scalar() or 0,
            },
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error getting platform health: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }
