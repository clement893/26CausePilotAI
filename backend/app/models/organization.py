"""
Organization Model

Multi-tenant organization system with separate databases per organization.
Only SuperAdmins can manage organizations.
"""

from sqlalchemy import Column, String, Boolean, Text, JSON, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Organization(Base):
    """
    Organization model
    
    Each organization has:
    - Unique slug for identification
    - Separate database connection
    - Configurable modules
    - Multiple members
    """
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    db_connection_string = Column(Text, nullable=False)  # Connection string to dedicated DB
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    settings = Column(JSON, default=dict)  # Additional settings (JSONB)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    modules = relationship("OrganizationModule", back_populates="organization", cascade="all, delete-orphan")
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Organization(id={self.id}, name={self.name}, slug={self.slug}, active={self.is_active})>"
    
    @property
    def enabled_modules_count(self) -> int:
        """Count of enabled modules"""
        return sum(1 for m in self.modules if m.is_enabled)
    
    @property
    def total_members(self) -> int:
        """Total number of members"""
        return len(self.members)
