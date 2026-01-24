"""
Donor Segment Model

Segment model for organization-specific databases.
Allows organizations to categorize donors based on criteria.
"""

from sqlalchemy import Column, String, Boolean, Text, Integer, DateTime, JSON, ForeignKey, UniqueConstraint, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class DonorSegment(Base):
    """
    Donor Segment model
    
    Segments allow organizations to categorize donors based on criteria.
    Can be automatic (based on criteria) or manual.
    """
    __tablename__ = "donor_segments"
    __table_args__ = (
        Index("idx_donor_segments_org", "organization_id"),
        Index("idx_donor_segments_name", "name"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Criteria for automatic segmentation (JSON)
    # Example: {"min_total_donated": 1000, "max_total_donated": 5000, "tags": ["major"], "is_active": true}
    criteria = Column(JSON, default=dict)
    
    # Manual assignment flag
    is_automatic = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    color = Column(String(7), nullable=True)  # Hex color for UI (e.g., "#FF5733")
    donor_count = Column(Integer, default=0, nullable=False)  # Calculated count
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    donor_segment_assignments = relationship("DonorSegmentAssignment", back_populates="segment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DonorSegment(id={self.id}, name={self.name}, org={self.organization_id})>"


class DonorSegmentAssignment(Base):
    """
    Donor Segment Assignment model
    
    Many-to-many relationship between donors and segments.
    Tracks which donors belong to which segments.
    """
    __tablename__ = "donor_segment_assignments"
    __table_args__ = (
        UniqueConstraint('donor_id', 'segment_id', name='uq_donor_segment'),
        Index("idx_donor_segment_assignments_donor", "donor_id"),
        Index("idx_donor_segment_assignments_segment", "segment_id"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    segment_id = Column(UUID(as_uuid=True), ForeignKey("donor_segments.id", ondelete="CASCADE"), nullable=False, index=True)
    
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    assigned_by = Column(Integer, nullable=True)  # FK to users.id in main DB
    
    # Relationships
    donor = relationship("Donor", back_populates="segment_assignments")
    segment = relationship("DonorSegment", back_populates="donor_segment_assignments")
    
    def __repr__(self):
        return f"<DonorSegmentAssignment(donor={self.donor_id}, segment={self.segment_id})>"
