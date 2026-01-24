"""
Donor Tag Model

Tag model for organization-specific databases.
Structured tags for categorizing donors.
Replaces JSON tags array in Donor model.
"""

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, UniqueConstraint, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class DonorTag(Base):
    """
    Donor Tag model
    
    Structured tags for categorizing donors.
    Replaces JSON tags array in Donor model.
    """
    __tablename__ = "donor_tags"
    __table_args__ = (
        UniqueConstraint('organization_id', 'name', name='uq_org_tag_name'),
        Index("idx_donor_tags_org", "organization_id"),
        Index("idx_donor_tags_name", "name"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)  # Hex color (e.g., "#FF5733")
    icon = Column(String(50), nullable=True)  # Icon name (e.g., "star", "heart")
    
    donor_count = Column(Integer, default=0, nullable=False)  # Calculated count
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    donor_tag_assignments = relationship("DonorTagAssignment", back_populates="tag", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DonorTag(id={self.id}, name={self.name}, org={self.organization_id})>"


class DonorTagAssignment(Base):
    """
    Donor Tag Assignment model
    
    Many-to-many relationship between donors and tags.
    Tracks which tags are assigned to which donors.
    """
    __tablename__ = "donor_tag_assignments"
    __table_args__ = (
        UniqueConstraint('donor_id', 'tag_id', name='uq_donor_tag'),
        Index("idx_donor_tag_assignments_donor", "donor_id"),
        Index("idx_donor_tag_assignments_tag", "tag_id"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("donor_tags.id", ondelete="CASCADE"), nullable=False, index=True)
    
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    assigned_by = Column(Integer, nullable=True)  # FK to users.id in main DB
    
    # Relationships
    donor = relationship("Donor", back_populates="tag_assignments")
    tag = relationship("DonorTag", back_populates="donor_tag_assignments")
    
    def __repr__(self):
        return f"<DonorTagAssignment(donor={self.donor_id}, tag={self.tag_id})>"
