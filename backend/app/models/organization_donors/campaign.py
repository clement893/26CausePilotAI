"""
Campaign Model

Campaign model for organization-specific databases.
Fundraising campaigns that donations can be associated with.
"""

from sqlalchemy import Column, String, Boolean, Text, DateTime, Numeric, Integer, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from decimal import Decimal

from app.core.database import Base


class Campaign(Base):
    """
    Campaign model
    
    Fundraising campaigns that donations can be associated with.
    Tracks goals, progress, and statistics.
    """
    __tablename__ = "campaigns"
    __table_args__ = (
        Index("idx_campaigns_org", "organization_id"),
        Index("idx_campaigns_status", "status"),
        Index("idx_campaigns_dates", "start_date", "end_date"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Campaign Dates
    start_date = Column(DateTime(timezone=True), nullable=True, index=True)
    end_date = Column(DateTime(timezone=True), nullable=True, index=True)
    
    # Goals
    goal_amount = Column(Numeric(12, 2), nullable=True)
    goal_donors = Column(Integer, nullable=True)
    
    # Status
    status = Column(String(50), default='draft', nullable=False, index=True)  # 'draft', 'active', 'paused', 'completed', 'cancelled'
    
    # Calculated Statistics (updated via triggers or application logic)
    total_raised = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    donor_count = Column(Integer, default=0, nullable=False)
    donation_count = Column(Integer, default=0, nullable=False)
    
    # Metadata
    image_url = Column(String(500), nullable=True)  # Campaign image
    external_url = Column(String(500), nullable=True)  # External campaign page
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    donations = relationship("Donation", back_populates="campaign")
    
    def __repr__(self):
        return f"<Campaign(id={self.id}, name={self.name}, status={self.status})>"
    
    @property
    def progress_percentage(self) -> float:
        """Calculate progress percentage based on goal"""
        if not self.goal_amount or self.goal_amount == 0:
            return 0.0
        return float((self.total_raised / self.goal_amount) * 100)
    
    @property
    def is_active(self) -> bool:
        """Check if campaign is currently active"""
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        if self.status != 'active':
            return False
        
        if self.start_date and now < self.start_date:
            return False
        
        if self.end_date and now > self.end_date:
            return False
        
        return True
    
    @property
    def days_remaining(self) -> int:
        """Calculate days remaining in campaign"""
        from datetime import datetime, timezone
        if not self.end_date:
            return None
        
        now = datetime.now(timezone.utc)
        if now > self.end_date:
            return 0
        
        delta = self.end_date - now
        return delta.days
