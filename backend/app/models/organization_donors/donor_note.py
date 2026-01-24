"""
Donor Note Model

Note model for organization-specific databases.
Stores notes and interactions with donors.
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class DonorNote(Base):
    """
    Donor Note model
    
    Stores notes and interactions with donors.
    Can be private (visible only to creator) or public (visible to all org members).
    """
    __tablename__ = "donor_notes"
    __table_args__ = (
        Index("idx_donor_notes_donor", "donor_id"),
        Index("idx_donor_notes_created", "created_at"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Reference to main DB
    
    # Note Content
    note = Column(Text, nullable=False)
    note_type = Column(String(50), default='general', nullable=False)  # 'general', 'call', 'meeting', 'email', 'other'
    
    # Creator & Privacy
    created_by = Column(Integer, nullable=True)  # FK to users.id in main DB
    is_private = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Relationships
    donor = relationship("Donor", back_populates="notes")
    
    def __repr__(self):
        return f"<DonorNote(id={self.id}, donor={self.donor_id}, type={self.note_type})>"
