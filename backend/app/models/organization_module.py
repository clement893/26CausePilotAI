"""
Organization Module Model

Manages which modules are enabled for each organization.
"""

from sqlalchemy import Column, String, Boolean, JSON, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class OrganizationModule(Base):
    """
    Organization Module configuration
    
    Controls which modules (features) are available for an organization.
    Modules: base-donateur, formulaires, campagnes, p2p, analytics, administration
    """
    __tablename__ = "organization_modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    module_key = Column(String(50), nullable=False, index=True)  # Module identifier
    is_enabled = Column(Boolean, default=False, nullable=False, index=True)
    settings = Column(JSON, default=dict)  # Module-specific settings (JSONB)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="modules")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('organization_id', 'module_key', name='uq_org_module'),
    )
    
    def __repr__(self):
        return f"<OrganizationModule(org={self.organization_id}, module={self.module_key}, enabled={self.is_enabled})>"


# Available module keys
AVAILABLE_MODULES = [
    "base-donateur",
    "formulaires",
    "campagnes",
    "p2p",
    "analytics",
    "administration",
]
