"""
Donor Communication Model

Communication model for organization-specific databases.
Tracks all communications with donors (emails, SMS, calls, letters).
"""

from sqlalchemy import Column, String, Text, DateTime, Integer, JSON, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class DonorCommunication(Base):
    """
    Donor Communication model
    
    Tracks all communications with donors (emails, SMS, calls, letters).
    Includes status tracking for delivery, opens, clicks, etc.
    """
    __tablename__ = "donor_communications"
    __table_args__ = (
        Index("idx_donor_communications_donor", "donor_id"),
        Index("idx_donor_communications_org", "organization_id"),
        Index("idx_donor_communications_type", "communication_type"),
        Index("idx_donor_communications_status", "status"),
        Index("idx_donor_communications_sent", "sent_at"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Communication Type
    communication_type = Column(String(50), nullable=False, index=True)  # 'email', 'sms', 'letter', 'phone', 'in_person'
    
    # Content
    subject = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    
    # Status Tracking
    status = Column(String(50), default='sent', nullable=False, index=True)  # 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    
    # Timestamps
    sent_at = Column(DateTime(timezone=True), nullable=True, index=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    
    # Sender
    sent_by = Column(Integer, nullable=True)  # FK to users.id in main DB
    
    # Metadata (email provider response, SMS delivery status, etc.)
    # Python attr 'communication_metadata' to avoid SQLAlchemy reserved 'metadata'
    communication_metadata = Column(JSON, name="metadata", default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    donor = relationship("Donor", back_populates="communications")
    
    def __repr__(self):
        return f"<DonorCommunication(id={self.id}, type={self.communication_type}, status={self.status})>"
    
    @property
    def is_delivered(self) -> bool:
        """Check if communication was delivered"""
        return self.status in ['delivered', 'opened', 'clicked']
    
    @property
    def is_failed(self) -> bool:
        """Check if communication failed"""
        return self.status in ['bounced', 'failed']
