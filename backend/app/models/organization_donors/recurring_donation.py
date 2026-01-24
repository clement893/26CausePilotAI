"""
Recurring Donation Model

Recurring donation model for organization-specific databases.
Manages recurring donation subscriptions.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Integer, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from decimal import Decimal

from app.core.database import Base


class RecurringDonation(Base):
    """
    Recurring Donation model
    
    Manages recurring donation subscriptions.
    Tracks frequency, next payment date, and status.
    """
    __tablename__ = "recurring_donations"
    __table_args__ = (
        Index("idx_recurring_donations_donor", "donor_id"),
        Index("idx_recurring_donations_org", "organization_id"),
        Index("idx_recurring_donations_status", "status"),
        Index("idx_recurring_donations_next_payment", "next_payment_date"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Amount & Frequency
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default='CAD', nullable=False)
    frequency = Column(String(50), nullable=False, index=True)  # 'monthly', 'quarterly', 'yearly', 'weekly'
    
    # Payment Method
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=False)
    
    # Dates
    start_date = Column(DateTime(timezone=True), nullable=False)
    next_payment_date = Column(DateTime(timezone=True), nullable=False, index=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    status = Column(String(50), default='active', nullable=False, index=True)  # 'active', 'paused', 'cancelled', 'failed'
    
    # Statistics
    total_payments = Column(Integer, default=0, nullable=False)
    total_amount = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    last_payment_date = Column(DateTime(timezone=True), nullable=True)
    
    # Failure tracking
    consecutive_failures = Column(Integer, default=0, nullable=False)
    last_failure_reason = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    donor = relationship("Donor", back_populates="recurring_donations")
    payment_method = relationship("PaymentMethod")
    donations = relationship("Donation", back_populates="recurring_donation")
    
    def __repr__(self):
        return f"<RecurringDonation(id={self.id}, donor={self.donor_id}, amount={self.amount}, frequency={self.frequency})>"
    
    @property
    def is_active(self) -> bool:
        """Check if recurring donation is active"""
        return self.status == 'active'
    
    @property
    def is_due(self) -> bool:
        """Check if next payment is due"""
        from datetime import datetime, timezone
        if not self.is_active:
            return False
        
        now = datetime.now(timezone.utc)
        return self.next_payment_date <= now
    
    def calculate_next_payment_date(self):
        """Calculate next payment date based on frequency"""
        from datetime import timedelta
        
        if not self.last_payment_date:
            base_date = self.start_date
        else:
            base_date = self.last_payment_date
        
        if self.frequency == 'weekly':
            return base_date + timedelta(weeks=1)
        elif self.frequency == 'monthly':
            return base_date + timedelta(days=30)  # Approximate
        elif self.frequency == 'quarterly':
            return base_date + timedelta(days=90)  # Approximate
        elif self.frequency == 'yearly':
            return base_date + timedelta(days=365)
        else:
            return base_date
