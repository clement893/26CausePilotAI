"""
Donor Activity Model

Activity model for organization-specific databases.
Tracks all activities/interactions with donors for timeline.
"""

from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class DonorActivity(Base):
    """
    Donor Activity model
    
    Tracks all activities and interactions with donors.
    Used for timeline and activity feed.
    """
    __tablename__ = "donor_activities"
    __table_args__ = (
        Index("idx_donor_activities_donor", "donor_id"),
        Index("idx_donor_activities_created", "created_at"),
        Index("idx_donor_activities_type", "activity_type"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Reference to main DB
    
    # Activity Information
    activity_type = Column(String(50), nullable=False, index=True)  # 'donation', 'communication', 'note', 'segment_added', 'tag_added', 'profile_updated'
    activity_data = Column(JSON, default=dict)  # Activity-specific data
    
    # Performer
    performed_by = Column(Integer, nullable=True)  # FK to users.id in main DB
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    donor = relationship("Donor", back_populates="activities")
    
    def __repr__(self):
        return f"<DonorActivity(id={self.id}, donor={self.donor_id}, type={self.activity_type})>"
