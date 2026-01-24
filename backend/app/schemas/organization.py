"""
Organization Schemas

Pydantic schemas for API requests/responses.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


# Module Key enum
class ModuleKey(str):
    """Available module keys"""
    BASE_DONATEUR = "base-donateur"
    FORMULAIRES = "formulaires"
    CAMPAGNES = "campagnes"
    P2P = "p2p"
    ANALYTICS = "analytics"
    ADMINISTRATION = "administration"


# Member Role enum
class MemberRole(str):
    """Available member roles"""
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


# ============= Organization Schemas =============

class OrganizationBase(BaseModel):
    """Base organization schema"""
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=255, pattern=r'^[a-z0-9-]+$')
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict)


class OrganizationCreate(OrganizationBase):
    """Create organization request"""
    pass
    
    @validator('slug')
    def validate_slug(cls, v):
        """Validate slug format"""
        if not v.islower():
            raise ValueError('slug must be lowercase')
        if '--' in v:
            raise ValueError('slug cannot contain consecutive dashes')
        if v.startswith('-') or v.endswith('-'):
            raise ValueError('slug cannot start or end with dash')
        return v


class OrganizationUpdate(BaseModel):
    """Update organization request"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255, pattern=r'^[a-z0-9-]+$')
    is_active: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None


class Organization(OrganizationBase):
    """Organization response"""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OrganizationWithStats(Organization):
    """Organization with statistics"""
    enabled_modules_count: int = 0
    total_members: int = 0


# ============= Organization Module Schemas =============

class OrganizationModuleBase(BaseModel):
    """Base module schema"""
    module_key: str = Field(..., min_length=1, max_length=50)
    is_enabled: bool = False
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict)


class OrganizationModuleCreate(OrganizationModuleBase):
    """Create module configuration"""
    organization_id: UUID


class OrganizationModuleUpdate(BaseModel):
    """Update module configuration"""
    is_enabled: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None


class OrganizationModule(OrganizationModuleBase):
    """Module response"""
    id: UUID
    organization_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class ToggleModuleRequest(BaseModel):
    """Toggle module enabled/disabled"""
    module_key: str = Field(..., min_length=1, max_length=50)
    is_enabled: bool
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict)


# ============= Organization Member Schemas =============

class OrganizationMemberBase(BaseModel):
    """Base member schema"""
    user_email: EmailStr
    role: str = Field(default="member", pattern=r'^(admin|member|viewer)$')


class OrganizationMemberCreate(OrganizationMemberBase):
    """Create member (invitation)"""
    organization_id: UUID


class InviteMemberRequest(BaseModel):
    """Invite member to organization"""
    email: EmailStr
    role: str = Field(default="member", pattern=r'^(admin|member|viewer)$')


class OrganizationMemberUpdate(BaseModel):
    """Update member"""
    role: Optional[str] = Field(None, pattern=r'^(admin|member|viewer)$')


class OrganizationMember(OrganizationMemberBase):
    """Member response"""
    id: UUID
    organization_id: UUID
    invited_by: Optional[UUID] = None
    joined_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= Active Organization Context =============

class ActiveOrganizationContext(BaseModel):
    """Active organization context for users"""
    organization: Optional[Organization] = None
    enabled_modules: List[str] = Field(default_factory=list)
    user_role: Optional[str] = None


# ============= List Responses =============

class OrganizationList(BaseModel):
    """List of organizations"""
    items: List[OrganizationWithStats]
    total: int


class OrganizationModuleList(BaseModel):
    """List of organization modules"""
    items: List[OrganizationModule]
    total: int


class OrganizationMemberList(BaseModel):
    """List of organization members"""
    items: List[OrganizationMember]
    total: int
