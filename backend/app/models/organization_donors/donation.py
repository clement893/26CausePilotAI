"""
Donation Model

Donation/Transaction model for organization-specific databases.
Tracks all donations made by donors.
"""

from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Text, JSON, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from decimal import Decimal

from app.core.database import Base


class Donation(Base):
    """
    Donation/Transaction model
    
    Represents a donation made by a donor.
    Tracks payment details, status, and receipt information.
    """
    __tablename__ = "donations"
    __table_args__ = (
        Index("idx_donations_donor", "donor_id"),
        Index("idx_donations_org", "organization_id"),
        Index("idx_donations_date", "payment_date"),
        Index("idx_donations_status", "payment_status"),
        Index("idx_donations_receipt", "receipt_number"),
        Index("idx_donations_campaign", "campaign_id"),
        Index("idx_donations_recurring", "recurring_donation_id"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Reference to main DB
    
    # Amount & Currency
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default='CAD', nullable=False)
    
    # Donation Type
    donation_type = Column(String(50), nullable=False, index=True)  # 'one_time', 'recurring', 'pledge', 'in_kind'
    
    # Payment Information
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=True)
    payment_status = Column(String(50), nullable=False, index=True)  # 'pending', 'completed', 'failed', 'refunded', 'cancelled'
    payment_date = Column(DateTime(timezone=True), nullable=True, index=True)
    
    # Receipt Information
    receipt_number = Column(String(50), unique=True, nullable=True, index=True)
    receipt_sent = Column(Boolean, default=False, nullable=False)
    receipt_sent_date = Column(DateTime(timezone=True), nullable=True)
    
    # Campaign & Designation
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True, index=True)
    designation = Column(String(255), nullable=True)  # Destination du don
    recurring_donation_id = Column(UUID(as_uuid=True), ForeignKey("recurring_donations.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Additional Information
    notes = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    is_tax_deductible = Column(Boolean, default=True, nullable=False)
    tax_receipt_amount = Column(Numeric(12, 2), nullable=True)  # Montant pour reçu fiscal
    
    # Metadata (JSON for flexibility)
    extra_data = Column(JSON, name='metadata', default=dict)  # Additional data (payment gateway response, etc.)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    # Using lazy='select' to avoid loading relationships automatically
    donor = relationship("Donor", back_populates="donations", lazy="select")
    payment_method = relationship("PaymentMethod", back_populates="donations", lazy="select")
    campaign = relationship("Campaign", back_populates="donations", lazy="select")
    recurring_donation = relationship("RecurringDonation", back_populates="donations", lazy="select")
    
    def __repr__(self):
        return f"<Donation(id={self.id}, donor={self.donor_id}, amount={self.amount}, status={self.payment_status})>"
    
    @property
    def is_completed(self) -> bool:
        """Check if donation is completed"""
        return self.payment_status == 'completed'
    
    @property
    def is_refunded(self) -> bool:
        """Check if donation is refunded"""
        return self.payment_status == 'refunded'
