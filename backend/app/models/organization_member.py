"""
Organization Member Model

Manages members (users) belonging to organizations.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class OrganizationMember(Base):
    """
    Organization Member
    
    Links users to organizations with specific roles.
    Only SuperAdmins can add members to organizations.
    """
    __tablename__ = "organization_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_email = Column(String(255), nullable=False, index=True)
    role = Column(String(50), default="member", nullable=False)  # admin, member, viewer
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # SuperAdmin who invited (User.id is Integer)
    joined_at = Column(DateTime(timezone=True), nullable=True)  # When user accepted invitation
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="members")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('organization_id', 'user_email', name='uq_org_member'),
    )
    
    def __repr__(self):
        return f"<OrganizationMember(org={self.organization_id}, email={self.user_email}, role={self.role})>"
    
    @property
    def is_admin(self) -> bool:
        """Check if member is an admin"""
        return self.role == "admin"
    
    @property
    def has_joined(self) -> bool:
        """Check if member has accepted invitation"""
        return self.joined_at is not None


# Available roles
MEMBER_ROLES = [
    "admin",    # Can manage organization settings and members
    "member",   # Can use enabled modules
    "viewer",   # Read-only access
]
