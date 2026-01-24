"""
Organizations API Endpoints

CRUD operations for organizations (SuperAdmin only).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.dependencies import require_superadmin, get_current_user
from app.models import User, Organization, OrganizationModule, OrganizationMember, AVAILABLE_MODULES
from app.schemas.organization import (
    Organization as OrganizationSchema,
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationWithStats,
    OrganizationList,
    OrganizationModule as OrganizationModuleSchema,
    ToggleModuleRequest,
    OrganizationModuleList,
    OrganizationMember as OrganizationMemberSchema,
    InviteMemberRequest,
    OrganizationMemberList,
    ActiveOrganizationContext,
)

router = APIRouter()


# ============= Organizations CRUD =============

@router.get("/", response_model=OrganizationList)
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    List all organizations (SuperAdmin only)
    """
    # Get total count
    count_query = select(func.count()).select_from(Organization)
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Get organizations with stats
    query = select(Organization).offset(skip).limit(limit).order_by(Organization.created_at.desc())
    result = await db.execute(query)
    organizations = result.scalars().all()
    
    # Add stats
    orgs_with_stats = []
    for org in organizations:
        org_dict = {
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "is_active": org.is_active,
            "settings": org.settings or {},
            "created_at": org.created_at,
            "updated_at": org.updated_at,
            "enabled_modules_count": org.enabled_modules_count,
            "total_members": org.total_members,
        }
        orgs_with_stats.append(org_dict)
    
    return {"items": orgs_with_stats, "total": total}


@router.get("/{organization_id}", response_model=OrganizationSchema)
async def get_organization(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Get organization by ID (SuperAdmin only)
    """
    query = select(Organization).where(Organization.id == organization_id)
    result = await db.execute(query)
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return organization


@router.post("/", response_model=OrganizationSchema, status_code=status.HTTP_201_CREATED)
async def create_organization(
    organization_in: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Create new organization (SuperAdmin only)
    
    Creates organization with:
    - Unique slug
    - Separate database connection (to be configured)
    - All modules disabled by default
    """
    # Check if slug already exists
    query = select(Organization).where(Organization.slug == organization_in.slug)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organization with this slug already exists"
        )
    
    # Create organization
    # TODO: Generate actual database connection string
    db_connection = f"postgresql://user:pass@localhost:5432/{organization_in.slug}"
    
    organization = Organization(
        name=organization_in.name,
        slug=organization_in.slug,
        db_connection_string=db_connection,
        settings=organization_in.settings or {},
    )
    
    db.add(organization)
    await db.flush()
    
    # Create module entries (all disabled by default)
    for module_key in AVAILABLE_MODULES:
        module = OrganizationModule(
            organization_id=organization.id,
            module_key=module_key,
            is_enabled=False,
        )
        db.add(module)
    
    await db.commit()
    await db.refresh(organization)
    
    return organization


@router.patch("/{organization_id}", response_model=OrganizationSchema)
async def update_organization(
    organization_id: UUID,
    organization_in: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Update organization (SuperAdmin only)
    """
    query = select(Organization).where(Organization.id == organization_id)
    result = await db.execute(query)
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Update fields
    update_data = organization_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(organization, field, value)
    
    await db.commit()
    await db.refresh(organization)
    
    return organization


@router.delete("/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Delete organization (SuperAdmin only)
    
    WARNING: This will also delete all modules and members.
    """
    query = select(Organization).where(Organization.id == organization_id)
    result = await db.execute(query)
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    await db.delete(organization)
    await db.commit()
    
    return None


# ============= Organization Modules =============

@router.get("/{organization_id}/modules", response_model=OrganizationModuleList)
async def list_organization_modules(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    List all modules for an organization (SuperAdmin only)
    """
    # Check organization exists
    org_query = select(Organization).where(Organization.id == organization_id)
    org_result = await db.execute(org_query)
    organization = org_result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Get modules
    query = select(OrganizationModule).where(OrganizationModule.organization_id == organization_id)
    result = await db.execute(query)
    modules = result.scalars().all()
    
    return {"items": modules, "total": len(modules)}


@router.post("/{organization_id}/modules/toggle", response_model=OrganizationModuleSchema)
async def toggle_organization_module(
    organization_id: UUID,
    toggle_request: ToggleModuleRequest,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Toggle module enabled/disabled (SuperAdmin only)
    """
    # Check organization exists
    org_query = select(Organization).where(Organization.id == organization_id)
    org_result = await db.execute(org_query)
    organization = org_result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Get or create module
    query = select(OrganizationModule).where(
        OrganizationModule.organization_id == organization_id,
        OrganizationModule.module_key == toggle_request.module_key
    )
    result = await db.execute(query)
    module = result.scalar_one_or_none()
    
    if not module:
        # Create if doesn't exist
        module = OrganizationModule(
            organization_id=organization_id,
            module_key=toggle_request.module_key,
            is_enabled=toggle_request.is_enabled,
            settings=toggle_request.settings or {},
        )
        db.add(module)
    else:
        # Update existing
        module.is_enabled = toggle_request.is_enabled
        if toggle_request.settings:
            module.settings = toggle_request.settings
    
    await db.commit()
    await db.refresh(module)
    
    return module


# ============= Organization Members =============

@router.get("/{organization_id}/members", response_model=OrganizationMemberList)
async def list_organization_members(
    organization_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    List all members of an organization (SuperAdmin only)
    """
    # Check organization exists
    org_query = select(Organization).where(Organization.id == organization_id)
    org_result = await db.execute(org_query)
    organization = org_result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Get members
    query = select(OrganizationMember).where(OrganizationMember.organization_id == organization_id)
    result = await db.execute(query)
    members = result.scalars().all()
    
    return {"items": members, "total": len(members)}


@router.post("/{organization_id}/members", response_model=OrganizationMemberSchema, status_code=status.HTTP_201_CREATED)
async def invite_member_to_organization(
    organization_id: UUID,
    invite_request: InviteMemberRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_superadmin),
):
    """
    Invite member to organization (SuperAdmin only)
    """
    # Check organization exists
    org_query = select(Organization).where(Organization.id == organization_id)
    org_result = await db.execute(org_query)
    organization = org_result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Check if member already exists
    query = select(OrganizationMember).where(
        OrganizationMember.organization_id == organization_id,
        OrganizationMember.user_email == invite_request.email
    )
    result = await db.execute(query)
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Member already exists in this organization"
        )
    
    # Create member
    member = OrganizationMember(
        organization_id=organization_id,
        user_email=invite_request.email,
        role=invite_request.role,
        invited_by=current_user.id,
    )
    
    db.add(member)
    await db.commit()
    await db.refresh(member)
    
    # TODO: Send invitation email
    
    return member


@router.delete("/{organization_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member_from_organization(
    organization_id: UUID,
    member_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_superadmin),
):
    """
    Remove member from organization (SuperAdmin only)
    """
    query = select(OrganizationMember).where(
        OrganizationMember.id == member_id,
        OrganizationMember.organization_id == organization_id
    )
    result = await db.execute(query)
    member = result.scalar_one_or_none()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )
    
    await db.delete(member)
    await db.commit()
    
    return None


# ============= User Context =============

@router.get("/context/active", response_model=ActiveOrganizationContext)
async def get_active_organization_context(
    organization_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get active organization context for current user
    
    Returns the organization, enabled modules, and user's role.
    If no organization_id provided, returns first available organization.
    """
    # If superadmin, can access any organization
    from app.dependencies import is_superadmin
    is_super = await is_superadmin(current_user, db)
    
    if not is_super:
        # Regular user - find their organizations
        query = select(OrganizationMember).where(OrganizationMember.user_email == current_user.email)
        result = await db.execute(query)
        memberships = result.scalars().all()
        
        if not memberships:
            return {"organization": None, "enabled_modules": [], "user_role": None}
        
        # Use specified or first organization
        if organization_id:
            membership = next((m for m in memberships if m.organization_id == organization_id), None)
            if not membership:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this organization"
                )
        else:
            membership = memberships[0]
        
        org_query = select(Organization).where(Organization.id == membership.organization_id)
        org_result = await db.execute(org_query)
        organization = org_result.scalar_one_or_none()
        
        user_role = membership.role
    else:
        # SuperAdmin - get specified or any organization
        if organization_id:
            org_query = select(Organization).where(Organization.id == organization_id)
        else:
            org_query = select(Organization).limit(1)
        
        org_result = await db.execute(org_query)
        organization = org_result.scalar_one_or_none()
        user_role = "superadmin"
    
    if not organization:
        return {"organization": None, "enabled_modules": [], "user_role": None}
    
    # Get enabled modules
    modules_query = select(OrganizationModule).where(
        OrganizationModule.organization_id == organization.id,
        OrganizationModule.is_enabled == True
    )
    modules_result = await db.execute(modules_query)
    enabled_modules = [m.module_key for m in modules_result.scalars().all()]
    
    return {
        "organization": organization,
        "enabled_modules": enabled_modules,
        "user_role": user_role,
    }
